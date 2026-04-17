import cv2
import numpy as np
import os
import json
from PIL import Image
from .crypto import decrypt_data

ORIGINALS = "originals"
RESTORED = "restored"

def get_content_bbox(img):
    """Finds the actual document inside the returning I Love PDF A4 padding."""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (9, 9), 0)
    _, thresh = cv2.threshold(blurred, 245, 255, cv2.THRESH_BINARY_INV)
    coords = cv2.findNonZero(thresh)
    if coords is not None:
        return cv2.boundingRect(coords)
    return 0, 0, img.shape[1], img.shape[0]

async def restore_image_logic(file_bytes, image_id, is_pdf=False):
    nparr = np.frombuffer(file_bytes, np.uint8)
    edited_img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if edited_img is None: 
        raise ValueError("Format identification failed: Could not decode document bytes.")

    meta_path = os.path.join(ORIGINALS, f"{image_id}_meta.json")
    if not os.path.exists(meta_path):
        raise FileNotFoundError("Security metadata session lost. Please mask the original again.")

    with open(meta_path, "r") as f:
        metadata = json.load(f)
    
    bx, by, bw, bh = get_content_bbox(edited_img)
    bw, bh = max(1, bw), max(1, bh)
    
    regions = metadata["regions"]

    for item in regions:
        # Remap percentages back to pixels using the CARD dimensions
        x = int(round(item["x_pct"] * bw)) + bx
        y = int(round(item["y_pct"] * bh)) + by
        w = int(round(item["w_pct"] * bw))
        h = int(round(item["h_pct"] * bh))

        region_path = os.path.join(ORIGINALS, item["file"])
        if os.path.exists(region_path):
            try:
                with open(region_path, "rb") as f:
                    encrypted_content = f.read()
                
                decrypted_bytes = decrypt_data(encrypted_content)
                nparr_crop = np.frombuffer(decrypted_bytes, np.uint8)
                secret_part = cv2.imdecode(nparr_crop, cv2.IMREAD_COLOR)
                
                if secret_part is not None:
                    # Resize the patch with high-quality interpolation
                    secret_part = cv2.resize(secret_part, (w, h), interpolation=cv2.INTER_LANCZOS4)
                    
                    img_h, img_w = edited_img.shape[:2]
                    
                    # Safe Array Slicing to prevent boundary crashes
                    y1, y2 = max(0, y), min(img_h, y + h)
                    x1, x2 = max(0, x), min(img_w, x + w)
                    
                    sp_y1 = 0 if y >= 0 else -y
                    sp_y2 = h - ((y + h) - img_h) if (y + h) > img_h else h
                    sp_x1 = 0 if x >= 0 else -x
                    sp_x2 = w - ((x + w) - img_w) if (x + w) > img_w else w

                    # Paste the Patch over the hole
                    edited_img[y1:y2, x1:x2] = secret_part[sp_y1:sp_y2, sp_x1:sp_x2]
            except Exception as e:
                print(f"Reinjection Error: {e}")
                continue

    # Always generate a PNG for the frontend preview
    preview_filename = f"{image_id}_preview.png"
    cv2.imwrite(os.path.join(RESTORED, preview_filename), edited_img)
    
    # Generate PDF if the user uploaded a PDF
    if is_pdf:
        download_filename = f"{image_id}_restored.pdf"
        rgb_img = cv2.cvtColor(edited_img, cv2.COLOR_BGR2RGB)
        pil_img = Image.fromarray(rgb_img)
        pil_img.save(os.path.join(RESTORED, download_filename), "PDF", resolution=200.0)
        file_extension = ".pdf"
    else:
        download_filename = preview_filename
        file_extension = ".png"

    return {
        "status": "success", 
        "restored_image_url": f"/static/restored/{preview_filename}",
        "download_url": f"/static/restored/{download_filename}",      
        "file_ext": file_extension
    }