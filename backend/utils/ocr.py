import pytesseract
from PIL import Image
import cv2
import numpy as np
import re

def detect_sensitive_data(image_file):
    """
    Enhanced OCR with Image Preprocessing (Upscaling + Thresholding).
    """
    try:
        # 1. Read file
        file_bytes = image_file.file.read()
        image_file.file.seek(0)
        nparr = np.frombuffer(file_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None: return []

        sensitive_regions = []

        # ============================================
        # PRE-PROCESSING (The Accuracy Fix)
        # ============================================
        # 1. Upscale 2x (Critical for small text)
        img = cv2.resize(img, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
        
        # 2. Grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # 3. Thresholding (Make text black/white)
        _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

        # ============================================
        # PHASE 1: FACE DETECTION
        # ============================================
        # Note: Faces are detected on original scale, so we adjust coordinates
        try:
            face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
            # Detect on grayscale (not thresholded)
            faces = face_cascade.detectMultiScale(gray, 1.1, 4)
            for (x, y, w, h) in faces:
                # Scale coordinates back down by 2
                sensitive_regions.append({
                    "x": int(x/2), "y": int(y/2), "w": int(w/2), "h": int(h/2),
                    "type": "FACE", "text": "Person"
                })
        except: pass

        # ============================================
        # PHASE 2: TEXT DETECTION
        # ============================================
        # psm 11 (Sparse Text) works well for forms/IDs
        data = pytesseract.image_to_data(thresh, config='--psm 11', output_type=pytesseract.Output.DICT)
        
        patterns = {
            "EMAIL": r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}",
            "PHONE": r"(?<!\d)[6-9]\d{9}(?!\d)",
            "AADHAAR": r"\b\d{4}\s\d{4}\s\d{4}\b",
            "PAN": r"\b[A-Z]{5}[0-9]{4}[A-Z]\b",
            "PINCODE": r"\b\d{6}\b",
            "DATE": r"\b\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b"
        }

        n_boxes = len(data['text'])
        for i in range(n_boxes):
            text = data['text'][i].strip()
            if not text or int(data['conf'][i]) < 40: continue
            
            for p_type, pattern in patterns.items():
                if re.search(pattern, text, re.IGNORECASE):
                    # Scale coordinates back down by 2
                    sensitive_regions.append({
                        "x": int(data['left'][i]/2), 
                        "y": int(data['top'][i]/2), 
                        "w": int(data['width'][i]/2), 
                        "h": int(data['height'][i]/2),
                        "type": p_type, 
                        "text": text
                    })

        return sensitive_regions

    except Exception as e:
        print(f"OCR Error: {e}")
        return []