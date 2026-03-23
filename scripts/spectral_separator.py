#!/usr/bin/env python3
"""
OMNIMENS Universal Spectral Source Separator
Works on ANY sound — vocals, instruments, noise, anything.

Takes an audio file + a JSON config specifying which frequency bins to keep/remove
and their target gains. The Spectral Color Engine on the server provides the bin map.

Usage:
  python3 spectral_separator.py <input> <output> <config_json>

Config JSON format:
{
  "mode": "remove" | "isolate" | "solo",
  "targetBins": [list of bin indices to target],
  "binGains": {bin_index: gain_value, ...},
  "n_fft": 4096,
  "hop_length": 1024,
  "smoothing": 7,
  "stereo_mode": "mid_side" | "per_channel"
}
"""

import sys
import os
import json
import numpy as np
import soundfile as sf
from scipy import signal as scipy_signal
import subprocess


def load_audio(path):
    ext = os.path.splitext(path)[1].lower()
    if ext in ('.mp3', '.m4a', '.aac', '.ogg', '.flac'):
        tmp_wav = "/tmp/spectral_sep_input.wav"
        subprocess.run([
            "ffmpeg", "-y", "-i", path,
            "-ar", "44100", "-ac", "2", "-sample_fmt", "s16",
            tmp_wav
        ], capture_output=True, check=True)
        data, sr = sf.read(tmp_wav)
    else:
        data, sr = sf.read(path)
    if data.ndim == 1:
        data = np.stack([data, data], axis=1)
    return data.T, sr


