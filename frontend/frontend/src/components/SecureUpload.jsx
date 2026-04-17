import React, { useRef, useState } from "react";

export default function SecureUpload({ onFileSelect }) {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState("");

  // Triggers the hidden HTML input when the styled box is clicked
  const handleBoxClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFileName(file.name);
      if (onFileSelect) onFileSelect(file); // Pass file to your parent function
    }
  };

  // Drag and Drop visual feedback
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFileName(file.name);
      if (onFileSelect) onFileSelect(file);
    }
  };

  return (
    <div style={{ padding: "20px", textAlign: "center", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ 
          backgroundColor: "white", 
          borderRadius: "20px", 
          padding: "50px", 
          border: "1px solid #e2e8f0", 
          boxShadow: "0 10px 25px rgba(0,0,0,0.05)", 
          maxWidth: "750px", 
          margin: "0 auto" 
      }}>
        
        <div style={{ display: "inline-block", padding: "8px 16px", backgroundColor: "#f1f5f9", color: "#475569", borderRadius: "30px", fontSize: "12px", fontWeight: "bold", marginBottom: "15px", letterSpacing: "0.5px" }}>
          PHASE 1: SECURE INGESTION
        </div>
        
        <h2 style={{ color: "#0f172a", fontSize: "32px", fontWeight: "800", marginBottom: "12px", letterSpacing: "-0.5px" }}>
          Initialize Security Scan
        </h2>
        <p style={{ color: "#64748b", marginBottom: "40px", maxWidth: "550px", margin: "0 auto 40px", fontSize: "15px", lineHeight: "1.6" }}>
          Upload a government ID, financial record, or document PDF. SentiScan will automatically detect and encrypt Personally Identifiable Information (PII) before it leaves your network.
        </p>

        {/* The Clickable Drag & Drop Zone */}
        <div 
          onClick={handleBoxClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{ 
            border: dragActive ? "2px dashed #3b82f6" : "2px dashed #cbd5e0", 
            padding: "60px 20px", 
            borderRadius: "16px", 
            backgroundColor: dragActive ? "#eff6ff" : "#f8fafc", 
            transition: "all 0.2s ease", 
            cursor: "pointer",
            position: "relative"
          }}
        >
          {/* Hidden File Input */}
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange} 
            accept="image/png, image/jpeg, application/pdf"
            style={{ display: "none" }} 
          />

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "15px" }}>
            <div style={{ width: "64px", height: "64px", backgroundColor: "#e2e8f0", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg style={{ width: "32px", height: "32px", color: "#64748b" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            
            <div>
              <p style={{ color: "#0f172a", fontSize: "18px", fontWeight: "600", margin: "0 0 5px 0" }}>
                {selectedFileName ? selectedFileName : "Click to upload or drag and drop"}
              </p>
              <p style={{ color: "#94a3b8", fontSize: "14px", margin: "0" }}>
                Supports PDF, PNG, or JPG (Max 15MB)
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button 
          disabled={!selectedFileName}
          style={{
            marginTop: "35px",
            padding: "16px 50px",
            backgroundColor: selectedFileName ? "#0f172a" : "#cbd5e0",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: selectedFileName ? "pointer" : "not-allowed",
            boxShadow: selectedFileName ? "0 4px 15px rgba(15, 23, 42, 0.2)" : "none",
            transition: "all 0.2s ease",
            width: "100%",
            maxWidth: "400px"
          }}
        >
          Proceed to PII Detection ➔
        </button>

      </div>
    </div>
  );
}