import { useState } from "react";
import { restoreImage } from "../api/api";

export default function RestorePreview({ tokenId }) {
  const BASE_URL = "http://127.0.0.1:8000";
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [finalImage, setFinalImage] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [fileExt, setFileExt] = useState(".png");
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;

    setFile(f);
    setFinalImage(null); // Reset if they upload a new file
    
    if (f.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(f));
      setStatusMsg("Image detected. Ready for pixel-alignment.");
    } else if (f.type === "application/pdf") {
      setPreviewUrl(null); 
      setStatusMsg("PDF detected. System will normalize scaling for coordinate matching.");
    }
  };

  const handleRestore = async () => {
    if (!file) return alert("Please upload the secured document first.");
    if (!tokenId) return alert("Security Error: Session Token missing.");

    setLoading(true);
    setStatusMsg("Analyzing document structure...");

    try {
      // Step 1: Tell the user we are fixing external scaling (I Love PDF fix)
      setTimeout(() => setStatusMsg("Re-aligning coordinates from external conversion..."), 1000);

      const response = await restoreImage(file, tokenId);
      
      if (response.error) {
        alert("Restoration Failed: " + response.error + "\n\nTip: Ensure the document hasn't been cropped or heavily compressed by the external tool.");
        setStatusMsg("Restoration failed.");
      } else {
        // 1. Set the preview image (Always a PNG for the browser to show)
        // Note: We don't append BASE_URL here because we append it in the JSX below
        setFinalImage(response.restored_image_url);
        
        // 2. Set the actual download file (Will be PDF if they uploaded a PDF)
        setDownloadUrl(response.download_url);
        setFileExt(response.file_ext);
        
        setStatusMsg("Restoration successful!");
      }
    } catch (err) {
      console.error(err);
      alert("Backend Connection Error. Ensure main.py is running.");
      setStatusMsg("System Offline.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!downloadUrl) return;
    
    // Append BASE_URL right before fetching
    const fullDownloadUrl = `${BASE_URL}${downloadUrl}`;

    try {
      const response = await fetch(fullDownloadUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      // This will name it .pdf or .png depending on what the backend sent!
      link.download = `SentiScan_Restored_Verified${fileExt}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      window.open(fullDownloadUrl, "_blank");
    }
  };
  
  return (
    <div style={{ padding: "10px", textAlign: 'center', fontFamily: "'Inter', sans-serif" }}>
      
      {!finalImage ? (
        <div style={{ backgroundColor: "white", borderRadius: "20px", padding: "50px", border: "1px solid #e2e8f0", boxShadow: "0 10px 25px rgba(0,0,0,0.05)", maxWidth: "750px", margin: "0 auto" }}>
            <div style={{ display: "inline-block", padding: "8px 16px", backgroundColor: "#eff6ff", color: "#2563eb", borderRadius: "30px", fontSize: "12px", fontWeight: "bold", marginBottom: "15px" }}>
              STEP 3: SECURE RESTORE
            </div>
            <h2 style={{ color: "#0f172a", fontSize: "28px", fontWeight: "800", marginBottom: "10px" }}>Identity Validation</h2>
            <p style={{ color: "#64748b", marginBottom: "35px", maxWidth: "500px", margin: "0 auto 35px" }}>
              Upload the document processed by external tools. SentiScan will re-sync the pixels and restore your sensitive data.
            </p>
            
            <div style={{ border: "2px dashed #cbd5e0", padding: "50px", borderRadius: "16px", backgroundColor: "#f8fafc", transition: "all 0.3s", cursor: "pointer" }}>
                <input 
                  type="file" 
                  onChange={handleFileChange} 
                  accept="image/*,application/pdf" 
                  style={{ width: "100%", cursor: "pointer" }}
                />
            </div>
            
            {statusMsg && (
              <p style={{ marginTop: "20px", color: "#6366f1", fontSize: "14px", fontWeight: "600" }}>
                {loading ? "⏳ " : "ℹ️ "}{statusMsg}
              </p>
            )}

            {previewUrl && (
                <div style={{ marginTop: "25px", animation: "fadeIn 0.5s ease" }}>
                    <img src={previewUrl} style={{ maxWidth: "200px", borderRadius: "8px", border: "1px solid #e2e8f0", boxShadow: "0 5px 15px rgba(0,0,0,0.05)" }} />
                </div>
            )}

            <button 
                onClick={handleRestore}
                disabled={!file || loading}
                style={{
                    marginTop: "35px",
                    padding: "16px 50px",
                    backgroundColor: loading ? "#94a3b8" : "#0f172a",
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "16px",
                    fontWeight: "bold",
                    cursor: loading ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 15px rgba(15, 23, 42, 0.3)",
                    transition: "transform 0.2s"
                }}
            >
                {loading ? "Re-aligning Pixels..." : "🔓 Unlock & Restore Data"}
            </button>
        </div>
      ) : (
        /* SUCCESS SCREEN */
        <div style={{ backgroundColor: "white", borderRadius: "20px", padding: "50px", border: "1px solid #e2e8f0", boxShadow: "0 20px 40px rgba(0,0,0,0.1)", maxWidth: "850px", margin: "0 auto", animation: "fadeIn 0.6s ease" }}>
            <div style={{ width: "60px", height: "60px", backgroundColor: "#dcfce7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <span style={{ color: "#166534", fontSize: "30px" }}>✓</span>
            </div>
            <h2 style={{ color: "#0f172a", fontSize: "32px", fontWeight: "800", marginBottom: "10px" }}>Restoration Verified</h2>
            <p style={{ color: "#64748b", marginBottom: "30px" }}>Coordinates mapped successfully. Sensitive data has been securely reinjected.</p>
            
            <div style={{ position: "relative", display: "inline-block", marginBottom: "30px" }}>
              <img 
                  src={`${BASE_URL}${finalImage}`} 
                  style={{ maxWidth: "100%", borderRadius: "12px", border: "4px solid #10b981", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }} 
              />
            </div>
            
            <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
              <button 
                  onClick={handleDownload}
                  style={{ padding: "14px 35px", backgroundColor: "#0f172a", color: "white", border: "none", borderRadius: "10px", fontWeight: "bold", cursor: "pointer" }}
              >
                  ⬇️ Download Verified Copy
              </button>
              <button 
                  onClick={() => window.location.reload()} 
                  style={{ padding: "14px 35px", backgroundColor: "white", color: "#0f172a", border: "1px solid #e2e8f0", borderRadius: "10px", fontWeight: "bold", cursor: "pointer" }}
              >
                  Start New Session
              </button>
            </div>
        </div>
      )}
    </div>
  );
}