#!/usr/bin/env python3
"""
OMNIMENS Spectral Vocal Removal Engine v3.0
Universal vocal removal using multi-technique spectral processing.
Uses only numpy/scipy/soundfile — no librosa/numba dependency.

Techniques:
1. Mid/Side decomposition — vocals are typically center-panned
2. STFT spectral masking — vocal formant frequency suppression with soft masks  
3. Adaptive spectral gating — only suppress bins where vocal energy dominates
4. Phase-aware reconstruction — preserves stereo field integrity
5. Temporal + spectral smoothing — prevents musical noise artifacts
"""

import sys
import os
import numpy as np
import soundfile as sf
from scipy import signal as scipy_signal
import subprocess

INPUT_FILE = sys.argv[1] if len(sys.argv) > 1 else "/home/runner/workspace/attached_assets/J.Cole_-_Truly_Yours_Remixed_By_HotBox_(1)_1774222584472.mp3"
OUTPUT_INSTRUMENTAL = sys.argv[2] if len(sys.argv) > 2 else "/home/runner/workspace/TrulyYours_INSTRUMENTAL_v3.wav"
OUTPUT_VOCALS = sys.argv[3] if len(sys.argv) > 3 else "/home/runner/workspace/TrulyYours_VOCALS_v3.wav"

N_FFT = 4096
HOP_LENGTH = 1024
WIN_LENGTH = 4096

VOCAL_LOW = 85
VOCAL_HIGH = 12000
FORMANT_LOW = 250
FORMANT_HIGH = 4000
SIBILANCE_LOW = 4000
SIBILANCE_HIGH = 12000

CENTER_SUPPRESS = 0.06
FORMANT_SUPPRESS = 0.12
SIBILANCE_SUPPRESS = 0.20
MASK_POWER = 2.0
VOCAL_DOMINANCE_THRESHOLD = 0.35


def load_audio(path):
    """Load audio file. Uses ffmpeg for mp3, soundfile for wav."""
    print(f"Loading: {path}")
    ext = os.path.splitext(path)[1].lower()
    
    if ext in ('.mp3', '.m4a', '.aac', '.ogg', '.flac'):
        tmp_wav = "/tmp/vocal_remove_input.wav"
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
    
    y = data.T
    print(f"  Loaded: {y.shape[1]/sr:.1f}s, {sr}Hz, {y.shape[0]} channels")
    return y, sr


