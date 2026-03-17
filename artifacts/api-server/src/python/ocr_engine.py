#!/usr/bin/env python3
"""
OMNIMENS OCR Engine — Tesseract + OpenCV preprocessing
STDIN: base64-encoded image
Returns: {success, text, confidence, words, lines, language}
"""
import sys, json, base64, os, tempfile
import numpy as np

def error_out(msg): print(json.dumps({"success": False, "error": msg})); sys.exit(0)

def process(b64_data: str) -> dict:
    try: img_bytes = base64.b64decode(b64_data)
    except: error_out("Invalid base64 image")

    try:
        import cv2
        import pytesseract
        from PIL import Image
        import io

        # Load image
        arr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
        if img is None: error_out("Could not decode image")

        h, w = img.shape[:2]

        # Preprocessing pipeline for best OCR results
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # Upscale small images
        if max(h, w) < 800:
            scale = 800 / max(h, w)
            gray = cv2.resize(gray, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)

        # Denoise
        gray = cv2.fastNlMeansDenoising(gray, h=10)

        # Adaptive threshold for documents
        thresh = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                       cv2.THRESH_BINARY, 11, 2)

        # Convert to PIL for pytesseract
        pil_img = Image.fromarray(thresh)

        # Run OCR with detailed data
        config = "--oem 3 --psm 3"  # Auto page segmentation
        data = pytesseract.image_to_data(pil_img, config=config, output_type=pytesseract.Output.DICT)
        text = pytesseract.image_to_string(pil_img, config=config)

        # Extract words with confidence
        words = []
        for i in range(len(data["text"])):
            word = data["text"][i].strip()
            conf = int(data["conf"][i])
            if word and conf > 0:
                words.append({"word": word, "confidence": conf,
                              "x": data["left"][i], "y": data["top"][i],
                              "w": data["width"][i], "h": data["height"][i]})

        avg_conf = round(sum(w["confidence"] for w in words) / len(words), 1) if words else 0
        lines = [l.strip() for l in text.split('\n') if l.strip()]

        return {
            "success": True,
            "text": text.strip(),
            "lines": lines,
            "line_count": len(lines),
            "word_count": len(words),
            "words": words[:200],  # First 200 words with positions
            "average_confidence": avg_conf,
            "image_dimensions": f"{w}×{h}",
        }

    except Exception as e:
        # Try basic PIL-only OCR as fallback
        try:
            from PIL import Image
            import pytesseract
            import io
            pil_img = Image.open(io.BytesIO(img_bytes))
            text = pytesseract.image_to_string(pil_img)
            return {"success": True, "text": text.strip(), "lines": text.strip().split('\n'),
                    "word_count": len(text.split()), "average_confidence": 0,
                    "note": "Used fallback PIL mode"}
        except Exception as e2:
            return {"success": False, "error": f"OCR failed: {e} / {e2}"}

if __name__ == "__main__":
    b64 = sys.stdin.read().strip()
    if not b64: error_out("No image data on stdin")
    print(json.dumps(process(b64)))
