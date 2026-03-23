#!/usr/bin/env python3
"""
OMNIMENS Universal Spectral Source Separator v2.0
Fine-tuned with Wiener filtering, harmonic-aware masking,
frequency-dependent smoothing, and phase-aware reconstruction.

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
  "stereo_mode": "mid_side" | "per_channel",
  "wiener_power": 2.0,
  "harmonic_protection": true,
  "phase_aware": true
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
    if len(x) < n_fft:
        x = np.pad(x, (0, n_fft - len(x)), mode='constant')
    n_frames = max(1, 1 + (len(x) - n_fft) // hop_length)
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


def detect_harmonics(freqs, S_mag, fundamental_bins, n_harmonics=16):
    """Detect harmonic series from fundamental frequencies for protection."""
    harmonic_mask = np.zeros(len(freqs), dtype=bool)
    for fund_bin in fundamental_bins:
        fund_freq = freqs[fund_bin]
        if fund_freq < 20:
            continue
        for h in range(1, n_harmonics + 1):
            target_freq = fund_freq * h
            tolerance = max(target_freq * 0.03, 15)
            matching = np.abs(freqs - target_freq) < tolerance
            harmonic_mask |= matching
    return harmonic_mask


def build_spectral_mask(n_freq_bins, n_frames, config, S_mid_mag, S_side_mag, freqs, sr):
    mode = config.get("mode", "remove")
    bin_gains = config.get("binGains", {})
    target_bins = set(config.get("targetBins", []))
    smoothing = config.get("smoothing", 7)
    spectral_bins = config.get("spectralBins", 256)
    max_freq = config.get("maxFreq", 22050)
    wiener_power = config.get("wiener_power", 2.0)
    harmonic_protection = config.get("harmonic_protection", True)

    mask = np.ones((n_freq_bins, n_frames), dtype=np.float64)

    if not target_bins and not bin_gains:
        return mask

    bin_width_spectral = max_freq / spectral_bins
    eps = 1e-10

    mid_energy = S_mid_mag ** 2 + eps
    side_energy = S_side_mag ** 2 + eps
    total_energy = mid_energy + side_energy
    center_dominance = mid_energy / total_energy

    avg_mid = np.mean(S_mid_mag, axis=1)
    fundamental_stft_bins = []
    for sb in target_bins:
        sb_freq = sb * bin_width_spectral + bin_width_spectral / 2
        closest = np.argmin(np.abs(freqs - sb_freq))
        if avg_mid[closest] > np.median(avg_mid) * 0.5:
            fundamental_stft_bins.append(closest)

    harmonic_mask = np.zeros(n_freq_bins, dtype=bool)
    if harmonic_protection and fundamental_stft_bins:
        harmonic_mask = detect_harmonics(freqs, avg_mid, fundamental_stft_bins)

    for stft_bin in range(n_freq_bins):
        freq = freqs[stft_bin]
        spectral_bin_idx = int(freq / bin_width_spectral) if bin_width_spectral > 0 else 0
        spectral_bin_idx = min(spectral_bin_idx, spectral_bins - 1)

        is_target = spectral_bin_idx in target_bins or str(spectral_bin_idx) in bin_gains
        if not is_target:
            if mode == "isolate":
                if harmonic_mask[stft_bin]:
                    mask[stft_bin, :] = 0.15
                else:
                    mask[stft_bin, :] = 0.01
            elif mode == "solo":
                is_near = any(abs(spectral_bin_idx - tb) <= 2 for tb in target_bins)
                if is_near:
                    mask[stft_bin, :] = 0.5
                elif harmonic_mask[stft_bin]:
                    mask[stft_bin, :] = 0.25
                else:
                    mask[stft_bin, :] = 0.08
            continue

        gain = float(bin_gains.get(str(spectral_bin_idx), bin_gains.get(spectral_bin_idx, 0.0)))

        if mode == "remove":
            cd = center_dominance[stft_bin, :]
            if freq < 200:
                suppress = np.where(cd > 0.6, gain, gain + (1.0 - gain) * 0.7)
            elif freq < 4000:
                wiener_target = S_mid_mag[stft_bin, :] ** wiener_power
                wiener_total = (S_mid_mag[stft_bin, :] ** wiener_power +
                                S_side_mag[stft_bin, :] ** wiener_power + eps)
                wiener_ratio = wiener_target / wiener_total
                suppress = gain + (1.0 - gain) * (1.0 - wiener_ratio * cd)
                suppress = np.clip(suppress, gain, 1.0)
            else:
                suppress = np.where(cd > 0.5, gain * 0.8, gain + (1.0 - gain) * 0.6)

            suppress = np.clip(suppress, gain, 1.0)
            mask[stft_bin, :] = suppress

        elif mode == "isolate":
            cd = center_dominance[stft_bin, :]
            if freq < 200:
                mask[stft_bin, :] = gain * 0.7
            elif freq < 4000:
                wiener_target = S_mid_mag[stft_bin, :] ** wiener_power
                wiener_total = (S_mid_mag[stft_bin, :] ** wiener_power +
                                S_side_mag[stft_bin, :] ** wiener_power + eps)
                wiener_ratio = wiener_target / wiener_total
                mask[stft_bin, :] = gain * wiener_ratio * np.where(cd > 0.3, 1.0, cd / 0.3)
            else:
                mask[stft_bin, :] = gain * cd * 0.8
        else:
            mask[stft_bin, :] = gain

    if smoothing > 1:
        freq_smooth = np.clip(smoothing // 2, 1, 5)
        time_smooth = smoothing

        time_kernel = np.ones(time_smooth) / time_smooth
        for i in range(n_freq_bins):
            mask[i] = np.convolve(mask[i], time_kernel, mode='same')

        freq_kernel = np.array([0.1, 0.2, 0.4, 0.2, 0.1])[:freq_smooth * 2 + 1]
        if len(freq_kernel) < 3:
            freq_kernel = np.array([0.25, 0.5, 0.25])
        freq_kernel = freq_kernel / freq_kernel.sum()
        for j in range(n_frames):
            mask[:, j] = np.convolve(mask[:, j], freq_kernel, mode='same')

    max_gain = max(float(bin_gains.get(str(sb), bin_gains.get(sb, 1.0))) for sb in target_bins) if target_bins else 1.0
    max_gain = max(max_gain, 1.0)
    return np.clip(mask, 0, max_gain)


def process(y, sr, config):
    n_fft = config.get("n_fft", 4096)
    hop_length = config.get("hop_length", 1024)
    stereo_mode = config.get("stereo_mode", "mid_side")
    phase_aware = config.get("phase_aware", True)

    left, right = y[0], y[1]

    if stereo_mode == "mid_side":
        mid = (left + right) / 2.0
        side = (left - right) / 2.0

        S_mid = stft(mid, n_fft, hop_length)
        S_side = stft(side, n_fft, hop_length)

        S_mid_mag = np.abs(S_mid)
        S_mid_phase = np.angle(S_mid)
        S_side_mag = np.abs(S_side)
        S_side_phase = np.angle(S_side)

        freqs = np.fft.rfftfreq(n_fft, d=1.0 / sr)

        mask_mid = build_spectral_mask(
            S_mid.shape[0], S_mid.shape[1], config,
            S_mid_mag, S_side_mag, freqs, sr
        )

        if phase_aware:
            phase_diff = np.abs(S_mid_phase - S_side_phase)
            phase_coherence = np.cos(phase_diff)
            phase_weight = np.clip(phase_coherence * 0.1, -0.05, 0.05)
            mode = config.get("mode", "remove")
            if mode == "remove":
                mask_mid = np.clip(mask_mid + phase_weight, 0, 1)
            elif mode == "isolate":
                mask_mid = np.clip(mask_mid - phase_weight * 0.5, 0, 1)

        S_mid_processed = (S_mid_mag * mask_mid) * np.exp(1j * S_mid_phase)
        mid_out = istft(S_mid_processed, hop_length, n_fft, length=len(mid))

        mode = config.get("mode", "remove")
        if mode in ("isolate", "solo"):
            mask_side = build_spectral_mask(
                S_side.shape[0], S_side.shape[1], config,
                S_side_mag, S_mid_mag, freqs, sr
            )
            S_side_processed = (S_side_mag * mask_side) * np.exp(1j * S_side_phase)
            side_out = istft(S_side_processed, hop_length, n_fft, length=len(side))
            left_out = mid_out + side_out
            right_out = mid_out - side_out
        else:
            left_out = mid_out + side
            right_out = mid_out - side
    else:
        S_left = stft(left, n_fft, hop_length)
        S_right = stft(right, n_fft, hop_length)
        freqs = np.fft.rfftfreq(n_fft, d=1.0 / sr)

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

    orig_rms = np.sqrt(np.mean(y ** 2))
    out_rms = np.sqrt(np.mean(output ** 2))
    if out_rms > 0:
        output *= (orig_rms / out_rms) * 0.92

    orig_peak = np.max(np.abs(y))
    out_peak = np.max(np.abs(output))
    if out_peak > orig_peak * 0.98:
        output *= (orig_peak * 0.95) / (out_peak + 1e-10)

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
    print(f"Loaded: {y.shape[1] / sr:.1f}s, {sr}Hz, stereo")

    result = process(y, sr, config)

    sf.write(output_path, result.T, sr, subtype='PCM_24')
    size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print(f"Output: {output_path} ({size_mb:.1f}MB)")

    rms_orig = np.sqrt(np.mean(y ** 2))
    rms_out = np.sqrt(np.mean(result ** 2))
    print(f"RMS: {rms_orig:.4f} -> {rms_out:.4f} ({20 * np.log10(rms_out / (rms_orig + 1e-10)):.1f}dB)")
    print("Done")


if __name__ == "__main__":
    main()
