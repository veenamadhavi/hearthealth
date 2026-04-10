import time
import base64
import numpy as np
import cv2
import pywt
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from scipy import signal

app = FastAPI(title="HeartHealth STI-rPPG Service")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class FrameData(BaseModel):
    frames: List[str]

# Load face detector once
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
)

# ─── STEP 1: Decode Frame ────────────────────────────────────────────────────

def decode_frame(b64_frame: str):
    try:
        if ',' in b64_frame:
            b64_frame = b64_frame.split(',')[1]
        img_bytes = base64.b64decode(b64_frame)
        nparr = np.frombuffer(img_bytes, np.uint8)
        return cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    except:
        return None

# ─── STEP 2: ROI Detection & Tracking (Section 3.1 of paper) ─────────────────

def detect_roi(frame):
    """
    Detect face and select ROI excluding eyes and mouth
    Based on 68 landmark region definition from paper
    Uses OpenCV Haar as simplified landmark detector
    """
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

    # ROI: exclude eyes (top 35%), mouth (bottom 20%)
    # Keep cheeks and nose area — best skin region
    roi_y1 = y + int(h * 0.35)  # below eyes
    roi_y2 = y + int(h * 0.80)  # above mouth
    roi_x1 = x + int(w * 0.10)
    roi_x2 = x + int(w * 0.90)

    roi = small[roi_y1:roi_y2, roi_x1:roi_x2]

    if roi.size == 0 or roi.shape[0] < 5 or roi.shape[1] < 5:
        return None

    # Resize ROI to fixed size for consistent STI
    roi_resized = cv2.resize(roi, (64, 32))
    return roi_resized

# ─── STEP 3: Frame Differencing ──────────────────────────────────────────────

def compute_difference_frames(roi_frames):
    """
    Compute consecutive frame differences
    Removes static background information (Section 3.2 of paper)
    delta_I[i] = I[i+1] - I[i]
    """
    diff_frames = []
    for i in range(len(roi_frames) - 1):
        diff = cv2.absdiff(roi_frames[i + 1], roi_frames[i])
        diff_gray = cv2.cvtColor(diff, cv2.COLOR_BGR2GRAY).astype(np.float32)
        diff_frames.append(diff_gray)
    return diff_frames

# ─── STEP 4: Wavelet Feature Extraction (Section 3.2 of paper) ───────────────

def extract_wavelet_feature_vector(diff_frame):
    """
    Apply 3-level Daubechies wavelet transform
    Use only HL and LH subbands (not HH)
    Compute horizontal and vertical projections
    Concatenate to form feature vector FV_i

    Based on equations (2), (3), (4) from paper:
    V_r_j(y) = sum_x(r_j(x,y))  -- vertical projection
    H_r_j(x) = sum_y(r_j(x,y))  -- horizontal projection
    FV_i = (H + V)_r_j
    """
    feature_vector = []

    # 3-level Daubechies wavelet decomposition
    coeffs = pywt.wavedec2(diff_frame, 'db4', level=3)

    # coeffs[0] = approximation (LL)
    # coeffs[1] = (LH1, HL1, HH1) at level 1
    # coeffs[2] = (LH2, HL2, HH2) at level 2
    # coeffs[3] = (LH3, HL3, HH3) at level 3

    for level_idx in range(1, 4):  # levels 1, 2, 3
        if level_idx >= len(coeffs):
            break

        LH, HL, HH = coeffs[level_idx]

        # Use only HL and LH subbands as per paper
        for subband in [HL, LH]:
            if subband.size == 0:
                continue

            # Horizontal projection: sum along rows
            H_proj = np.sum(subband, axis=0)  # shape: (cols,)

            # Vertical projection: sum along columns
            V_proj = np.sum(subband, axis=1)  # shape: (rows,)

            # Global average normalization
            if H_proj.std() > 0:
                H_proj = (H_proj - H_proj.mean()) / (H_proj.std() + 1e-8)
            if V_proj.std() > 0:
                V_proj = (V_proj - V_proj.mean()) / (V_proj.std() + 1e-8)

            # Concatenate H and V projections
            feature_vector.extend(H_proj.tolist())
            feature_vector.extend(V_proj.tolist())

    return np.array(feature_vector)

# ─── STEP 5: STI Generation (Section 3.2 of paper) ───────────────────────────

def generate_sti(diff_frames):
    """
    Generate Spatio-Temporal Image (STI)
    Stack feature vectors of all frames as rows
    STI shape: (num_frames, feature_vector_length)
    """
    feature_vectors = []

    for diff_frame in diff_frames:
        fv = extract_wavelet_feature_vector(diff_frame)
        if len(fv) > 0:
            feature_vectors.append(fv)

    if len(feature_vectors) < 5:
        return None

    # Normalize all feature vectors to same length
    min_len = min(len(fv) for fv in feature_vectors)
    feature_vectors = [fv[:min_len] for fv in feature_vectors]

    # Stack to form 2D STI
    sti = np.array(feature_vectors)  # shape: (frames, features)
    return sti

# ─── STEP 6: HR Estimation from STI ──────────────────────────────────────────

