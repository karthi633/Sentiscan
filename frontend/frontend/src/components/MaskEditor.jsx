import { useRef, useState, useEffect } from "react";
import { detectPII } from "../api/api"; 
import PDFGrid from "./PDFGrid"; 
import "./maskeditor.css";

export default function MaskEditor({ onMaskComplete }) {
  // --- STATE VARIABLES ---
  const [view, setView] = useState("upload");
  const [file, setFile] = useState(null); 
  const [image, setImage] = useState(null);
  
  // PDF State
  const [pdfId, setPdfId] = useState(null); 
  const [pdfPages, setPdfPages] = useState([]); 
  const [hasMore, setHasMore] = useState(true); 

  // Canvas State
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [rectangles, setRectangles] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [start, setStart] = useState({ x: 0, y: 0 });
  const [isDetecting, setIsDetecting] = useState(false);
  const [loading, setLoading] = useState(false); 
  const [loadingMore, setLoadingMore] = useState(false);

  // Drag & Drop State
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  // --- 1. AUTO-LOAD BATCHES (PDF) ---
  useEffect(() => {
    if (view === "grid" && pdfId && hasMore && !loadingMore) {
        loadNextBatch();
    }
  }, [view, pdfId, pdfPages.length, hasMore, loadingMore]);

  const loadNextBatch = async () => {
      setLoadingMore(true);
      try {
          const formData = new FormData();
          formData.append("pdf_id", pdfId);
          formData.append("start_page", pdfPages.length + 1);
          formData.append("limit", 6); 
          
          const res = await fetch("http://127.0.0.1:8000/get-thumbnails-batch", { method: "POST", body: formData });
          const data = await res.json();
          
          if (data.pages && data.pages.length > 0) {
              setPdfPages(prev => [...prev, ...data.pages]);
          } else {
              setHasMore(false);
          }
      } catch (err) { 
          console.error("Batch fetch failed", err);
          setHasMore(false); 
      } finally {
          setLoadingMore(false);
          setLoading(false); 
      }
  };

  // --- 2. CANVAS RENDER ENGINE ---
  useEffect(() => {
    if (view === "canvas" && image && canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctxRef.current = ctx;

        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;

        draw(); 
    }
  }, [view, image, rectangles]);

  // --- 3. UPLOAD HANDLER (Updated for Drag & Drop) ---
  const handleBoxClick = () => fileInputRef.current.click();
  
  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleFileSelect = async (f) => {
    if (!f) return;
    setRectangles([]); 

    if (f.type.startsWith("image/")) {
        setFile(f);
        const url = URL.createObjectURL(f);
        loadImageToCanvas(url);
        setView("canvas");
        return;
    }

    if (f.type === "application/pdf") {
        setLoading(true); 
        const formData = new FormData();
        formData.append("file", f);
        try {
            const res = await fetch("http://127.0.0.1:8000/upload-pdf", { method: "POST", body: formData });
            const data = await res.json();
            
            if (data.pdf_id) {
                setPdfId(data.pdf_id);
                setPdfPages([]); 
                setHasMore(true);
                setView("grid"); 
            } else { 
                alert("Ingestion Fault: The document format is corrupted or unsupported.");
                setLoading(false); 
            }
        } catch (err) { 
            alert("Backend unreachable. Ensure main.py is running.");
            setLoading(false); 
        }
    }
  };

  // --- 4. PAGE SELECTION HANDLER ---
  const handlePageSelect = async (url, index) => {
      if (!url) return; 
      setLoading(true);
      try {
          const formData = new FormData();
          formData.append("pdf_id", pdfId);
          formData.append("page_index", index);
          const res = await fetch("http://127.0.0.1:8000/get-page-image", { method: "POST", body: formData });
          const data = await res.json();
          if (data.url) {
              const imgRes = await fetch(`http://127.0.0.1:8000${data.url}`);
              const blob = await imgRes.blob();
              const pageFile = new File([blob], `page_${index}.png`, { type: "image/png" });
              setFile(pageFile);
              setRectangles([]);
              const objectUrl = URL.createObjectURL(blob);
              loadImageToCanvas(objectUrl);
              setView("canvas");
          }
      } catch (err) { alert("Error loading page."); }
      setLoading(false);
  };

  const loadImageToCanvas = (url) => {
      const img = new Image();
      img.onload = () => setImage(img);
      img.src = url;
  };

  // --- 5. INTELLIGENT AUTO-DETECT ---
  const handleAutoDetect = async () => { 
    if (!file) return alert("No file."); 
    setIsDetecting(true); 
    
    setTimeout(async () => {
        try { 
          const response = await detectPII(file); 
          if (response.detected_regions && response.detected_regions.length > 0) { 
            const newRects = response.detected_regions.map(r => ({ 
              x: r.x, y: r.y, w: r.w, h: r.h 
            })); 
            setRectangles(prev => [...prev, ...newRects]); 
          }
        } catch (err) { 
          alert("Detection Error"); 
        } 
        setIsDetecting(false); 
    }, 2000);
  };

  // --- 6. CANVAS DRAWING LOGIC ---
  const getScaledPos = (e) => { 
    const rect = canvasRef.current.getBoundingClientRect(); 
    const scaleX = canvasRef.current.width / rect.width; 
    const scaleY = canvasRef.current.height / rect.height; 
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY }; 
  };

  const startDraw = (e) => { if (!image) return; setStart(getScaledPos(e)); setIsDrawing(true); };
  
  const drawing = (e) => { 
    if (!isDrawing) return; 
    const pos = getScaledPos(e); 
    draw({ x: Math.min(pos.x, start.x), y: Math.min(pos.y, start.y), w: Math.abs(pos.x - start.x), h: Math.abs(pos.y - start.y) }); 
  };

  const endDraw = (e) => { 
    setIsDrawing(false); 
    const pos = getScaledPos(e); 
    const w = Math.abs(pos.x - start.x); 
    const h = Math.abs(pos.y - start.y); 
    if (w > 5 && h > 5) {
      setRectangles(prev => [...prev, { x: Math.min(pos.x, start.x), y: Math.min(pos.y, start.y), w, h }]);
    }
  };
  
  const draw = (tempRect = null) => {
    const ctx = ctxRef.current; 
    if (!ctx || !image) return;
    
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.drawImage(image, 0, 0);
    
    ctx.lineWidth = Math.max(2, image.naturalWidth / 400); 
    ctx.strokeStyle = "#ef4444"; 
    ctx.fillStyle = "rgba(239, 68, 68, 0.3)";
    
    rectangles.forEach(r => { 
      ctx.fillRect(r.x, r.y, r.w, r.h); 
      ctx.strokeRect(r.x, r.y, r.w, r.h); 
    });

    if (tempRect) { 
      ctx.fillRect(tempRect.x, tempRect.y, tempRect.w, tempRect.h); 
      ctx.strokeRect(tempRect.x, tempRect.y, tempRect.w, tempRect.h); 
    }
  };

  const finishMasking = () => { 
    if (rectangles.length === 0) return alert("Select or Auto-Detect items to mask."); 
    onMaskComplete(file, rectangles); 
  };

  return (
    <div className="mask-container">
      
      {/* LOADING OVERLAY */}
      {loading && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(255,255,255,0.8)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
           <div className="spinner" style={{ width: 40, height: 40, border: '4px solid #f3f3f3', borderTop: '4px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
           <p style={{ marginTop: 15, color: '#6366f1', fontWeight: 'bold' }}>Analyzing & Processing Document...</p>
        </div>
      )}

      {/* NEW PROFESSIONAL DROPZONE UI */}
      {view === "upload" && (
        <div style={{ backgroundColor: "white", borderRadius: "20px", padding: "50px", border: "1px solid #e2e8f0", boxShadow: "0 10px 25px rgba(0,0,0,0.05)", maxWidth: "750px", margin: "40px auto", textAlign: 'center' }}>
            <div style={{ display: "inline-block", padding: "8px 16px", backgroundColor: "#f1f5f9", color: "#475569", borderRadius: "30px", fontSize: "12px", fontWeight: "bold", marginBottom: "15px", letterSpacing: "0.5px" }}>
                PHASE 1: SECURE INGESTION
            </div>
            <h2 style={{ color: "#0f172a", fontSize: "32px", fontWeight: "800", marginBottom: "12px", letterSpacing: "-0.5px" }}>
                Initialize Security Scan
            </h2>
            <p style={{ color: "#64748b", marginBottom: "40px", maxWidth: "550px", margin: "0 auto 40px", fontSize: "15px", lineHeight: "1.6" }}>
                Upload a government ID, financial record, or document PDF. SentiScan will automatically detect and encrypt Personally Identifiable Information (PII) before it leaves your network.
            </p>

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
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileInput}
                    accept="image/png, image/jpeg, application/pdf"
                    style={{ display: "none" }}
                />

                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "15px" }}>
                    <div style={{ width: "64px", height: "64px", backgroundColor: "#e2e8f0", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
                        <svg style={{ width: "32px", height: "32px", color: dragActive ? "#3b82f6" : "#64748b" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                    </div>
                    <div>
                        <p style={{ color: "#0f172a", fontSize: "18px", fontWeight: "600", margin: "0 0 5px 0" }}>
                            Click to upload or drag and drop
                        </p>
                        <p style={{ color: "#94a3b8", fontSize: "14px", margin: "0" }}>
                            Supports PDF, PNG, or JPG (Max 15MB)
                        </p>
                    </div>
                </div>
            </div>
        </div>
      )}

      {view === "grid" && (
          <PDFGrid pages={pdfPages} onSelectPage={handlePageSelect} hasMore={hasMore} loadingMore={loadingMore} />
      )}

      {view === "canvas" && (
          <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
              <div style={{ marginBottom: '15px', gap: 12, display: 'flex' }}>
                  <button className="btn-sec" onClick={() => setView(pdfPages.length ? "grid" : "upload")}>Back</button>
                  <button className="btn-ai" onClick={handleAutoDetect} disabled={isDetecting}>
                    {isDetecting ? "🤖 Scanning..." : "🤖 Auto-Detect PII"}
                  </button>
                  <button className="btn-clear" onClick={() => setRectangles([])}>Clear All</button>
              </div>

              <div className={`canvas-wrapper ${isDetecting ? 'detecting' : ''}`}>
                  <canvas ref={canvasRef} onMouseDown={startDraw} onMouseMove={drawing} onMouseUp={endDraw} />
              </div>

              <button className="mask-button" onClick={finishMasking} style={{marginTop: 30}}>
                Confirm Mask & Secure File →
              </button>
          </div>
      )}
      
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}