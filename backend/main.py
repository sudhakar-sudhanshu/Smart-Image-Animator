from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import fal_client
from dotenv import load_dotenv
import shutil
from PIL import Image

# ---------------- LOAD ENV ----------------
load_dotenv()

FAL_KEY = os.getenv("FAL_KEY")
if not FAL_KEY:
    raise RuntimeError("FAL_KEY not found in environment variables")

# ---------------- APP INIT ----------------
app = FastAPI(title="AI Image to Video Server (Fal.ai + Luma)")

# ---------------- CORS ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- PATHS ----------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(BASE_DIR, "..", "Output")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ---------------- ROOT ----------------
@app.get("/")
async def root():
    return {"message": "AI Video Server (Fal.ai + Luma) is Running!"}

# ---------------- UPLOAD IMAGE ----------------
@app.post("/upload/")
async def upload_image(
    image: UploadFile = File(...),
    prompt: str = Form(...),
    motion: str = Form("cinematic"),
    duration: int = Form(4),
):
    try:
        image_path = os.path.join(OUTPUT_DIR, image.filename)

        # Save original image
        with open(image_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

        # Resize (Fal.ai limit)
        with Image.open(image_path) as img:
            max_size = 1920
            if img.width > max_size or img.height > max_size:
                img.thumbnail((max_size, max_size))
                img.save(image_path)
                print(f"📏 Image resized to {img.width}x{img.height}")

        return {
            "filename": image.filename,
            "status": "Image uploaded and resized successfully"
        }

    except Exception as e:
        print("Upload Error:", e)
        raise HTTPException(status_code=500, detail=str(e))

# ---------------- GENERATE VIDEO ----------------
@app.post("/generate-video/")
async def generate_video(
    image_name: str = Form(...),
    prompt: str = Form(...)
):
    try:
        image_path = os.path.join(OUTPUT_DIR, image_name)
        if not os.path.exists(image_path):
            raise HTTPException(status_code=400, detail="Image file not found")

        # Upload image to Fal temporary storage
        image_url = fal_client.upload_file(image_path)

        print("🎬 Video generation started...")

        handler = fal_client.submit(
            "fal-ai/luma-dream-machine/image-to-video",
            arguments={
                "image_url": image_url,
                "prompt": prompt
            }
        )

        result = handler.get()

        return {
            "video_url": result["video"]["url"],
            "status": "AI video generated successfully"
        }

    except Exception as e:
        error_str = str(e).lower()
        print("FAL ERROR:", error_str)

        if "content_policy" in error_str:
            raise HTTPException(
                status_code=400,
                detail="Safety filter triggered. Please try a different image or prompt."
            )

        if "exhausted" in error_str or "balance" in error_str or "locked" in error_str:
            raise HTTPException(
                status_code=402,
                detail="FAL.ai balance exhausted. Please top up credits."
            )

        raise HTTPException(status_code=500, detail=str(e))