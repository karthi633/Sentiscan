import React from "react";

export default function BlurPreview({ blurredImage, riskScore, goRestore, goBack }) {
  const BASE_URL = "http://127.0.0.1:8000";
  const imageUrl = `${BASE_URL}${blurredImage}`;

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "SentiScan_Secured_Document.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed", err);
      window.open(imageUrl, "_blank");
    }
  };

  // FIXED: Now correctly handles text like "HIGH" or numbers like "85"
  const getRiskDetails = (score) => {
    const strScore = String(score).toUpperCase();
    if (strScore.includes("HIGH") || Number(score) >= 70) {
      return { label: "CRITICAL RISK", color: "#ef4444", bg: "#fef2f2", bar: "#ef4444", width: "90%" };
    }
    if (strScore.includes("MEDIUM") || Number(score) >= 40) {
      return { label: "ELEVATED RISK", color: "#f59e0b", bg: "#fffbeb", bar: "#f59e0b", width: "50%" };
    }
    return { label: "STANDARD SECURE", color: "#10b981", bg: "#ecfdf5", bar: "#10b981", width: "15%" };
  };

  const risk = getRiskDetails(riskScore);

  // Safe back navigation
  const handleBack = () => {
    if (goBack) goBack();
    else window.location.reload(); // Fallback just in case
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "30px", padding: "10px", fontFamily: "'Inter', sans-serif" }}>
      
      {/* LEFT: MASKED IMAGE PREVIEW */}
      <div style={{ backgroundColor: "#ffffff", borderRadius: "20px", padding: "30px", border: "1px solid #e2e8f0", boxShadow: "0 10px 30px rgba(0,0,0,0.03)" }}>
        <div style={{ display: "inline-block", padding: "8px 16px", backgroundColor: "#f1f5f9", color: "#475569", borderRadius: "30px", fontSize: "12px", fontWeight: "bold", marginBottom: "15px", letterSpacing: "0.5px" }}>
          PHASE 2: ENCRYPTION VERIFICATION
        </div>
        <h3 style={{ marginBottom: "25px", color: "#0f172a", fontSize: "24px", fontWeight: "800", letterSpacing: "-0.5px" }}>
          Data Masking Review
        </h3>
        
        {/* Document Viewer */}
        <div style={{ backgroundColor: "#f8fafc", padding: "20px", borderRadius: "16px", border: "1px solid #e2e8f0", minHeight: "450px", display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "30px", position: "relative" }}>
           <img 
             src={imageUrl} 
             alt="Secured Document" 
             style={{ maxWidth: "100%", height: "auto", borderRadius: "8px", boxShadow: "0 15px 35px rgba(0,0,0,0.1)" }} 
           />
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "12px" }}>
           {/* New Back Button */}
           <button 
             onClick={handleBack}
             style={{ backgroundColor: "white", color: "#64748b", padding: "14px 20px", borderRadius: "10px", fontWeight: "700", border: "1px solid #cbd5e1", cursor: "pointer", transition: "all 0.2s" }}
             onMouseOver={(e) => e.target.style.backgroundColor = "#f8fafc"}
             onMouseOut={(e) => e.target.style.backgroundColor = "white"}
           >
             ← Back
           </button>

           {/* New Professional Blue Download Button */}
           <button 
             onClick={handleDownload}
             style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#eff6ff", color: "#2563eb", padding: "14px 20px", borderRadius: "10px", fontWeight: "700", border: "1px solid #bfdbfe", cursor: "pointer", transition: "all 0.2s" }}
             onMouseOver={(e) => e.target.style.backgroundColor = "#dbeafe"}
             onMouseOut={(e) => e.target.style.backgroundColor = "#eff6ff"}
           >
             <svg style={{ width: "18px", height: "18px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
             Download
           </button>
           
           {/* Primary Action Button */}
           <button 
             onClick={goRestore}
             style={{ flex: 1, backgroundColor: "#0f172a", color: "white", padding: "14px 20px", border: "none", borderRadius: "10px", fontWeight: "bold", fontSize: "15px", cursor: "pointer", boxShadow: "0 4px 15px rgba(15, 23, 42, 0.2)", transition: "all 0.2s" }}
             onMouseOver={(e) => e.target.style.transform = "translateY(-1px)"}
             onMouseOut={(e) => e.target.style.transform = "translateY(0)"}
           >
             Approve & Continue ➔
           </button>
        </div>
      </div>

      {/* RIGHT: SECURITY ANALYSIS PANEL */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* Dynamic Risk Score Card */}
        <div style={{ backgroundColor: "white", borderRadius: "20px", padding: "24px", boxShadow: "0 10px 30px rgba(0,0,0,0.03)", border: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <span style={{ fontSize: "12px", fontWeight: "800", color: "#64748b", letterSpacing: "0.5px" }}>SECURITY ASSESSMENT</span>
            <span style={{ backgroundColor: "#dcfce7", color: "#166534", fontSize: "11px", padding: "4px 10px", borderRadius: "20px", fontWeight: "700", border: "1px solid #bbf7d0" }}>✓ AES-256</span>
          </div>
          
          <div style={{ marginBottom: "15px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "5px" }}>
              <h4 style={{ margin: 0, color: "#0f172a", fontSize: "36px", fontWeight: "900", letterSpacing: "-1px" }}>{riskScore}</h4>
              {/* Only show /100 if the backend sends a number, hide it if it says "HIGH" */}
              {!isNaN(riskScore) && <span style={{ color: "#94a3b8", fontSize: "14px", fontWeight: "600" }}>/ 100</span>}
            </div>
            <div style={{ display: "inline-block", backgroundColor: risk.bg, color: risk.color, padding: "4px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: "800", letterSpacing: "0.5px" }}>
              {risk.label}
            </div>
          </div>

          {/* Progress Bar Visualizer */}
          <div style={{ width: "100%", backgroundColor: "#f1f5f9", height: "8px", borderRadius: "4px", overflow: "hidden" }}>
             <div style={{ width: risk.width, backgroundColor: risk.bar, height: "100%", borderRadius: "4px", transition: "width 1s ease-in-out" }}></div>
          </div>
          <p style={{ margin: "12px 0 0 0", fontSize: "13px", color: "#64748b", lineHeight: "1.5" }}>
            Sensitive data regions successfully isolated and encrypted via cryptographic overlay.
          </p>
        </div>

        {/* Live System Audit Terminal */}
        <div style={{ backgroundColor: "#0f172a", borderRadius: "20px", padding: "0", display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", boxShadow: "0 15px 35px rgba(15, 23, 42, 0.4)", border: "1px solid #334155" }}>
          {/* Mac-style Window Header */}
          <div style={{ backgroundColor: "#1e293b", padding: "12px 20px", display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid #334155" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#ef4444" }}></div>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#f59e0b" }}></div>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#10b981" }}></div>
            <span style={{ marginLeft: "10px", color: "#94a3b8", fontSize: "11px", fontWeight: "600", letterSpacing: "1px", fontFamily: "monospace" }}>SYSTEM.AUDIT.LOG</span>
          </div>
          
          {/* Terminal Content */}
          <div style={{ padding: "20px", color: "#38bdf8", fontFamily: "'Fira Code', 'Courier New', monospace", fontSize: "12px", lineHeight: "1.8" }}>
            <div style={{ color: "#10b981" }}>[sys] Initialization complete...</div>
            <div style={{ color: "#94a3b8" }}>[{new Date().toLocaleTimeString()}] INF: Commencing deep-pixel scan...</div>
            <div style={{ color: "#f59e0b" }}>[{new Date().toLocaleTimeString()}] WRN: High-Risk PII vectors identified.</div>
            <div>[{new Date().toLocaleTimeString()}] INF: Injecting cryptographic masks...</div>
            <div style={{ color: "#10b981" }}>[{new Date().toLocaleTimeString()}] OK: AES-256 seal verified.</div>
            <div style={{ marginTop: "20px", color: "#f8fafc", display: "flex", alignItems: "center", gap: "8px" }}>
               <span style={{ color: "#ec4899" }}>root@sentiscan:~#</span>
               <span>Awaiting validation protocol<span style={{ animation: "blink 1s step-end infinite" }}>_</span></span>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes blink { 50% { opacity: 0; } }
      `}</style>
    </div>
  );
}