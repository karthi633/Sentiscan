from pdf2image import convert_from_path, convert_from_bytes
import os
import io
import uuid

# --- PATHS ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__)) 
BACKEND_DIR = os.path.dirname(BASE_DIR) 
POPPLER_BIN = os.path.join(BACKEND_DIR, "poppler", "Library", "bin")

def save_pdf_metadata(file_bytes, upload_folder):
    try:
        batch_id = str(uuid.uuid4())
        pdf_filename = f"{batch_id}_source.pdf"
        pdf_path = os.path.join(upload_folder, pdf_filename)
        with open(pdf_path, "wb") as f: 
            f.write(file_bytes)
        return { "pdf_id": pdf_filename, "total_pages": 0 }
    except Exception as e: 
        print(f"PDF Save Error: {e}")
        return None

def get_thumbnails_batch(pdf_filename, upload_folder, start_page, limit=6):
    try:
        pdf_path = os.path.join(upload_folder, pdf_filename)
        batch_id = pdf_filename.split("_source")[0]
        pages = convert_from_path(
            pdf_path, poppler_path=POPPLER_BIN, size=(None, 250),
            fmt="jpeg", first_page=start_page, last_page=start_page + limit - 1
        )
        thumbnails = []
        for i, page in enumerate(pages):
            thumb_name = f"{batch_id}_thumb_{start_page + i}.jpg"
            page.save(os.path.join(upload_folder, thumb_name), "JPEG")
            thumbnails.append(f"/static/uploads/{thumb_name}")
        return thumbnails
    except Exception as e: 
        print(f"Thumbnail Error: {e}")
        return []

def get_high_res_page(pdf_filename, page_number, upload_folder):
    """
    Pure conversion for the masking editor. No trimming.
    """
    try:
        pdf_path = os.path.join(upload_folder, pdf_filename)
        images = convert_from_path(
            pdf_path, poppler_path=POPPLER_BIN,
            first_page=page_number + 1, last_page=page_number + 1,
            dpi=200, fmt="png"
        )
        if not images: return None
        
        output_name = f"highres_{pdf_filename}_{page_number}.png"
        images[0].save(os.path.join(upload_folder, output_name), "PNG")
        return f"/static/uploads/{output_name}"
    except Exception as e:
        print(f"High-Res Error: {e}")
        return None

def convert_pdf_to_image_bytes(pdf_bytes):
    """
    Pure conversion for restoration. No trimming. Matches the editor exactly.
    """
    try:
        images = convert_from_bytes(pdf_bytes, poppler_path=POPPLER_BIN, dpi=200, fmt="png")
        if not images: return None
        
        img_byte_arr = io.BytesIO()
        images[0].save(img_byte_arr, format='PNG')
        img_byte_arr.seek(0)
        return img_byte_arr.read()
    except Exception as e:
        print(f"PDF Conversion Error: {e}")
        return None