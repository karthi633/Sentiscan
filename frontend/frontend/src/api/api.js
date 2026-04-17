// src/api/api.js
const BASE_URL = "http://127.0.0.1:8000";

export async function detectPII(file) {
  const form = new FormData();
  form.append("image", file);

  try {
    const res = await fetch(`${BASE_URL}/detect-pii`, {
      method: "POST",
      body: form,
    });
    const data = await res.json();
    console.log("Detection Response:", data);
    return data;
  } catch (error) {
    console.error("API Error (detectPII):", error);
    return { error: "Failed to connect to backend", detected_regions: [] };
  }
}

export async function sendMask(file, rectangles) {
  const form = new FormData();
  form.append("image", file);
  // Ensure we send the exact format the backend main.py coordinates = Form(...) expects
  form.append("coordinates", JSON.stringify(rectangles));

  try {
    const res = await fetch(`${BASE_URL}/mask-image`, {
      method: "POST",
      body: form,
    });
    const data = await res.json();
    console.log("Masking Response:", data);
    
    // Check if the backend actually returned the expected data
    if (!res.ok) throw new Error(data.error || "Server Error");
    
    return data;
  } catch (error) {
    console.error("API Error (sendMask):", error);
    return { error: error.message };
  }
}

export async function restoreImage(file, imageId) {
  const form = new FormData();
  form.append("image", file);
  form.append("image_id", imageId);

  try {
    const res = await fetch(`${BASE_URL}/restore`, {
      method: "POST",
      body: form,
    });
    const data = await res.json();
    console.log("Restore Response:", data);
    return data;
  } catch (error) {
    console.error("API Error (restoreImage):", error);
    return { error: "Failed to connect to backend" };
  }
}

export async function getAuditLogs() {
  try {
    const res = await fetch(`${BASE_URL}/logs`);
    const data = await res.json();
    // Your main.py returns { status: "success", logs: [] }
    return data.logs || []; 
  } catch (error) {
    console.error("Error fetching logs:", error);
    return [];
  }
}