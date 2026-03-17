#!/usr/bin/env python3
"""
OMNIMENS Face Analysis Engine
Copyright © 2024–2026 Alpha Unlimited Technologies, LLC

Accepts base64 image via STDIN (avoids OS arg length limits).
Returns JSON: face count, bounding boxes, per-face crops (base64).
"""

import sys
import json
import base64
import os
import numpy as np

def error_out(msg: str):
    print(json.dumps({"success": False, "error": msg}))
    sys.exit(0)

try:
    import cv2
except ImportError:
    error_out("OpenCV not installed (cv2 missing)")

def load_image_from_b64(b64_data: str):
    """Decode base64 image bytes → OpenCV BGR array."""
    try:
        img_bytes = base64.b64decode(b64_data)
    except Exception as e:
        error_out(f"base64 decode failed: {e}")
        return None

    arr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        error_out("OpenCV could not decode image (unsupported format or corrupt data)")
    return img

def detect_faces_opencv(img):
    """
    Haar cascade face detection (always available with opencv-python-headless).
    Returns list of (x, y, w, h, confidence) tuples.
    """
    faces = []
    h, w = img.shape[:2]

    # Primary: frontal face cascade
    cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
    if os.path.exists(cascade_path):
        cascade = cv2.CascadeClassifier(cascade_path)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        # Equalize histogram for better detection in varied lighting
        gray = cv2.equalizeHist(gray)
        detected = cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=4,
            minSize=(20, 20),
            flags=cv2.CASCADE_SCALE_IMAGE,
        )
        if len(detected) > 0:
            for (x, y, fw, fh) in detected:
                faces.append((int(x), int(y), int(fw), int(fh), 0.90))

    # Also try alt cascade to catch faces missed by default
    if len(faces) == 0:
        alt_path = cv2.data.haarcascades + "haarcascade_frontalface_alt2.xml"
        if os.path.exists(alt_path):
            cascade2 = cv2.CascadeClassifier(alt_path)
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            gray = cv2.equalizeHist(gray)
            detected2 = cascade2.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=3, minSize=(20, 20))
            if len(detected2) > 0:
                for (x, y, fw, fh) in detected2:
                    faces.append((int(x), int(y), int(fw), int(fh), 0.75))

    # Profile face fallback
    if len(faces) == 0:
        profile_path = cv2.data.haarcascades + "haarcascade_profileface.xml"
        if os.path.exists(profile_path):
            cascade3 = cv2.CascadeClassifier(profile_path)
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            detected3 = cascade3.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=3, minSize=(20, 20))
            if len(detected3) > 0:
                for (x, y, fw, fh) in detected3:
                    faces.append((int(x), int(y), int(fw), int(fh), 0.65))

    return faces

def crop_face(img, x, y, fw, fh, pad=0.30):
    """Crop face with padding. Returns base64-encoded JPEG."""
    ih, iw = img.shape[:2]
    px = int(fw * pad)
    py = int(fh * pad)
    x1 = max(0, x - px)
    y1 = max(0, y - py)
    x2 = min(iw, x + fw + px)
    y2 = min(ih, y + fh + py)
    face_img = img[y1:y2, x1:x2]
    _, buf = cv2.imencode(".jpg", face_img, [cv2.IMWRITE_JPEG_QUALITY, 90])
    return base64.b64encode(buf).decode("utf-8")

def analyze(b64_data: str) -> dict:
    img = load_image_from_b64(b64_data)
    if img is None:
        return {"success": False, "error": "Could not load image"}

    h, w = img.shape[:2]
    faces = detect_faces_opencv(img)

    face_crops = []
    bounding_boxes = []
    for i, face_data in enumerate(faces):
        x, y, fw, fh, conf = face_data
        bounding_boxes.append({
            "face_index": i,
            "x": x, "y": y,
            "width": fw, "height": fh,
            "confidence": round(float(conf), 3),
        })
        try:
            crop_b64 = crop_face(img, x, y, fw, fh)
            face_crops.append({"face_index": i, "base64_jpeg": crop_b64})
        except Exception:
            pass

    # Encode full image as base64 JPEG for GPT-4 Vision
    _, full_buf = cv2.imencode(".jpg", img, [cv2.IMWRITE_JPEG_QUALITY, 85])
    full_b64 = base64.b64encode(full_buf).decode("utf-8")

    return {
        "success": True,
        "image_width": w,
        "image_height": h,
        "face_count": len(faces),
        "bounding_boxes": bounding_boxes,
        "face_crops": face_crops,
        "full_image_base64": full_b64,
        "detector_used": "opencv_haar_cascade",
    }

if __name__ == "__main__":
    # Read base64 image data from STDIN to avoid OS arg length limits
    b64_input = sys.stdin.read().strip()
    if not b64_input:
        error_out("No image data received on stdin")
    result = analyze(b64_input)
    print(json.dumps(result))
