from flask import Flask, request, jsonify
from flask_cors import CORS
import pytesseract
from PIL import Image
import cv2
import os

app = Flask(__name__)
CORS(app)

# --- IMPORTANT: Tell Python where Tesseract is installed ---
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"


@app.route("/")
def home():
    return "Sentiscan Backend Running!"


# ---------- OCR + Upload API ----------
@app.route("/extract-text", methods=["POST"])
def extract_text():
    if "image" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["image"]
    image_path = "uploaded_image.png"
    file.save(image_path)

    # OCR extract
    try:
        text = pytesseract.image_to_string(Image.open(image_path))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    # -----------------------------
    # 🔍 Sensitive data detection
    # -----------------------------
    import re

    patterns = {
        "emails": r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}",
        "phones": r"\b[6-9]\d{9}\b",
        "aadhaar": r"\b\d{4}\s\d{4}\s\d{4}\b",
        "pan": r"\b[A-Z]{5}[0-9]{4}[A-Z]\b",
        "dates": r"\b\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b"
    }

    detected = {}

    for key, pattern in patterns.items():
        matches = re.findall(pattern, text)
        detected[key] = matches

    return jsonify({
        "text": text,
        "sensitive": detected
    })



if __name__ == "__main__":
    app.run(debug=True)
