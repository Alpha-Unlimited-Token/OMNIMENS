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
            error_out(f"Unknown action: {action}. Use: analyze, spectrogram, beat_detect")

    finally:
        shutil.rmtree(tmpdir, ignore_errors=True)

if __name__ == "__main__":
    raw = sys.stdin.read().strip()
    if not raw: error_out("No input")
    try: spec = json.loads(raw)
    except: error_out("Invalid JSON")
    print(json.dumps(process(spec)))