def estimate_hr_from_sti(sti, fps):
    """
    Estimate heart rate from STI
    Since we don't have trained ResNet-18, we use the temporal
    signal from STI columns which contain blood volume pulse

    The brightest column in STI corresponds to highest HR value
    as described in Section 3.2 of the paper
    """
    if sti is None or sti.shape[0] < 10:
        return None, 0.0

    # Extract temporal signal from STI
    # Each row is a frame — take mean of each row as temporal signal
    temporal_signal = np.mean(sti, axis=1)  # shape: (num_frames,)

    # Also try variance-based signal (captures pulse peaks better)
    variance_signal = np.var(sti, axis=1)

    bpm_results = []

    for sig in [temporal_signal, variance_signal]:
        bpm = signal_to_bpm(sig, fps)
        if bpm and 50 <= bpm <= 110:
            bpm_results.append(bpm)

    # Also extract from individual STI columns (paper approach)
    # Analyze columns with highest variance (most informative)
    col_variances = np.var(sti, axis=0)
    top_cols = np.argsort(col_variances)[-10:]  # top 10 columns

    for col_idx in top_cols:
        col_signal = sti[:, col_idx]
        bpm = signal_to_bpm(col_signal, fps)
        if bpm and 50 <= bpm <= 110:
            bpm_results.append(bpm)

    if not bpm_results:
        return None, 0.0

    # Remove outliers
    median_val = float(np.median(bpm_results))
    clean = [b for b in bpm_results if abs(b - median_val) <= 8]

    if not clean:
        clean = bpm_results

    final_bpm = int(round(np.mean(clean)))
    quality = float(max(0.0, 1.0 - np.std(clean) / 15.0))

    return final_bpm, quality

def signal_to_bpm(sig, fps):
    """Convert temporal signal to BPM using FFT"""
    n = len(sig)
    if n < 10:
        return None

    # Detrend
    sig = signal.detrend(sig)

    # Bandpass 0.8-1.8 Hz = 48-108 BPM (resting range)
    nyq = fps / 2.0
    low = 0.8 / nyq
    high = min(1.8 / nyq, 0.98)

    try:
        b, a = signal.butter(3, [low, high], btype='band')
        sig = signal.filtfilt(b, a, sig)
    except:
        pass

    # Hamming window + FFT
    n_fft = n * 8
    windowed = sig * np.hamming(n)
    fft_vals = np.abs(np.fft.rfft(windowed, n=n_fft))
    freqs = np.fft.rfftfreq(n_fft, d=1.0 / fps)

    # Only 48-108 BPM range
    mask = (freqs >= 0.8) & (freqs <= 1.8)
    if not mask.any():
        return None

    vf = freqs[mask]
    vp = fft_vals[mask]
    peak_idx = np.argmax(vp)
    bpm = int(round(vf[peak_idx] * 60))

    return bpm

# ─── STEP 7: Full Pipeline ────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "STI-rPPG service running", "timestamp": time.time()}

@app.post("/analyze")
async def analyze(data: FrameData):
    start_time = time.time()

    if len(data.frames) < 15:
        raise HTTPException(
            status_code=400,
            detail="Not enough frames. Please complete the full scan."
        )

    # Step 1: Decode all frames and extract ROI
    roi_frames = []
    total = len(data.frames)

    for frame_b64 in data.frames:
        frame = decode_frame(frame_b64)
        if frame is None:
            continue
        roi = detect_roi(frame)
        if roi is not None:
            roi_frames.append(roi)

    valid_frames = len(roi_frames)
    face_ratio = valid_frames / total if total > 0 else 0

    if valid_frames < 15:
        raise HTTPException(
            status_code=422,
            detail="Face not detected clearly. Please ensure good lighting and keep face centered."
        )

    if face_ratio < 0.5:
        raise HTTPException(
            status_code=422,
            detail="Face kept disappearing. Please stay still and try again."
        )

    # Step 2: Compute difference frames (removes static info)
    diff_frames = compute_difference_frames(roi_frames)

    if len(diff_frames) < 10:
        raise HTTPException(
            status_code=422,
            detail="Not enough valid frames for analysis. Please try again."
        )

    # Step 3: Generate STI using wavelet decomposition
    sti = generate_sti(diff_frames)

    if sti is None:
        raise HTTPException(
            status_code=422,
            detail="Could not generate feature image. Please try again."
        )

    # Step 4: Estimate HR from STI
    actual_fps = valid_frames / 45.0
    actual_fps = max(5.0, min(actual_fps, 20.0))

    final_bpm, quality = estimate_hr_from_sti(sti, actual_fps)

    if final_bpm is None or not (50 <= final_bpm <= 110):
        raise HTTPException(
            status_code=422,
            detail="Could not get stable reading. Please rescan in better lighting."
        )

    processing_time = time.time() - start_time

    return {
        "heart_rate": final_bpm,
        "signal_quality": round(quality, 2),
        "processing_time": round(processing_time, 2),
        "frames_analyzed": valid_frames,
        "total_frames": total,
        "face_ratio": round(face_ratio, 2),
        "sti_shape": list(sti.shape),
        "simulated": False
    }