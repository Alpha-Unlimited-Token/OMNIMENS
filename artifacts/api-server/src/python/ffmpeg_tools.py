#!/usr/bin/env python3
"""
OMNIMENS FFmpeg Tools — Video/Audio Processing
STDIN: JSON {action, file_b64, file_mime, options}
Actions: get_info, extract_audio, extract_thumbnail, convert_video, convert_audio,
         generate_waveform, get_duration, trim
"""
import sys, json, base64, subprocess, tempfile, os, shutil

def error_out(msg): print(json.dumps({"success": False, "error": msg})); sys.exit(0)

FFMPEG = shutil.which("ffmpeg") or "/nix/store/ynlnyy6rn70kvzamy3b40bp3qlz70mn0-ffmpeg-full-7.1.1-bin/bin/ffmpeg"
FFPROBE = shutil.which("ffprobe") or FFMPEG.replace("ffmpeg", "ffprobe")

def run_ffmpeg(*args, timeout=120):
    result = subprocess.run([FFMPEG, "-y"] + list(args), capture_output=True, timeout=timeout)
    return result

def run_ffprobe(*args, timeout=30):
    result = subprocess.run([FFPROBE] + list(args), capture_output=True, text=True, timeout=timeout)
    return result

def process(spec: dict) -> dict:
    action = spec.get("action", "get_info")
    file_b64 = spec.get("file_b64", "")
    file_mime = spec.get("file_mime", "video/mp4")
    options = spec.get("options", {})

    # Write input file to temp dir
    tmpdir = tempfile.mkdtemp()
    try:
        ext_map = {"video/mp4": ".mp4", "video/webm": ".webm", "video/avi": ".avi",
                   "video/quicktime": ".mov", "audio/mpeg": ".mp3", "audio/wav": ".wav",
                   "audio/ogg": ".ogg", "audio/flac": ".flac", "audio/aac": ".aac",
                   "audio/webm": ".webm"}
        ext = ext_map.get(file_mime, ".mp4")
        in_path = os.path.join(tmpdir, f"input{ext}")

        if file_b64:
            try:
                with open(in_path, "wb") as f: f.write(base64.b64decode(file_b64))
            except: error_out("Invalid base64 file data")

        if action == "get_info":
            if not file_b64: error_out("file_b64 required")
            r = run_ffprobe("-v","quiet","-print_format","json","-show_streams","-show_format", in_path)
            try:
                info = json.loads(r.stdout)
                streams = info.get("streams", [])
                fmt = info.get("format", {})
                video_stream = next((s for s in streams if s.get("codec_type") == "video"), None)
                audio_stream = next((s for s in streams if s.get("codec_type") == "audio"), None)
                return {"success": True, "action": "get_info",
                        "duration_seconds": float(fmt.get("duration", 0)),
                        "size_bytes": int(fmt.get("size", 0)),
                        "format_name": fmt.get("format_name", ""),
                        "bit_rate": fmt.get("bit_rate", ""),
                        "video": {"codec": video_stream.get("codec_name",""), "width": video_stream.get("width",0),
                                  "height": video_stream.get("height",0), "fps": video_stream.get("r_frame_rate",""),
                                  "duration": float(video_stream.get("duration",0))} if video_stream else None,
                        "audio": {"codec": audio_stream.get("codec_name",""), "sample_rate": audio_stream.get("sample_rate",""),
                                  "channels": audio_stream.get("channels",0)} if audio_stream else None}
            except: return {"success": False, "error": r.stderr}

        elif action == "extract_thumbnail":
            if not file_b64: error_out("file_b64 required")
            out_path = os.path.join(tmpdir, "thumb.jpg")
            t = options.get("time", "00:00:01")
            w = options.get("width", 640)
            run_ffmpeg("-ss", str(t), "-i", in_path, "-vframes", "1", "-vf", f"scale={w}:-1", out_path)
            if os.path.exists(out_path):
                with open(out_path, "rb") as f: b64 = base64.b64encode(f.read()).decode()
                return {"success": True, "action": "extract_thumbnail", "thumbnail_base64": b64, "format": "image/jpeg"}
            return {"success": False, "error": "Thumbnail extraction failed"}

        elif action == "extract_audio":
            if not file_b64: error_out("file_b64 required")
            fmt = options.get("format", "mp3")
            out_path = os.path.join(tmpdir, f"audio.{fmt}")
            run_ffmpeg("-i", in_path, "-vn", "-acodec", "libmp3lame" if fmt=="mp3" else fmt, "-q:a", "2", out_path)
            if os.path.exists(out_path):
                with open(out_path, "rb") as f: b64 = base64.b64encode(f.read()).decode()
                return {"success": True, "action": "extract_audio", "audio_base64": b64, "format": f"audio/{fmt}",
                        "size_bytes": os.path.getsize(out_path)}
            return {"success": False, "error": "Audio extraction failed"}

        elif action == "convert_video":
            if not file_b64: error_out("file_b64 required")
            fmt = options.get("format", "mp4")
            resolution = options.get("resolution", "")  # e.g. "1280:720"
            out_path = os.path.join(tmpdir, f"output.{fmt}")
            vf_args = ["-vf", f"scale={resolution}"] if resolution else []
            run_ffmpeg("-i", in_path, *vf_args, "-c:v", "libx264", "-crf", "23", "-c:a", "aac", out_path, timeout=180)
            if os.path.exists(out_path):
                with open(out_path, "rb") as f: b64 = base64.b64encode(f.read()).decode()
                return {"success": True, "action": "convert_video", "video_base64": b64, "format": f"video/{fmt}",
                        "size_bytes": os.path.getsize(out_path)}
            return {"success": False, "error": "Video conversion failed"}

        elif action == "generate_waveform":
            if not file_b64: error_out("file_b64 required")
            out_path = os.path.join(tmpdir, "waveform.png")
            w = options.get("width", 1200); h = options.get("height", 300)
            run_ffmpeg("-i", in_path, "-filter_complex",
                       f"aformat=channel_layouts=mono,showwavespic=s={w}x{h}:colors=6c63ff",
                       "-frames:v", "1", out_path)
            if os.path.exists(out_path):
                with open(out_path, "rb") as f: b64 = base64.b64encode(f.read()).decode()
                return {"success": True, "action": "generate_waveform", "waveform_base64": b64, "format": "image/png"}
            return {"success": False, "error": "Waveform generation failed"}

        elif action == "trim":
            if not file_b64: error_out("file_b64 required")
            start = options.get("start", "0"); end = options.get("end", "10")
            out_path = os.path.join(tmpdir, f"trimmed{ext}")
            run_ffmpeg("-i", in_path, "-ss", str(start), "-to", str(end), "-c", "copy", out_path)
            if os.path.exists(out_path):
                with open(out_path, "rb") as f: b64 = base64.b64encode(f.read()).decode()
                return {"success": True, "action": "trim", "file_base64": b64, "format": file_mime,
                        "size_bytes": os.path.getsize(out_path)}
            return {"success": False, "error": "Trim failed"}

        else:
            error_out(f"Unknown action: {action}. Use: get_info, extract_thumbnail, extract_audio, convert_video, generate_waveform, trim")

    finally:
        shutil.rmtree(tmpdir, ignore_errors=True)

if __name__ == "__main__":
    raw = sys.stdin.read().strip()
    if not raw: error_out("No input")
    try: spec = json.loads(raw)
    except: error_out("Invalid JSON")
    print(json.dumps(process(spec)))
