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
        ext_map = {"audio/wav": ".wav", "audio/mpeg": ".mp3", "audio/ogg": ".ogg",
                   "audio/flac": ".flac", "audio/aac": ".aac", "audio/webm": ".webm"}
        ext = ext_map.get(file_mime, ".wav")
        in_path = os.path.join(tmpdir, f"audio{ext}")
        with open(in_path, "wb") as f: f.write(file_bytes)

        # Load with librosa
        y, sr = librosa.load(in_path, sr=None, mono=True)
        duration = librosa.get_duration(y=y, sr=sr)

        if action == "analyze":
            # Comprehensive audio analysis
            tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
            spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)
            spectral_bandwidth = librosa.feature.spectral_bandwidth(y=y, sr=sr)
            spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)
            rms = librosa.feature.rms(y=y)
            zcr = librosa.feature.zero_crossing_rate(y)
            mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
            chroma = librosa.feature.chroma_stft(y=y, sr=sr)
            harmonic, percussive = librosa.effects.hpss(y)

            # Key detection (via chroma)
            chroma_mean = np.mean(chroma, axis=1)
            key_idx = int(np.argmax(chroma_mean))
            key_names = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"]
            estimated_key = key_names[key_idx]

            return {
                "success": True, "action": "analyze",
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
            }

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
