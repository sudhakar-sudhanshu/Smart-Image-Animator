# 🎬 Image to Video Agent

An AI-powered web application that converts static images into dynamic videos.

This project allows users to upload images and automatically generate video content using backend processing and a modern frontend interface.

---

## 🚀 Features

- 📤 Upload Image
- 🎥 Convert Image to Video
- 🧠 Backend Processing Logic
- 🌐 Interactive Frontend UI
- 📁 Output Video Storage
- ⚡ Clean Project Structure

---

## 🛠 Tech Stack

### Backend
- Python
- Video Processing Logic
- Custom Script (main.py, video_generator.py)

### Frontend
- React.js
- Modern UI Components
- API Integration

---

## 📂 Project Structure
image-to-video/
│
├── backend/
│   ├── main.py
│   ├── video_generator.py
│
├── frontend/
│   └── image-to-video-ui/
│
├── Output/
└── README.md
---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repository

```bash
git clone https://github.com/Divy440/image-to-video.git
cd image-to-video

Backend Setup:-
cd backend
python -m venv venv
source venv/bin/activate   # Mac/Linux
pip install -r requirements.txt  # If available
python main.py

Frontend Setup:-
cd frontend/image-to-video-ui
npm install
npm start
Frontend will run on:http://localhost:3000
