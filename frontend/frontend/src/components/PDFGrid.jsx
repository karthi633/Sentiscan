import React from "react";

export default function PDFGrid({ pages, onSelectPage, hasMore, loadingMore }) {
  // Logic: If we have no pages yet, OR if we are loading more, show skeletons
  const showSkeletons = pages.length === 0 || loadingMore;
  
  // If we have pages, show them. If not, show 10 fake ones.
  const itemsToRender = pages.length > 0 ? pages : [];

  return (
    <div style={{ width: "100%", padding: "30px", boxSizing: "border-box", maxWidth: "1600px", margin: "0 auto" }}>
      
      <div style={{ marginBottom: "20px", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
        <h3 style={{ color: "#333", margin: 0 }}>
          {pages.length > 0 ? `Select a page (${pages.length} loaded)` : "Processing Document..."}
        </h3>
      </div>

      <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", 
          gap: "20px",
          width: "100%"
      }}>
        {/* 1. RENDER REAL PAGES */}
        {itemsToRender.map((url, index) => (
          <div
            key={index}
            onClick={() => onSelectPage(url, index)}
            style={{
              border: "1px dashed #ccc", borderRadius: "8px", cursor: "pointer",
              background: "white", padding: "10px", display: "flex",
              flexDirection: "column", alignItems: "center", 
              transition: "transform 0.2s",
              boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-3px)"}
            onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
          >
            <div style={{ width: "100%", height: "200px", background: "#f9f9f9", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "10px", overflow: "hidden", borderRadius: "4px" }}>
                <img src={`http://127.0.0.1:8000${url}`} alt={`Page ${index + 1}`} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
            </div>
            <div style={{ fontSize: "13px", color: "#555", fontWeight: "600" }}>Page {index + 1}</div>
          </div>
        ))}

        {/* 2. RENDER SKELETONS (If loading) */}
        {showSkeletons && Array.from({ length: 10 }).map((_, i) => (
            <div key={`skel-${i}`} style={{
              border: "1px dashed #eee", borderRadius: "8px", background: "#fff",
              padding: "10px", display: "flex", flexDirection: "column", alignItems: "center"
            }}>
                {/* Pulsing Box */}
                <div style={{ 
                    width: "100%", height: "200px", background: "#f0f0f0", 
                    borderRadius: "4px", animation: "pulse 1s infinite ease-in-out" 
                }}></div>
                <div style={{ marginTop: 10, width: "60px", height: "12px", background: "#f0f0f0", borderRadius: 4 }}></div>
            </div>
        ))}
      </div>

      <style>{`@keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }`}</style>
    </div>
  );
}