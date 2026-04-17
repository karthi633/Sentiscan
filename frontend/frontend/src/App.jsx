import { useState } from "react";
import MaskEditor from "./components/MaskEditor";
import BlurPreview from "./components/BlurPreview";
import RestorePreview from "./components/RestorePreview";
import AdminDashboard from "./components/AdminDashboard";
import { sendMask } from "./api/api";

function App() {
  // --- CORE STATE ---
  const [step, setStep] = useState("mask"); // Current step in the 3-part flow
  const [viewMode, setViewMode] = useState("app"); // "app" for scanner, "logs" for Admin Dashboard
  
  // --- DATA STATE ---
  const [blurResult, setBlurResult] = useState(null);
  const [tokenId, setTokenId] = useState(null);
  const [riskScore, setRiskScore] = useState(100);

  // --- HANDLERS ---
  const handleMaskComplete = async (file, rectangles) => {
    try {
      console.log("Commencing Secure Handover...");
      const response = await sendMask(file, rectangles);
      
      if (response && response.masked_image_url) {
        setTokenId(response.image_id);
        setBlurResult(response.masked_image_url);
        setRiskScore(response.risk_score || 100);
        setStep("blur"); // Transition to Security Analysis Step
      } else {
        alert("Security Error: " + (response.error || "Backend processing failed."));
      }
    } catch (err) {
      console.error("Connection Error:", err);
      alert("System Offline: Ensure main.py is running on port 8000.");
    }
  };

  const startNewSession = () => {
    setStep("mask");
    setBlurResult(null);
    setTokenId(null);
    setViewMode("app");
  };

  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh", backgroundColor: "#f8fafc", overflow: "hidden" }}>
      
      {/* SIDEBAR NAVIGATION */}
      <aside style={{ width: "260px", backgroundColor: "#0f172a", color: "white", padding: "30px 20px", display: "flex", flexDirection: "column", gap: "25px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <div style={{ width: "32px", height: "32px", backgroundColor: "#6366f1", borderRadius: "8px", boxShadow: "0 0 15px rgba(99, 102, 241, 0.5)" }}></div>
          <h2 style={{ fontSize: "22px", margin: 0, fontWeight: "800", letterSpacing: "-0.5px" }}>Senti<span style={{color: "#818cf8"}}>Scan</span></h2>
        </div>
        
        <nav style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div 
            onClick={startNewSession} 
            style={{ 
              padding: "12px 16px", borderRadius: "10px", cursor: "pointer", 
              backgroundColor: (viewMode === "app") ? "#1e293b" : "transparent",
              color: (viewMode === "app") ? "#f8fafc" : "#94a3b8",
              fontWeight: "600", transition: "all 0.2s"
            }}
          >
            🛡️ Secure Upload
          </div>
          <div 
            onClick={() => setViewMode("logs")} 
            style={{ 
              padding: "12px 16px", borderRadius: "10px", cursor: "pointer", 
              backgroundColor: (viewMode === "logs") ? "#1e293b" : "transparent",
              color: (viewMode === "logs") ? "#f8fafc" : "#94a3b8",
              fontWeight: "600", transition: "all 0.2s"
            }}
          >
            📋 Audit Logs
          </div>
          <div style={{ padding: "12px 16px", borderRadius: "10px", opacity: 0.3, cursor: "not-allowed", color: "#94a3b8" }}>⚙️ Settings</div>
        </nav>

        <div style={{ marginTop: "auto", padding: "15px", backgroundColor: "#1e293b", borderRadius: "12px", fontSize: "11px", color: "#64748b" }}>
          <p>SentiScan v1.0</p>
          <p>Status: <span style={{color: "#10b981"}}>● Online</span></p>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" }}>
        
        {/* TOP STATUS HEADER */}
        <header style={{ padding: "20px 40px", backgroundColor: "white", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <h3 style={{ margin: 0, color: "#1e293b", fontSize: "18px", fontWeight: "700" }}>
            {viewMode === "logs" ? "Security Compliance Dashboard" : "Data Masking Workflow"}
          </h3>
          {viewMode === "app" && (
            <div style={{ display: "flex", gap: "35px" }}>
               <StepIndicator num="1" label="IDENTIFY" active={step === "mask"} />
               <StepIndicator num="2" label="SECURE" active={step === "blur"} />
               <StepIndicator num="3" label="VALIDATE" active={step === "restore"} />
            </div>
          )}
        </header>

        {/* COMPONENT LOADING ZONE */}
        <div style={{ padding: "40px", display: "flex", justifyContent: "center" }}>
          <div style={{ width: "100%", maxWidth: "1250px" }}>
            {viewMode === "logs" ? (
              <AdminDashboard goBack={() => setViewMode("app")} />
            ) : (
              <>
                {step === "mask" && <MaskEditor onMaskComplete={handleMaskComplete} />}
                {step === "blur" && (
                  <BlurPreview 
                    blurredImage={blurResult} 
                    riskScore={riskScore} 
                    goRestore={() => setStep("restore")} 
                    goBack={() => setStep("mask")} 
                  />
                )}
                {step === "restore" && <RestorePreview tokenId={tokenId} />}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

const StepIndicator = ({ num, label, active }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "10px", opacity: active ? 1 : 0.3 }}>
    <div style={{ 
      width: "28px", height: "28px", borderRadius: "50%", 
      backgroundColor: active ? "#6366f1" : "#cbd5e0", 
      color: "white", display: "flex", alignItems: "center", 
      justifyContent: "center", fontSize: "13px", fontWeight: "800" 
    }}>
      {num}
    </div>
    <span style={{ fontSize: "11px", fontWeight: "800", color: "#1e293b", letterSpacing: "0.05em" }}>{label}</span>
  </div>
);

export default App;