def stft(x, n_fft, hop_length):
    window = scipy_signal.windows.hann(n_fft, sym=False)
    n_frames = 1 + (len(x) - n_fft) // hop_length
    S = np.zeros((n_fft // 2 + 1, n_frames), dtype=np.complex128)
    for i in range(n_frames):
        start = i * hop_length
        frame = x[start:start + n_fft] * window
        S[:, i] = np.fft.rfft(frame, n=n_fft)
    return S


def istft(S, hop_length, n_fft, length=None):
    window = scipy_signal.windows.hann(n_fft, sym=False)
    n_frames = S.shape[1]
    expected_length = n_fft + hop_length * (n_frames - 1)
    if length is None:
        length = expected_length
    y = np.zeros(max(length, expected_length))
    window_sum = np.zeros(max(length, expected_length))
    for i in range(n_frames):
        start = i * hop_length
        frame = np.fft.irfft(S[:, i])[:n_fft]
        y[start:start + n_fft] += frame * window
        window_sum[start:start + n_fft] += window ** 2
    nonzero = window_sum > 1e-8
    y[nonzero] /= window_sum[nonzero]
    return y[:length]


def build_spectral_mask(n_freq_bins, n_frames, config, S_mid_mag, S_side_mag, freqs, sr):
    """
    Build a per-bin, per-frame suppression mask.
    Uses mid/side dominance to be smart about shared frequencies.
    """
    mode = config.get("mode", "remove")
    bin_gains = config.get("binGains", {})
    target_bins = set(config.get("targetBins", []))
    smoothing = config.get("smoothing", 7)
    spectral_bins = config.get("spectralBins", 256)
    max_freq = config.get("maxFreq", 22050)

    mask = np.ones((n_freq_bins, n_frames), dtype=np.float64)

    if not target_bins and not bin_gains:
        return mask

    bin_width_spectral = max_freq / spectral_bins
    eps = 1e-10

    mid_energy = S_mid_mag ** 2
    side_energy = S_side_mag ** 2 + eps
    center_dominance = mid_energy / (mid_energy + side_energy)

    for stft_bin in range(n_freq_bins):
        freq = freqs[stft_bin]
        spectral_bin_idx = int(freq / bin_width_spectral) if bin_width_spectral > 0 else 0

        if spectral_bin_idx in target_bins or str(spectral_bin_idx) in bin_gains:
            gain = float(bin_gains.get(str(spectral_bin_idx), bin_gains.get(spectral_bin_idx, 0.0)))

            if mode == "remove":
                cd = center_dominance[stft_bin, :]
                suppress = np.where(cd > 0.4, gain, gain + (1.0 - gain) * (1.0 - cd / 0.4))
                suppress = np.clip(suppress, gain, 1.0)
                mask[stft_bin, :] = suppress
            elif mode == "isolate":
                mask[stft_bin, :] = gain
            elif mode == "solo":
                mask[stft_bin, :] = gain
            else:
                mask[stft_bin, :] = gain

    for adjacent in range(n_freq_bins):
        freq = freqs[adjacent]
        spectral_bin_idx = int(freq / bin_width_spectral) if bin_width_spectral > 0 else 0
        if spectral_bin_idx not in target_bins and str(spectral_bin_idx) not in bin_gains:
            if mode == "isolate":
                mask[adjacent, :] = 0.02
            elif mode == "solo":
                is_near_target = False
                for tb in target_bins:
                    if abs(spectral_bin_idx - tb) <= 2:
                        is_near_target = True
                        break
                if not is_near_target:
                    mask[adjacent, :] = 0.15

    if smoothing > 1:
        kernel = np.ones(smoothing) / smoothing
        for i in range(n_freq_bins):
            mask[i] = np.convolve(mask[i], kernel, mode='same')
        kernel_f = np.ones(3) / 3
        for j in range(n_frames):
            mask[:, j] = np.convolve(mask[:, j], kernel_f, mode='same')

    return np.clip(mask, 0, 1)


def process(y, sr, config):
    n_fft = config.get("n_fft", 4096)
    hop_length = config.get("hop_length", 1024)
    stereo_mode = config.get("stereo_mode", "mid_side")

    left, right = y[0], y[1]

    if stereo_mode == "mid_side":
        mid = (left + right) / 2.0
        side = (left - right) / 2.0

        S_mid = stft(mid, n_fft, hop_length)
        S_side = stft(side, n_fft, hop_length)

        S_mid_mag = np.abs(S_mid)
        S_mid_phase = np.angle(S_mid)
        S_side_mag = np.abs(S_side)

        freqs = np.fft.rfftfreq(n_fft, d=1.0/sr)

        mask = build_spectral_mask(
            S_mid.shape[0], S_mid.shape[1], config,
            S_mid_mag, S_side_mag, freqs, sr
        )

        S_mid_processed = (S_mid_mag * mask) * np.exp(1j * S_mid_phase)
        mid_out = istft(S_mid_processed, hop_length, n_fft, length=len(mid))

        left_out = mid_out + side
        right_out = mid_out - side

        mode = config.get("mode", "remove")
        if mode == "isolate":
            S_side_processed = stft(side, n_fft, hop_length)
            S_side_processed_mag = np.abs(S_side_processed)
            S_side_processed_phase = np.angle(S_side_processed)
            side_mask = build_spectral_mask(
                S_side_processed.shape[0], S_side_processed.shape[1], config,
                S_side_processed_mag, S_mid_mag, freqs, sr
            )
            S_side_out = (S_side_processed_mag * side_mask) * np.exp(1j * S_side_processed_phase)
            side_out = istft(S_side_out, hop_length, n_fft, length=len(side))
            left_out = mid_out + side_out
            right_out = mid_out - side_out
    else:
        S_left = stft(left, n_fft, hop_length)
        S_right = stft(right, n_fft, hop_length)
        freqs = np.fft.rfftfreq(n_fft, d=1.0/sr)

        mask_l = build_spectral_mask(
            S_left.shape[0], S_left.shape[1], config,
            np.abs(S_left), np.abs(S_right), freqs, sr
        )
        mask_r = build_spectral_mask(
            S_right.shape[0], S_right.shape[1], config,
            np.abs(S_right), np.abs(S_left), freqs, sr
        )

        S_left_out = (np.abs(S_left) * mask_l) * np.exp(1j * np.angle(S_left))
        S_right_out = (np.abs(S_right) * mask_r) * np.exp(1j * np.angle(S_right))

        left_out = istft(S_left_out, hop_length, n_fft, length=len(left))
        right_out = istft(S_right_out, hop_length, n_fft, length=len(right))

    output = np.stack([left_out, right_out])
    orig_peak = np.max(np.abs(y))
    out_peak = np.max(np.abs(output))
    if out_peak > 0:
        output *= (orig_peak / out_peak) * 0.95
    output = np.clip(output, -1.0, 1.0)

    return output


def main():
    if len(sys.argv) < 4:
        print("Usage: python3 spectral_separator.py <input> <output> <config_json>")
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = sys.argv[2]
    config_path = sys.argv[3]

    with open(config_path, 'r') as f:
        config = json.load(f)

    y, sr = load_audio(input_path)
    print(f"Loaded: {y.shape[1]/sr:.1f}s, {sr}Hz, stereo")

    result = process(y, sr, config)

    sf.write(output_path, result.T, sr, subtype='PCM_24')
    size_mb = os.path.getsize(output_path) / (1024*1024)
    print(f"Output: {output_path} ({size_mb:.1f}MB)")

    rms_orig = np.sqrt(np.mean(y ** 2))
    rms_out = np.sqrt(np.mean(result ** 2))
    print(f"RMS: {rms_orig:.4f} -> {rms_out:.4f} ({20*np.log10(rms_out/(rms_orig+1e-10)):.1f}dB)")
    print("Done")


if __name__ == "__main__":
    main()
