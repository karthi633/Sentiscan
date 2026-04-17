import os
import urllib.request
import zipfile
import shutil

# URL for Poppler (Windows)
POPPLER_URL = "https://github.com/oschwartz10612/poppler-windows/releases/download/v24.02.0-0/Release-24.02.0-0.zip"
ZIP_NAME = "poppler.zip"
EXTRACT_DIR = "poppler_temp"
FINAL_DIR = "poppler"

print(f"⬇️  Downloading Poppler from {POPPLER_URL}...")
try:
    # Download
    with urllib.request.urlopen(POPPLER_URL) as response, open(ZIP_NAME, 'wb') as out_file:
        shutil.copyfileobj(response, out_file)
    print("✅ Download complete.")

    # Extract
    print("📦 Extracting...")
    with zipfile.ZipFile(ZIP_NAME, 'r') as zip_ref:
        zip_ref.extractall(EXTRACT_DIR)
    
    # Move the internal folder to 'backend/poppler'
    # The zip usually contains a subfolder like 'poppler-24.02.0', we need to find it.
    extracted_subfolder = os.listdir(EXTRACT_DIR)[0] # Get the folder name
    source = os.path.join(EXTRACT_DIR, extracted_subfolder)
    
    if os.path.exists(FINAL_DIR):
        print(f"⚠️  Removing old {FINAL_DIR} folder...")
        shutil.rmtree(FINAL_DIR)
        
    shutil.move(source, FINAL_DIR)
    print(f"✅ Installed to: {os.path.abspath(FINAL_DIR)}")

    # Cleanup
    os.remove(ZIP_NAME)
    shutil.rmtree(EXTRACT_DIR)
    print("✨ Cleanup done. Poppler is ready!")

except Exception as e:
    print(f"❌ Error: {e}")