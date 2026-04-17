import cv2
import numpy as np
import json
import uuid
import os
from .crypto import encrypt_data

ORIGINALS = "originals"
MASKED = "masked"

def get_content_bbox(img):
    """Computer Vision function to find the actual ID card and ignore white margins."""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (9, 9), 0)
    _, thresh = cv2.threshold(blurred, 245, 255, cv2.THRESH_BINARY_INV)
    coords = cv2.findNonZero(thresh)
    if coords is not None:
        return cv2.boundingRect(coords)
    return 0, 0, img.shape[1], img.shape[0]

# Accepts raw file_bytes directly to prevent memory stream crashes
async def apply_masks_and_save_regions(file_bytes, coords_json):
    nparr = np.frombuffer(file_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        raise ValueError("OpenCV could not decode the image bytes.")

    h_orig, w_orig = img.shape[:2]
    bx, by, bw, bh = get_content_bbox(img)
    
    # Safe division guards
    bw = max(1, bw)
    bh = max(1, bh)

    coords = json.loads(coords_json)
    image_id = str(uuid.uuid4())
    
    session_metadata = {
        "image_id": image_id,
        "regions": []
    }

    # The Overlap Patch (Hides black edges on restoration)
    BLEED = 3 

    for i, box in enumerate(coords):
        x, y, w, h = int(box["x"]), int(box["y"]), int(box["w"]), int(box["h"])

        # Calculate the slightly larger patch
        ex = max(0, x - BLEED)
        ey = max(0, y - BLEED)
        ew = min(w_orig - ex, w + (2 * BLEED))
        eh = min(h_orig - ey, h + (2 * BLEED))

        # Extract and encrypt the patch
        cropped = img[ey:ey+eh, ex:ex+ew].copy()
        
        # Ensure snippet isn't empty before encoding
        if cropped.size == 0: continue

        _, buffer = cv2.imencode('.png', cropped)
        encrypted_bytes = encrypt_data(buffer.tobytes()) 

        region_filename = f"{image_id}_region_{i}.enc"
        with open(os.path.join(ORIGINALS, region_filename), "wb") as f:
            f.write(encrypted_bytes)

        # Mask the original strict coordinates (The Hole)
        img[y:y+h, x:x+w] = (0, 0, 0) 

        # Save percentages relative to the Anchor Box
        x_pct = (ex - bx) / float(bw)
        y_pct = (ey - by) / float(bh)
        w_pct = ew / float(bw)
        h_pct = eh / float(bh)

        session_metadata["regions"].append({
            "file": region_filename,
            "x_pct": x_pct,
            "y_pct": y_pct,
            "w_pct": w_pct,
            "h_pct": h_pct
        })

    with open(os.path.join(ORIGINALS, f"{image_id}_meta.json"), "w") as f:
        json.dump(session_metadata, f)

    masked_filename = f"{image_id}_masked.png"
    cv2.imwrite(os.path.join(MASKED, masked_filename), img)

    return {"status": "success", "image_id": image_id, "masked_image_url": f"/static/masked/{masked_filename}"}