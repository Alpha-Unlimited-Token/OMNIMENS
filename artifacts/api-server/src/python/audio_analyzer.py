#!/usr/bin/env python3
"""
OMNIMENS Audio Analysis Engine — librosa + pydub
STDIN: JSON {action, file_b64, file_mime, options}
Actions: analyze, beat_detect, spectogram, convert, tempo, transcribe_rhythm
"""
import sys, json, base64, io, tempfile, os, shutil, warnings
warnings.filterwarnings("ignore")

def error_out(msg): print(json.dumps({"success": False, "error": msg})); sys.exit(0)

def process(spec: dict) -> dict:
    action = spec.get("action", "analyze")
    file_b64 = spec.get("file_b64", "")
    file_mime = spec.get("file_mime", "audio/wav")
    options = spec.get("options", {})

    if not file_b64: error_out("file_b64 required")
    try: file_bytes = base64.b64decode(file_b64)
    except: error_out("Invalid base64")

    import librosa, librosa.display
    import numpy as np
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    tmpdir = tempfile.mkdtemp()
    try:
        ext_map = {
            "audio/wav": ".wav", "audio/x-wav": ".wav",
            "audio/mpeg": ".mp3", "audio/mp3": ".mp3",
            "audio/ogg": ".ogg",
            "audio/flac": ".flac", "audio/x-flac": ".flac",
            "audio/aac": ".aac",
            "audio/webm": ".webm",
            "audio/mp4": ".m4a", "audio/x-m4a": ".m4a", "audio/m4a": ".m4a",
        }
        ext = ext_map.get(file_mime, ".wav")
        in_path = os.path.join(tmpdir, f"audio{ext}")
        with open(in_path, "wb") as f: f.write(file_bytes)

        # Load with librosa
        y, sr = librosa.load(in_path, sr=None, mono=True)
        duration = librosa.get_duration(y=y, sr=sr)

        if action in ("analyze", "hie_analyze"):
            tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
            spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)
            spectral_bandwidth = librosa.feature.spectral_bandwidth(y=y, sr=sr)
            spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)
            rms = librosa.feature.rms(y=y)
            zcr = librosa.feature.zero_crossing_rate(y)
            mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
            chroma = librosa.feature.chroma_stft(y=y, sr=sr)
            harmonic, percussive = librosa.effects.hpss(y)

            chroma_mean = np.mean(chroma, axis=1)
            key_idx = int(np.argmax(chroma_mean))
            key_names = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"]
            estimated_key = key_names[key_idx]

            D = np.abs(librosa.stft(y))
            freqs = librosa.fft_frequencies(sr=sr)
            mag = np.mean(D, axis=1)
            total_energy = float(np.sum(mag)) + 1e-10

            def band_energy(lo, hi):
                mask = (freqs >= lo) & (freqs < hi)
                return float(np.sum(mag[mask])) / total_energy

            frequency_bands = {
                "sub": round(band_energy(0, 60), 4),
                "low": round(band_energy(60, 250), 4),
                "mid": round(band_energy(250, 4000), 4),
                "high": round(band_energy(4000, 12000), 4),
                "ultra": round(band_energy(12000, sr / 2), 4),
            }

            dom_idx = int(np.argmax(mag))
            dominant_frequency = round(float(freqs[dom_idx]), 2)

            top_indices = np.argsort(mag)[::-1][:12]
            peak_frequencies = []
            for idx in top_indices:
                if mag[idx] > 0:
                    peak_frequencies.append({
                        "freq": round(float(freqs[idx]), 2),
                        "magnitude": round(float(mag[idx]) / (float(np.max(mag)) + 1e-10), 4),
                    })

            harmonic_freqs = []
            if dominant_frequency > 0:
                for h in range(1, 17):
                    target = dominant_frequency * h
                    closest_idx = int(np.argmin(np.abs(freqs - target)))
                    if closest_idx < len(mag):
                        harmonic_freqs.append(round(float(mag[closest_idx]), 6))

            onset_env = librosa.onset.onset_strength(y=y, sr=sr)
            spectral_flux_val = round(float(np.mean(np.diff(onset_env) ** 2)) if len(onset_env) > 1 else 0.0, 6)

            result = {
                "success": True, "action": action,
                "duration_seconds": round(duration, 2),
                "sample_rate": int(sr),
                "tempo_bpm": round(float(tempo), 1),
                "beat_count": len(beats),
                "estimated_key": estimated_key,
                "rms_energy": round(float(np.mean(rms)), 4),
                "spectral_centroid_hz": round(float(np.mean(spectral_centroid)), 1),
                "spectral_bandwidth_hz": round(float(np.mean(spectral_bandwidth)), 1),
                "spectral_rolloff_hz": round(float(np.mean(spectral_rolloff)), 1),
                "zero_crossing_rate": round(float(np.mean(zcr)), 4),
                "mfcc_means": [round(float(x), 3) for x in np.mean(mfcc, axis=1)],
                "harmonic_ratio": round(float(np.mean(np.abs(harmonic)) / (np.mean(np.abs(y)) + 1e-8)), 3),
                "percussive_ratio": round(float(np.mean(np.abs(percussive)) / (np.mean(np.abs(y)) + 1e-8)), 3),
                "frequency_bands": frequency_bands,
                "dominant_frequency": dominant_frequency,
                "peak_frequencies": peak_frequencies,
                "harmonic_series": harmonic_freqs,
                "spectral_flux": spectral_flux_val,
            }

            if action == "hie_analyze":
                n_segments = min(8, max(1, int(duration)))
                seg_len = len(y) // n_segments
                temporal_segments = []
                for si in range(n_segments):
                    seg = y[si * seg_len : (si + 1) * seg_len]
                    seg_rms = float(np.sqrt(np.mean(seg ** 2)))
                    seg_zcr = float(np.mean(librosa.feature.zero_crossing_rate(seg)))
                    seg_centroid = float(np.mean(librosa.feature.spectral_centroid(y=seg, sr=sr)))
                    temporal_segments.append({
                        "segment": si,
                        "rms": round(seg_rms, 4),
                        "zcr": round(seg_zcr, 4),
                        "centroid": round(seg_centroid, 1),
                    })
                result["temporal_segments"] = temporal_segments

                chroma_detail = [round(float(x), 4) for x in chroma_mean]
                result["chroma_profile"] = dict(zip(key_names, chroma_detail))

                pitches, pitch_mags = librosa.piptrack(y=y, sr=sr)
                pitch_values = []
                for t in range(pitches.shape[1]):
                    idx = pitch_mags[:, t].argmax()
                    p = float(pitches[idx, t])
                    if p > 0:
                        pitch_values.append(p)
                if pitch_values:
                    result["pitch_stats"] = {
                        "mean": round(float(np.mean(pitch_values)), 2),
                        "median": round(float(np.median(pitch_values)), 2),
                        "min": round(float(np.min(pitch_values)), 2),
                        "max": round(float(np.max(pitch_values)), 2),
                        "std": round(float(np.std(pitch_values)), 2),
                    }

            return result

        elif action == "harmonic_decode":
            n_fft = 4096
            D_full = librosa.stft(y, n_fft=n_fft)
            S_full = np.abs(D_full)
            freqs_full = librosa.fft_frequencies(sr=sr, n_fft=n_fft)
            mag_full = np.mean(S_full, axis=1)

            total_energy_hd = float(np.sum(mag_full)) + 1e-10
            def band_energy_hd(lo, hi):
                mask = (freqs_full >= lo) & (freqs_full < hi)
                return float(np.sum(mag_full[mask])) / total_energy_hd
            frequency_bands = {
                "sub": round(band_energy_hd(0, 60), 4),
                "low": round(band_energy_hd(60, 250), 4),
                "mid": round(band_energy_hd(250, 4000), 4),
                "high": round(band_energy_hd(4000, 12000), 4),
                "ultra": round(band_energy_hd(12000, sr / 2), 4),
            }

            resolutions = [512, 1024, 2048, 4096]
            multi_res = []
            for res in resolutions:
                D_r = np.abs(librosa.stft(y, n_fft=res))
                f_r = librosa.fft_frequencies(sr=sr, n_fft=res)
                m_r = np.mean(D_r, axis=1)
                top_idx = np.argsort(m_r)[::-1][:8]
                peaks = [{"freq": round(float(f_r[i]), 2), "mag": round(float(m_r[i]) / (float(np.max(m_r)) + 1e-10), 4)} for i in top_idx if m_r[i] > 0]
                multi_res.append({"resolution": res, "freq_bin_hz": round(float(sr / res), 2), "peaks": peaks})

            top32 = np.argsort(mag_full)[::-1][:32]
            atomic_freqs = []
            for idx in top32:
                if mag_full[idx] > 0:
                    atomic_freqs.append({"freq": round(float(freqs_full[idx]), 2), "magnitude": round(float(mag_full[idx]) / (float(np.max(mag_full)) + 1e-10), 6)})

            inter_harmonic_ratios = []
            sorted_af = sorted(atomic_freqs, key=lambda x: x["magnitude"], reverse=True)[:12]
            for i in range(len(sorted_af)):
                for j in range(i + 1, len(sorted_af)):
                    f1, f2 = sorted_af[i]["freq"], sorted_af[j]["freq"]
                    if f2 > 0:
                        ratio = round(f1 / f2, 6)
                        frac_dist = min(abs(ratio - round(ratio)), abs(ratio - (round(ratio * 2) / 2)), abs(ratio - (round(ratio * 3) / 3)))
                        inter_harmonic_ratios.append({"f1": f1, "f2": f2, "ratio": ratio, "near_integer": frac_dist < 0.05, "deviation": round(frac_dist, 6)})
            inter_harmonic_ratios.sort(key=lambda x: x["deviation"])
            inter_harmonic_ratios = inter_harmonic_ratios[:20]

            harmonic, percussive = librosa.effects.hpss(y)
            harmonic_stft = np.abs(librosa.stft(harmonic, n_fft=n_fft))
            harmonic_mag = np.mean(harmonic_stft, axis=1)
            harmonic_peaks = []
            h_top = np.argsort(harmonic_mag)[::-1][:16]
            for idx in h_top:
                if harmonic_mag[idx] > 0:
                    harmonic_peaks.append({"freq": round(float(freqs_full[idx]), 2), "magnitude": round(float(harmonic_mag[idx]) / (float(np.max(harmonic_mag)) + 1e-10), 6)})

            dom_idx = int(np.argmax(harmonic_mag))
            fund_freq = float(freqs_full[dom_idx]) if harmonic_mag[dom_idx] > 0 else 0
            overtone_map = []
            if fund_freq > 0:
                for n in range(1, 25):
                    target = fund_freq * n
                    if target > sr / 2:
                        break
                    ci = int(np.argmin(np.abs(freqs_full - target)))
                    actual = float(freqs_full[ci])
                    strength = float(harmonic_mag[ci]) / (float(np.max(harmonic_mag)) + 1e-10)
                    deviation_cents = 1200 * np.log2(actual / target) if actual > 0 and target > 0 else 0
                    overtone_map.append({"harmonic": n, "expected_hz": round(target, 2), "actual_hz": round(actual, 2), "strength": round(strength, 6), "deviation_cents": round(float(deviation_cents), 2)})

            spectral_env = []
            env_bands = [(0, 50), (50, 100), (100, 200), (200, 400), (400, 800), (800, 1600), (1600, 3200), (3200, 6400), (6400, 12800), (12800, sr / 2)]
            total_e = float(np.sum(mag_full)) + 1e-10
            for lo, hi in env_bands:
                mask = (freqs_full >= lo) & (freqs_full < hi)
                band_e = float(np.sum(mag_full[mask])) / total_e
                peak_in_band = float(freqs_full[mask][np.argmax(mag_full[mask])]) if np.any(mask) and np.max(mag_full[mask]) > 0 else 0
                spectral_env.append({"range": f"{int(lo)}-{int(hi)}Hz", "energy": round(band_e, 6), "peak_freq": round(peak_in_band, 2)})

            S_frames = S_full.T
            n_frames = S_frames.shape[0]
            mod_rates = []
            if n_frames > 4:
                hop_time = float(librosa.frames_to_time(1, sr=sr, n_fft=n_fft))
                for band_idx in h_top[:6]:
                    band_signal = S_full[band_idx, :]
                    if np.std(band_signal) > 1e-8:
                        band_norm = (band_signal - np.mean(band_signal)) / (np.std(band_signal) + 1e-10)
                        acorr = np.correlate(band_norm, band_norm, mode='full')
                        acorr = acorr[len(acorr)//2:]
                        acorr = acorr / (acorr[0] + 1e-10)
                        peaks_ac = []
                        for pi in range(1, len(acorr) - 1):
                            if acorr[pi] > acorr[pi-1] and acorr[pi] > acorr[pi+1] and acorr[pi] > 0.2:
                                peaks_ac.append(pi)
                        if peaks_ac:
                            period_frames = peaks_ac[0]
                            mod_freq = 1.0 / (period_frames * hop_time) if period_frames > 0 else 0
                            mod_rates.append({"carrier_freq": round(float(freqs_full[band_idx]), 2), "modulation_hz": round(mod_freq, 3), "strength": round(float(acorr[peaks_ac[0]]), 4), "period_frames": period_frames})

            chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
            chroma_mean = np.mean(chroma, axis=1)
            chroma_std = np.std(chroma, axis=1)
            key_names = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"]
            tonal_gravity = []
            for i, name in enumerate(key_names):
                tonal_gravity.append({"note": name, "weight": round(float(chroma_mean[i]), 4), "stability": round(1.0 - float(chroma_std[i]) / (float(chroma_mean[i]) + 1e-6), 4)})
            tonal_gravity.sort(key=lambda x: x["weight"], reverse=True)

            chroma_frames = chroma.T
            tonal_transitions = []
            if chroma_frames.shape[0] > 1:
                for t in range(1, min(chroma_frames.shape[0], 50)):
                    prev_key = int(np.argmax(chroma_frames[t-1]))
                    curr_key = int(np.argmax(chroma_frames[t]))
                    if prev_key != curr_key:
                        interval = (curr_key - prev_key) % 12
                        tonal_transitions.append({"frame": t, "from": key_names[prev_key], "to": key_names[curr_key], "interval_semitones": interval})

            mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=20)
            mfcc_means = [round(float(x), 3) for x in np.mean(mfcc, axis=1)]
            mfcc_stds = [round(float(x), 3) for x in np.std(mfcc, axis=1)]
            mfcc_deltas = librosa.feature.delta(mfcc)
            mfcc_delta_means = [round(float(x), 4) for x in np.mean(mfcc_deltas, axis=1)]

            spectral_contrast = librosa.feature.spectral_contrast(y=y, sr=sr)
            contrast_means = [round(float(x), 3) for x in np.mean(spectral_contrast, axis=1)]

            n_temporal = min(16, max(2, int(duration * 2)))
            seg_len = len(y) // n_temporal
            temporal_evolution = []
            for si in range(n_temporal):
                seg = y[si * seg_len : (si + 1) * seg_len]
                seg_D = np.abs(librosa.stft(seg, n_fft=min(n_fft, len(seg))))
                seg_freqs = librosa.fft_frequencies(sr=sr, n_fft=min(n_fft, len(seg)))
                seg_mag = np.mean(seg_D, axis=1)
                seg_dom_idx = int(np.argmax(seg_mag))
                seg_rms = float(np.sqrt(np.mean(seg ** 2)))
                seg_zcr = float(np.mean(librosa.feature.zero_crossing_rate(seg)))
                seg_centroid = float(np.mean(librosa.feature.spectral_centroid(y=seg, sr=sr)))
                seg_bandwidth = float(np.mean(librosa.feature.spectral_bandwidth(y=seg, sr=sr)))
                temporal_evolution.append({
                    "segment": si, "time_start": round(si * seg_len / sr, 3),
                    "dominant_freq": round(float(seg_freqs[seg_dom_idx]), 2) if seg_mag[seg_dom_idx] > 0 else 0,
                    "rms": round(seg_rms, 5), "zcr": round(seg_zcr, 5),
                    "centroid": round(seg_centroid, 1), "bandwidth": round(seg_bandwidth, 1),
                })

            flatness = librosa.feature.spectral_flatness(y=y)
            tonnetz_feat = librosa.feature.tonnetz(y=librosa.effects.harmonic(y), sr=sr)
            tonnetz_means = [round(float(x), 4) for x in np.mean(tonnetz_feat, axis=1)]

            from matplotlib.colors import hsv_to_rgb as _hsv_to_rgb
            nyquist = sr / 2.0
            spectral_color_map = []
            for af in atomic_freqs[:32]:
                f = af["freq"]
                m = af["magnitude"]
                hue = min(f / nyquist, 1.0) * 0.83
                sat = min(m * 1.2, 1.0)
                val = max(0.3, min(m * 1.5 + 0.2, 1.0))
                rgb = _hsv_to_rgb([hue, sat, val])
                hex_color = "#{:02x}{:02x}{:02x}".format(int(rgb[0]*255), int(rgb[1]*255), int(rgb[2]*255))
                spectral_color_map.append({
                    "freq": af["freq"], "magnitude": m,
                    "hue": round(hue, 4), "saturation": round(sat, 4), "value": round(val, 4),
                    "rgb": [round(float(rgb[0]), 4), round(float(rgb[1]), 4), round(float(rgb[2]), 4)],
                    "hex": hex_color,
                })
            spectral_color_map.sort(key=lambda x: x["freq"])

            band_colors = {}
            band_centers = {"sub": 30, "low": 155, "mid": 2125, "high": 8000, "ultra": 16000}
            for bname, bcenter in band_centers.items():
                bh = min(bcenter / nyquist, 1.0) * 0.83
                be = frequency_bands.get(bname, 0)
                bs = min(be * 2.0, 1.0)
                bv = max(0.3, min(be * 2.0 + 0.3, 1.0))
                brgb = _hsv_to_rgb([bh, bs, bv])
                band_colors[bname] = {
                    "hex": "#{:02x}{:02x}{:02x}".format(int(brgb[0]*255), int(brgb[1]*255), int(brgb[2]*255)),
                    "rgb": [round(float(brgb[0]), 4), round(float(brgb[1]), 4), round(float(brgb[2]), 4)],
                    "energy": round(be, 4),
                }

            overtone_colors = []
            for ot in overtone_map[:16]:
                oh = min(ot["actual_hz"] / nyquist, 1.0) * 0.83
                os_val = min(ot["strength"] * 1.5, 1.0)
                ov = max(0.25, min(ot["strength"] * 2.0 + 0.15, 1.0))
                orgb = _hsv_to_rgb([oh, os_val, ov])
                overtone_colors.append({
                    "harmonic": ot["harmonic"], "freq": ot["actual_hz"],
                    "hex": "#{:02x}{:02x}{:02x}".format(int(orgb[0]*255), int(orgb[1]*255), int(orgb[2]*255)),
                    "strength": ot["strength"],
                })

            temporal_colors = []
            for seg in temporal_evolution:
                th = min(seg["dominant_freq"] / nyquist, 1.0) * 0.83 if seg["dominant_freq"] > 0 else 0
                ts = min(seg["rms"] * 8, 1.0)
                tv = max(0.15, min(seg["rms"] * 5 + 0.1, 1.0))
                trgb = _hsv_to_rgb([th, ts, tv])
                temporal_colors.append({
                    "segment": seg["segment"], "time_start": seg["time_start"],
                    "hex": "#{:02x}{:02x}{:02x}".format(int(trgb[0]*255), int(trgb[1]*255), int(trgb[2]*255)),
                    "dominant_freq": seg["dominant_freq"], "energy": seg["rms"],
                })

            result = {
                "success": True, "action": "harmonic_decode",
                "duration_seconds": round(duration, 2), "sample_rate": int(sr),
                "multi_resolution_peaks": multi_res,
                "atomic_frequencies": atomic_freqs,
                "inter_harmonic_ratios": inter_harmonic_ratios,
                "pure_harmonic_peaks": harmonic_peaks,
                "fundamental_frequency": round(fund_freq, 2),
                "overtone_map": overtone_map,
                "spectral_envelope": spectral_env,
                "amplitude_modulations": mod_rates,
                "tonal_gravity_field": tonal_gravity,
                "tonal_transitions": tonal_transitions[:30],
                "mfcc_deep": {"means": mfcc_means, "stds": mfcc_stds, "delta_means": mfcc_delta_means},
                "spectral_contrast": contrast_means,
                "temporal_evolution": temporal_evolution,
                "spectral_flatness_mean": round(float(np.mean(flatness)), 6),
                "tonnetz": tonnetz_means,
                "harmonic_percussive_ratio": round(float(np.mean(np.abs(harmonic)) / (np.mean(np.abs(percussive)) + 1e-8)), 4),
                "spectral_color_map": spectral_color_map,
                "band_colors": band_colors,
                "overtone_colors": overtone_colors,
                "temporal_colors": temporal_colors,
            }
            return result

        elif action == "spectrogram":
            D = librosa.stft(y)
            S_db = librosa.amplitude_to_db(np.abs(D), ref=np.max)
            fig, ax = plt.subplots(figsize=(12, 5))
            fig.patch.set_facecolor("#0d0d0d"); ax.set_facecolor("#0d0d0d")
            img = librosa.display.specshow(S_db, sr=sr, x_axis="time", y_axis="hz", ax=ax, cmap="plasma")
            fig.colorbar(img, ax=ax, format="%+2.0f dB")
            ax.set_title("Spectrogram", color="#eeeeee"); ax.tick_params(colors="#999999")
            ax.yaxis.label.set_color("#cccccc"); ax.xaxis.label.set_color("#cccccc")
            plt.tight_layout()
            buf = io.BytesIO(); fig.savefig(buf, format="png", dpi=150, bbox_inches="tight")
            buf.seek(0); b64_out = base64.b64encode(buf.read()).decode(); plt.close(fig)
            return {"success": True, "action": "spectrogram", "spectrogram_png": b64_out,
                    "duration_seconds": round(duration, 2), "sample_rate": int(sr)}

        elif action == "beat_detect":
            tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
            beat_times = librosa.frames_to_time(beats, sr=sr).tolist()
            return {"success": True, "action": "beat_detect",
                    "tempo_bpm": round(float(tempo), 1), "beat_count": len(beats),
                    "beat_times": [round(t, 3) for t in beat_times[:100]],
                    "duration_seconds": round(duration, 2)}

        else:
            error_out(f"Unknown action: {action}. Use: analyze, hie_analyze, harmonic_decode, spectrogram, beat_detect")

    finally:
        shutil.rmtree(tmpdir, ignore_errors=True)

if __name__ == "__main__":
    raw = sys.stdin.read().strip()
    if not raw: error_out("No input")
    try: spec = json.loads(raw)
    except: error_out("Invalid JSON")
    print(json.dumps(process(spec)))
