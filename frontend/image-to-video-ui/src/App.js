import React, { useState } from "react";

function App() {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [motion, setMotion] = useState("cinematic");
  const [videoUrl, setVideoUrl] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  // 💡 Quick Prompts
  const presets = [
    {
      label: "🌊 Water Wave",
      text: "Realistic water waves crashing in slow motion, cinematic lighting",
    },
    {
      label: "🏔️ Drone Shot",
      text: "Cinematic drone shot zooming slowly into the scene, mountain parallax",
    },
    {
      label: "🎬 Film Look",
      text: "35mm film style, vintage grain, slow cinematic pan",
    },
    {
      label: "✨ Magic Aura",
      text: "Magical glowing particles floating in the air, soft lighting",
    },
  ];

  // ---------------- IMAGE CHANGE ----------------
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setStatus("📸 Image ready!");
    }
  };

  // ---------------- SUBMIT ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return alert("Please select an image");

    setLoading(true);
    setVideoUrl("");
    setStatus("⏳ Uploading image...");

    try {
      // Upload image
      const uploadData = new FormData();
      uploadData.append("image", image);
      uploadData.append("prompt", prompt);
      uploadData.append("motion", motion);

      const uploadRes = await fetch("http://127.0.0.1:8000/upload/", {
        method: "POST",
        body: uploadData,
      });

      if (!uploadRes.ok) throw new Error("Image upload failed");
      const uploadResult = await uploadRes.json();

      setStatus("🎬 Generating video...");

      // Generate video
      const videoData = new FormData();
      videoData.append("image_name", uploadResult.filename);
      videoData.append("prompt", prompt);

      const videoRes = await fetch("http://127.0.0.1:8000/generate-video/", {
        method: "POST",
        body: videoData,
      });

      const videoResult = await videoRes.json();
      if (!videoRes.ok) throw new Error(videoResult.detail || "Video generation failed");

      setVideoUrl(videoResult.video_url);
      setStatus("✅ Video generated successfully!");
    } catch (err) {
      setStatus(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>🤖 Image to Video Agent</h1>
        <p style={styles.subtitle}>Turn your image into an AI-generated video</p>
      </header>

      <main style={styles.mainLayout}>
        {/* LEFT SIDE */}
        <section style={styles.card}>
          <form onSubmit={handleSubmit}>
            <label style={styles.label}>Upload Image</label>
            <div style={styles.fileUploadBox}>
              <input type="file" onChange={handleImageChange} accept="image/*" />
              {imagePreview && (
                <img src={imagePreview} alt="preview" style={styles.imagePreview} />
              )}
            </div>

            <label style={styles.label}>Prompt</label>
            <div style={styles.presetContainer}>
              {presets.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  style={styles.presetBtn}
                  onClick={() => setPrompt(p.text)}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe how the image should move..."
              style={styles.textarea}
              required
            />

            <label style={styles.label}>Style</label>
            <select value={motion} onChange={(e) => setMotion(e.target.value)} style={styles.select}>
              <option value="cinematic">Cinematic</option>
              <option value="slow zoom">Slow Zoom</option>
              <option value="realistic">Realistic</option>
            </select>

            {/* ✅ BUTTON NAME UPDATED HERE */}
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.button,
                backgroundColor: loading ? "#94a3b8" : "#4f46e5",
              }}
            >
              {loading ? "Generating Video..." : "Generate Video"}
            </button>

            <p style={styles.status}>{status}</p>
          </form>
        </section>

        {/* RIGHT SIDE */}
        <section style={styles.card}>
          <h3 style={styles.label}>Generated Video</h3>
          {videoUrl ? (
            <>
              <video src={videoUrl} controls autoPlay loop style={styles.videoElement} />
              <a href={videoUrl} target="_blank" rel="noreferrer" style={styles.downloadBtn}>
                ⬇️ Download Video
              </a>
            </>
          ) : (
            <p style={{ color: "#94a3b8" }}>No video generated yet</p>
          )}
        </section>
      </main>
    </div>
  );
}

// ---------------- STYLES ----------------
const styles = {
  container: {
    fontFamily: "Inter, sans-serif",
    background: "#f1f5f9",
    minHeight: "100vh",
    padding: "20px",
  },
  header: { textAlign: "center", marginBottom: "30px" },
  title: { fontSize: "2.5rem", fontWeight: "900" },
  subtitle: { color: "#64748b" },
  mainLayout: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "30px",
  },
  card: {
    background: "#fff",
    padding: "30px",
    borderRadius: "20px",
    boxShadow: "0 10px 15px rgba(0,0,0,0.1)",
  },
  label: {
    fontWeight: "700",
    marginBottom: "10px",
    display: "block",
  },
  fileUploadBox: { marginBottom: "15px" },
  imagePreview: { width: "100%", borderRadius: "12px", marginTop: "10px" },
  presetContainer: { display: "flex", gap: "10px", flexWrap: "wrap" },
  presetBtn: {
    padding: "6px 12px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    cursor: "pointer",
  },
  textarea: {
    width: "100%",
    height: "100px",
    marginBottom: "15px",
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  },
  select: {
    width: "100%",
    padding: "10px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    marginBottom: "15px",
  },
  button: {
    width: "100%",
    padding: "15px",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    fontWeight: "800",
    cursor: "pointer",
  },
  status: { marginTop: "15px", textAlign: "center", fontWeight: "600" },
  videoElement: { width: "100%", borderRadius: "16px", marginBottom: "15px" },
  downloadBtn: {
    display: "inline-block",
    padding: "12px 20px",
    background: "#0f172a",
    color: "#fff",
    borderRadius: "12px",
    textDecoration: "none",
    fontWeight: "700",
  },
};

export default App;