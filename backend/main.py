from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from io import BytesIO
import os
import json
import datetime
import uvicorn
import traceback

# --- IMPORT CUSTOM UTILS ---
from utils.mask import apply_masks_and_save_regions
from utils.restore import restore_image_logic
from utils.ocr import detect_sensitive_data
from utils.risk import calculate_risk
from utils.pdf import (
    save_pdf_metadata, 
    get_thumbnails_batch, 
    get_high_res_page, 
    convert_pdf_to_image_bytes
)

# ==================================================
# FOLDER INITIALIZATION
# ==================================================
folders = ["masked", "restored", "originals", "static/uploads"]
for folder in folders:
    os.makedirs(folder, exist_ok=True)

# --- AUDIT LOGGER ---
EVENT_LOGS = []

def log_event(filename: str, action: str, risk: str, status: str):
    log_entry = {
        "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "filename": filename,
        "action": action,
        "risk_score": risk,
        "status": status
    }
    EVENT_LOGS.append(log_entry)
    print(f"✅ AUDIT LOG: {log_entry}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield

app = FastAPI(lifespan=lifespan)

# --- CORS & ROUTING ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static/masked", StaticFiles(directory="masked"), name="masked")
app.mount("/static/restored", StaticFiles(directory="restored"), name="restored")
app.mount("/static/uploads", StaticFiles(directory="static/uploads"), name="uploads")

@app.get("/")
def home():
    return {"message": "SentiScan Cyber-Security Backend is Active."}

# ==================================================
# 1. PDF GRID & NAVIGATION
# ==================================================

@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    try:
        content = await file.read()
        res = save_pdf_metadata(content, "static/uploads")
        if not res:
            return {"error": "Poppler binary not found. Please verify your system path."}
        return {"status": "success", "pdf_id": res['pdf_id']}
    except Exception as e:
        return {"error": f"Upload failed: {str(e)}"}

@app.post("/get-thumbnails-batch")
async def thumb(pdf_id: str = Form(...), start_page: int = Form(...), limit: int = Form(...)):
    try:
        pages = get_thumbnails_batch(pdf_id, "static/uploads", start_page, limit)
        return {"status": "success", "pages": pages}
    except Exception as e:
        return {"error": str(e)}

@app.post("/get-page-image")
async def page(pdf_id: str = Form(...), page_index: int = Form(...)):
    try:
        url = get_high_res_page(pdf_id, page_index, "static/uploads")
        if not url:
            return {"error": "High-res rendering failed."}
        return {"status": "success", "url": url}
    except Exception as e:
        return {"error": str(e)}

# ==================================================
# 2. AI INTELLIGENT DETECTION
# ==================================================

@app.post("/detect-pii")
async def detect(image: UploadFile = File(...)):
    try:
        file_bytes = await image.read()
        if image.filename.lower().endswith(".pdf"):
            file_bytes = convert_pdf_to_image_bytes(file_bytes)
            if not file_bytes: return {"error": "Failed to normalize PDF structure for OCR."}
        
        mock_file = UploadFile(file=BytesIO(file_bytes), filename="temp_ocr.png")
        regions = detect_sensitive_data(mock_file)
        return {"status": "success", "detected_regions": regions}
    except Exception as e:
        return {"error": str(e)}

# ==================================================
# 3. SECURE CHECKPOINT (Masking & Restoration)
# ==================================================

@app.post("/mask-image")
async def mask(image: UploadFile = File(...), coordinates: str = Form(...)):
    try:
        file_bytes = await image.read()
        
        if image.filename.lower().endswith(".pdf"):
            file_bytes = convert_pdf_to_image_bytes(file_bytes)
            if not file_bytes: return {"error": "Failed to synchronize PDF for masking."}
        
        # We pass raw bytes directly to prevent memory stream failures
        res = await apply_masks_and_save_regions(file_bytes, coordinates)
        
        risk_lvl = calculate_risk(len(json.loads(coordinates)))
        log_event(image.filename, "MASK", risk_lvl, "Data Secured & Encrypted")
        
        return {**res, "risk_score": risk_lvl}
    except Exception as e:
        # Prints exact traceback to your terminal if it fails
        err_msg = traceback.format_exc()
        print(f"Masking Route Error:\n{err_msg}")
        return {"error": f"Engine failed: {str(e)}"}

@app.post("/restore")
async def restore(image: UploadFile = File(...), image_id: str = Form(...)):
    try:
        file_bytes = await image.read()
        is_pdf = image.filename.lower().endswith(".pdf")
        
        if is_pdf:
            file_bytes = convert_pdf_to_image_bytes(file_bytes)
            if not file_bytes:
                return {"error": "Restoration engine failed to decode PDF layers."}

        # We pass raw bytes directly to prevent memory stream failures
        res = await restore_image_logic(file_bytes, image_id, is_pdf)
        
        log_event(image.filename, "RESTORE", "N/A", f"Identity Authenticated ({'PDF' if is_pdf else 'Image'})")
        return res
    except Exception as e:
        # Prints exact traceback to your terminal if it fails
        err_msg = traceback.format_exc()
        print(f"Restore Route Error:\n{err_msg}")
        return {"error": f"Alignment conflict: {str(e)}"}

# ==================================================
# 4. COMPLIANCE AUDIT
# ==================================================

@app.get("/logs")
def logs():
    return {"status": "success", "logs": EVENT_LOGS}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)