def stft(x, n_fft, hop_length, win_length):
    """Short-Time Fourier Transform."""
    window = scipy_signal.windows.hann(win_length, sym=False)
    n_frames = 1 + (len(x) - win_length) // hop_length
    S = np.zeros((n_fft // 2 + 1, n_frames), dtype=np.complex128)
    
    for i in range(n_frames):
        start = i * hop_length
        frame = x[start:start + win_length] * window
        spectrum = np.fft.rfft(frame, n=n_fft)
        S[:, i] = spectrum
    
    return S


def istft(S, hop_length, win_length, length=None):
    """Inverse Short-Time Fourier Transform with overlap-add."""
    window = scipy_signal.windows.hann(win_length, sym=False)
    n_frames = S.shape[1]
    expected_length = win_length + hop_length * (n_frames - 1)
    
    if length is None:
        length = expected_length
    
    y = np.zeros(max(length, expected_length))
    window_sum = np.zeros(max(length, expected_length))
    
    for i in range(n_frames):
        start = i * hop_length
        frame = np.fft.irfft(S[:, i])[:win_length]
        y[start:start + win_length] += frame * window
        window_sum[start:start + win_length] += window ** 2
    
    nonzero = window_sum > 1e-8
    y[nonzero] /= window_sum[nonzero]
    
    return y[:length]


def compute_vocal_mask(S_mid_mag, S_side_mag, freqs):
    """
    Compute soft mask identifying vocal-dominant bins.
    Returns suppression mask (0 = full suppress, 1 = keep).
    """
    n_freq, n_frames = S_mid_mag.shape
    mask = np.ones((n_freq, n_frames), dtype=np.float64)
    
    eps = 1e-10
    mid_energy = S_mid_mag ** MASK_POWER
    side_energy = S_side_mag ** MASK_POWER + eps
    
    vocal_dominance = mid_energy / (mid_energy + side_energy)
    
    for i in range(n_freq):
        freq = freqs[i]
        
        if freq < VOCAL_LOW or freq > VOCAL_HIGH:
            continue
        
        if FORMANT_LOW <= freq <= FORMANT_HIGH:
            freq_suppress = FORMANT_SUPPRESS
        elif freq < FORMANT_LOW:
            t = (freq - VOCAL_LOW) / max(1, FORMANT_LOW - VOCAL_LOW)
            freq_suppress = 1.0 - t * (1.0 - FORMANT_SUPPRESS)
        elif SIBILANCE_LOW <= freq <= SIBILANCE_HIGH:
            freq_suppress = SIBILANCE_SUPPRESS
        else:
            t = (freq - FORMANT_HIGH) / max(1, SIBILANCE_LOW - FORMANT_HIGH)
            freq_suppress = FORMANT_SUPPRESS + t * (SIBILANCE_SUPPRESS - FORMANT_SUPPRESS)
        
        vd = vocal_dominance[i, :]
        
        above_threshold = vd > VOCAL_DOMINANCE_THRESHOLD
        dominance_scale = np.clip(
            (vd - VOCAL_DOMINANCE_THRESHOLD) / (1.0 - VOCAL_DOMINANCE_THRESHOLD),
            0, 1
        )
        
        suppress_values = freq_suppress + (1.0 - freq_suppress) * (1.0 - dominance_scale)
        mask[i, above_threshold] = suppress_values[above_threshold]
    
    return mask


def smooth_mask(mask, time_smooth=7, freq_smooth=5):
    """Smooth mask along both axes to prevent artifacts."""
    smoothed = mask.copy()
    
    if time_smooth > 1:
        kernel_t = np.ones(time_smooth) / time_smooth
        for i in range(mask.shape[0]):
            smoothed[i] = np.convolve(smoothed[i], kernel_t, mode='same')
    
    if freq_smooth > 1:
        kernel_f = np.ones(freq_smooth) / freq_smooth
        for j in range(mask.shape[1]):
            smoothed[:, j] = np.convolve(smoothed[:, j], kernel_f, mode='same')
    
    return np.clip(smoothed, 0, 1)


def process(y, sr):
    """Main vocal removal pipeline."""
    left, right = y[0], y[1]
    
    print("Step 1: Mid/Side decomposition...")
    mid = (left + right) / 2.0
    side = (left - right) / 2.0
    
    print(f"Step 2: Computing STFT (FFT={N_FFT}, hop={HOP_LENGTH})...")
    S_mid = stft(mid, N_FFT, HOP_LENGTH, WIN_LENGTH)
    S_side = stft(side, N_FFT, HOP_LENGTH, WIN_LENGTH)
    
    S_mid_mag = np.abs(S_mid)
    S_mid_phase = np.angle(S_mid)
    S_side_mag = np.abs(S_side)
    
    freqs = np.fft.rfftfreq(N_FFT, d=1.0/sr)
    print(f"  Freq resolution: {freqs[1]:.1f}Hz/bin, {len(freqs)} bins, {S_mid.shape[1]} frames")
    
    print("Step 3: Computing adaptive vocal mask...")
    vocal_mask = compute_vocal_mask(S_mid_mag, S_side_mag, freqs)
    
    # Count how many bins are being suppressed
    suppressed = np.sum(vocal_mask < 0.5)
    total = vocal_mask.size
    print(f"  Suppressing {suppressed}/{total} time-freq bins ({100*suppressed/total:.1f}%)")
    
    print("Step 4: Smoothing mask...")
    vocal_mask = smooth_mask(vocal_mask, time_smooth=7, freq_smooth=5)
    
    print("Step 5: Applying vocal suppression...")
    
    # Instrumental: suppress center-panned vocals
    # Apply mask to mid channel magnitude, then additional global center reduction
    S_mid_clean_mag = S_mid_mag * vocal_mask
    
    # Additional pass: for bins in vocal range, also apply global center reduction
    # This catches any remaining vocal energy that leaked through the adaptive mask
    for i in range(len(freqs)):
        freq = freqs[i]
        if VOCAL_LOW <= freq <= VOCAL_HIGH:
            # Gentle additional center reduction (keeps some center instruments)
            S_mid_clean_mag[i] *= (CENTER_SUPPRESS + (1.0 - CENTER_SUPPRESS) * vocal_mask[i])
    
    S_mid_clean = S_mid_clean_mag * np.exp(1j * S_mid_phase)
    
    # Vocal isolation: inverse mask
    vocal_iso_mask = np.clip(1.0 - vocal_mask, 0, 1)
    S_mid_vocal_mag = S_mid_mag * vocal_iso_mask
    S_mid_vocal = S_mid_vocal_mag * np.exp(1j * S_mid_phase)
    
    print("Step 6: Inverse STFT reconstruction...")
    mid_clean = istft(S_mid_clean, HOP_LENGTH, WIN_LENGTH, length=len(mid))
    mid_vocal = istft(S_mid_vocal, HOP_LENGTH, WIN_LENGTH, length=len(mid))
    
    # Reconstruct stereo: keep side channel intact for instrumental
    left_inst = mid_clean + side
    right_inst = mid_clean - side
    
    # Vocals: mono-ish (only mid channel vocal content)
    left_vocal = mid_vocal
    right_vocal = mid_vocal
    
    print("Step 7: Normalizing output...")
    instrumental = np.stack([left_inst, right_inst])
    vocals = np.stack([left_vocal, right_vocal])
    
    # Match peak level
    orig_peak = np.max(np.abs(y))
    inst_peak = np.max(np.abs(instrumental))
    if inst_peak > 0:
        instrumental *= (orig_peak / inst_peak) * 0.95
    
    voc_peak = np.max(np.abs(vocals))
    if voc_peak > 0:
        vocals *= (orig_peak / voc_peak) * 0.85
    
    instrumental = np.clip(instrumental, -1.0, 1.0)
    vocals = np.clip(vocals, -1.0, 1.0)
    
    return instrumental, vocals


def quality_report(original, instrumental, vocals, sr):
    """Print quality metrics."""
    orig_rms = np.sqrt(np.mean(original ** 2))
    inst_rms = np.sqrt(np.mean(instrumental ** 2))
    voc_rms = np.sqrt(np.mean(vocals ** 2))
    
    print("\n=== Quality Report ===")
    print(f"  Original RMS:     {orig_rms:.6f}")
    print(f"  Instrumental RMS: {inst_rms:.6f} ({20*np.log10(inst_rms/(orig_rms+1e-10)):.1f} dB)")
    print(f"  Vocals RMS:       {voc_rms:.6f} ({20*np.log10(voc_rms/(orig_rms+1e-10)):.1f} dB)")
    
    # Residual energy in vocal range of instrumental (lower = better)
    inst_mono = np.mean(instrumental, axis=0)
    f, Pxx = scipy_signal.welch(inst_mono, sr, nperseg=4096)
    vocal_band = (f >= VOCAL_LOW) & (f <= VOCAL_HIGH)
    non_vocal_band = ~vocal_band
    
    vocal_energy = np.sum(Pxx[vocal_band])
    total_energy = np.sum(Pxx)
    
    print(f"  Vocal-range energy in instrumental: {100*vocal_energy/total_energy:.1f}% of total")
    print(f"  (lower = cleaner vocal removal)")
    
    # Check stereo preservation
    left_right_corr = np.corrcoef(instrumental[0], instrumental[1])[0, 1]
    print(f"  Stereo correlation: {left_right_corr:.4f} (closer to original = better stereo)")


def main():
    y, sr = load_audio(INPUT_FILE)
    instrumental, vocals = process(y, sr)
    quality_report(y, instrumental, vocals, sr)
    
    print(f"\nSaving: {OUTPUT_INSTRUMENTAL}")
    sf.write(OUTPUT_INSTRUMENTAL, instrumental.T, sr, subtype='PCM_24')
    
    print(f"Saving: {OUTPUT_VOCALS}")
    sf.write(OUTPUT_VOCALS, vocals.T, sr, subtype='PCM_24')
    
    # File sizes
    inst_size = os.path.getsize(OUTPUT_INSTRUMENTAL) / (1024*1024)
    voc_size = os.path.getsize(OUTPUT_VOCALS) / (1024*1024)
    print(f"\nInstrumental: {inst_size:.1f}MB")
    print(f"Vocals: {voc_size:.1f}MB")
    print("\nDone!")


if __name__ == "__main__":
    main()
