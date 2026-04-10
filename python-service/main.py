import time
import base64
import numpy as np
import cv2
import pywt
import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from scipy import signal

# ✅ IMPORTANT: Enable docs + app
app = FastAPI(
    title="HeartHealth STI-rPPG Service",
    docs_url="/docs",
    redoc_url="/redoc"
)

# ✅ FIX CORS (VERY IMPORTANT)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://hearthealth-roan.vercel.app",  # your frontend
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ ROOT ROUTE (IMPORTANT FOR RENDER TEST)
@app.get("/")
def root():
    return {"message": "HeartHealth Python API is running"}

# ✅ HEALTH ROUTE
@app.get("/health")
async def health():
    return {"status": "STI-rPPG service running", "timestamp": time.time()}

# ------------------- MODEL -------------------
class FrameData(BaseModel):
    frames: List[str]

# Load face detector
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
)

# ------------------- FUNCTIONS -------------------

def decode_frame(b64_frame: str):
    try:
        if ',' in b64_frame:
            b64_frame = b64_frame.split(',')[1]
        img_bytes = base64.b64decode(b64_frame)
        nparr = np.frombuffer(img_bytes, np.uint8)
        return cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    except:
        return None

def detect_roi(frame):
    small = cv2.resize(frame, (320, 240))
    gray = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)
    gray = cv2.equalizeHist(gray)

    faces = face_cascade.detectMultiScale(
        gray, scaleFactor=1.1,
        minNeighbors=5, minSize=(40, 40)
    )

    if len(faces) == 0:
        return None

    x, y, w, h = max(faces, key=lambda f: f[2] * f[3])

    roi_y1 = y + int(h * 0.35)
    roi_y2 = y + int(h * 0.80)
    roi_x1 = x + int(w * 0.10)
    roi_x2 = x + int(w * 0.90)

    roi = small[roi_y1:roi_y2, roi_x1:roi_x2]

    if roi.size == 0:
        return None

    return cv2.resize(roi, (64, 32))

def compute_difference_frames(roi_frames):
    diff_frames = []
    for i in range(len(roi_frames) - 1):
        diff = cv2.absdiff(roi_frames[i + 1], roi_frames[i])
        diff_gray = cv2.cvtColor(diff, cv2.COLOR_BGR2GRAY).astype(np.float32)
        diff_frames.append(diff_gray)
    return diff_frames

def signal_to_bpm(sig, fps):
    if len(sig) < 10:
        return None

    sig = signal.detrend(sig)
    nyq = fps / 2.0
    low = 0.8 / nyq
    high = min(1.8 / nyq, 0.98)

    try:
        b, a = signal.butter(3, [low, high], btype='band')
        sig = signal.filtfilt(b, a, sig)
    except:
        pass

    n = len(sig)
    fft_vals = np.abs(np.fft.rfft(sig))
    freqs = np.fft.rfftfreq(n, d=1.0 / fps)

    mask = (freqs >= 0.8) & (freqs <= 1.8)
    if not mask.any():
        return None

    vf = freqs[mask]
    vp = fft_vals[mask]
    peak_idx = np.argmax(vp)

    return int(round(vf[peak_idx] * 60))

# ------------------- MAIN API -------------------

@app.post("/analyze")
async def analyze(data: FrameData):

    if len(data.frames) < 15:
        raise HTTPException(status_code=400, detail="Not enough frames")

    roi_frames = []

    for frame_b64 in data.frames:
        frame = decode_frame(frame_b64)
        if frame is None:
            continue
        roi = detect_roi(frame)
        if roi is not None:
            roi_frames.append(roi)

    if len(roi_frames) < 15:
        raise HTTPException(status_code=422, detail="Face not detected")

    diff_frames = compute_difference_frames(roi_frames)

    signal_values = [np.mean(f) for f in diff_frames]
    fps = 15

    bpm = signal_to_bpm(signal_values, fps)

    if bpm is None:
        raise HTTPException(status_code=422, detail="Cannot detect BPM")

    return {
        "heart_rate": bpm,
        "frames_used": len(roi_frames)
    }

# ------------------- RUN SERVER -------------------

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)