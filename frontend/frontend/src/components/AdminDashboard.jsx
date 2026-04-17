import React from "react";

export default function BlurPreview({ blurredImage, riskScore, goRestore }) {
  const BASE_URL = "http://127.0.0.1:8000";
  const imageUrl = `${BASE_URL}${blurredImage}`;

  // Helper function to force download the masked image
  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "secured_document_masked.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed", err);
      window.open(imageUrl, "_blank");
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "30px", padding: "10px" }}>
      
      {/* LEFT: MASKED IMAGE PREVIEW */}
      <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0", textAlign: "center", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
        <h3 style={{ marginBottom: "20px", color: "#1e293b", fontSize: "18px", textAlign: 'left' }}>Masking & Validation Preview</h3>
        
        <div style={{ backgroundColor: "#f1f5f9", padding: "20px", borderRadius: "12px", border: "2px dashed #cbd5e0", minHeight: "450px", display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "20px" }}>
           <img 
             src={imageUrl} 
             alt="Secured Document" 
             style={{ maxWidth: "100%", height: "auto", borderRadius: "8px", boxShadow: "0 10px 25px rgba(0,0,0,0.15)" }} 
           />
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: "15px" }}>
           <button style={{ backgroundColor: "#f8fafc", color: "#64748b", padding: "12px 24px", borderRadius: "8px", fontWeight: "600", border: "1px solid #e2e8f0", cursor: "pointer" }}>
             Regenerate Masking
           </button>
           <button 
             onClick={goRestore}
             style={{ backgroundColor: "#10b981", color: "white", padding: "12px 30px", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}
           >
             Approve Masking & Continue →
           </button>
        </div>
      </div>

      {/* RIGHT: SECURITY ANALYSIS PANEL */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        
        {/* Risk Score Card */}
        <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
            <span style={{ fontSize: "11px", fontWeight: "800", color: "#94a3b8" }}>RISK ANALYSIS SCORE</span>
            <span style={{ backgroundColor: "#d1fae5", color: "#065f46", fontSize: "10px", padding: "4px 10px", borderRadius: "20px", fontWeight: "bold" }}>✓ AES-256</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
             <div style={{ width: "70px", height: "70px", borderRadius: "50%", border: "6px solid #fee2e2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: "900", color: "#ef4444" }}>
               {riskScore}
             </div>
             <div>
               <h4 style={{ margin: 0, color: "#ef4444", fontSize: "22px", fontWeight: "900" }}>HIGH</h4>
               <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>Sensitive PII Detected</p>
             </div>
          </div>
        </div>

        {/* Live Audit Trail */}
        <div style={{ backgroundColor: "#0f172a", borderRadius: "16px", padding: "20px", color: "#38bdf8", fontFamily: "monospace", fontSize: "11px", flex: 1 }}>
          <div style={{ color: "#94a3b8", marginBottom: "12px", borderBottom: "1px solid #334155", paddingBottom: "8px", fontWeight: "bold" }}>LIVE SYSTEM AUDIT</div>
          <div>[14:05:01] SUCCESS: PII Scan Complete</div>
          <div>[14:05:02] WARN: Found High-Risk entities</div>
          <div>[14:05:03] INFO: Applying Redaction Layers...</div>
          <div style={{ marginTop: "15px", color: "#f8fafc" }}>$ Ready for validation_</div>
        </div>

        {/* RE-ADDED DOWNLOAD BUTTON */}
        <button 
          onClick={handleDownload}
          style={{ 
            width: "100%", 
            padding: "16px", 
            backgroundColor: "#1e293b", 
            color: "white", 
            border: "none", 
            borderRadius: "12px", 
            fontWeight: "bold", 
            cursor: "pointer", 
            fontSize: "15px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
          }}
        >
          ⬇️ Download Secured PDF/Image
        </button>
      </div>
    </div>
  );
}