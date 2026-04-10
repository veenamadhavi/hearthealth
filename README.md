# ❤️ HeartHealth Monitor

A full-stack healthcare web application for **non-contact heart rate monitoring** using **remote Photoplethysmography (rPPG)** facial video analysis, with real-time doctor consultation via WebSocket chat.

---

## 🧠 Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Frontend │◄──►│  Node.js Backend │◄──►│  MongoDB        │
│   (Port 3000)    │    │  Express + Socket│    │  (Port 27017)   │
│                  │    │  (Port 5000)     │    └─────────────────┘
└─────────────────┘    └────────┬─────────┘
                                 │
                         ┌───────▼──────────┐
                         │  Python rPPG     │
                         │  FastAPI Service │
                         │  (Port 8000)     │
                         └──────────────────┘
```

## 🔬 rPPG Technology

The Python service implements **CHROM (Chrominance-based) rPPG**:

1. **Face Detection**: MediaPipe FaceMesh detects facial landmarks
2. **ROI Extraction**: Forehead & cheek regions extracted (most blood-rich areas)
3. **Signal Processing**: CHROM method separates blood volume pulse from motion artifacts
4. **Frequency Analysis**: FFT isolates dominant frequency in 0.75–3.5 Hz (45–210 BPM)
5. **BPM Calculation**: Dominant frequency × 60 = Heart rate in BPM

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Recharts, Socket.io-client |
| Backend | Node.js, Express, Socket.io, JWT Auth |
| Database | MongoDB with Mongoose ODM |
| rPPG Service | Python, FastAPI, OpenCV, MediaPipe, NumPy, SciPy |
| Real-time | WebSocket via Socket.io |
| Containerization | Docker + Docker Compose |

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

```bash
# Clone and navigate
cd hearthealth

# Start all services
docker-compose up --build

# App available at:
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000/api
# Python rPPG: http://localhost:8000
```

### Option 2: Manual Setup

#### 1. MongoDB
```bash
# Start MongoDB locally or use MongoDB Atlas
mongod --dbpath /data/db
```

#### 2. Python rPPG Service
```bash
cd python-service

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start service
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### 3. Node.js Backend
```bash
cd backend

# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Start server
npm start
# or for development:
npm run dev
```

#### 4. React Frontend
```bash
cd frontend

# Install dependencies
npm install

# Copy environment config
cp .env.example .env

# Start development server
npm start
```

## 📁 Project Structure

```
hearthealth/
├── backend/
│   ├── models/
│   │   ├── Patient.js          # Patient schema
│   │   ├── Doctor.js           # Doctor schema
│   │   ├── HeartReport.js      # Heart rate reports
│   │   ├── ConsultationRequest.js
│   │   └── Message.js          # Chat messages
│   ├── routes/
│   │   ├── auth.js             # Registration & login
│   │   ├── heart.js            # rPPG analysis & history
│   │   ├── doctors.js          # Doctor listings
│   │   ├── patients.js         # Patient profile
│   │   ├── consultations.js    # Consultation flow
│   │   └── chat.js             # Message storage
│   ├── middleware/
│   │   └── auth.js             # JWT middleware
│   ├── socket/
│   │   └── socketHandler.js    # Socket.io events
│   └── server.js               # Express app entry
│
├── python-service/
│   ├── main.py                 # FastAPI rPPG service
│   └── requirements.txt
│
├── frontend/
│   └── src/
│       ├── context/
│       │   └── AuthContext.js  # Auth state management
│       ├── utils/
│       │   ├── api.js          # Axios API calls
│       │   └── socket.js       # Socket.io client
│       ├── components/
│       │   └── Sidebar.js      # Navigation sidebar
│       └── pages/
│           ├── auth/           # Login & Register pages
│           ├── patient/        # Patient dashboard & features
│           └── doctor/         # Doctor dashboard & features
│
└── docker-compose.yml
```

## 👤 User Types

### Patient Flow
1. Register with name, email, password, age, occupation
2. Dashboard → **Check Heart Health** → 15-second webcam scan
3. View results (BPM + Normal/Warning/High Risk classification)
4. Browse health history with trend charts
5. **Consult Doctor** → Select from doctor list → Send request with heart report
6. Real-time chat with doctor once accepted

### Doctor Flow
1. Register with qualification, years of experience, specialization
2. Dashboard shows pending consultation requests with patient heart data
3. Accept or reject requests
4. Real-time chat with accepted patients

## 💓 Heart Rate Classification

| BPM Range | Status | Description |
|-----------|--------|-------------|
| 60–100 | ✅ Normal | Healthy resting heart rate |
| 50–59 or 101–120 | ⚠️ Warning | Slightly abnormal, monitor symptoms |
| < 50 or > 120 | 🚨 High Risk | Seek medical attention |

## 🔌 API Endpoints

### Auth
- `POST /api/auth/patient/register`
- `POST /api/auth/patient/login`
- `POST /api/auth/doctor/register`
- `POST /api/auth/doctor/login`

### Heart Analysis
- `POST /api/heart/analyze` — Submit frames for rPPG analysis
- `GET /api/heart/history` — Get patient's report history
- `GET /api/heart/latest` — Latest heart report
- `GET /api/heart/report/:id` — Single report

### Consultations
- `POST /api/consultations` — Create consultation request
- `GET /api/consultations/my` — Patient's consultations
- `GET /api/consultations/pending` — Doctor's pending requests
- `PUT /api/consultations/:id/respond` — Accept/reject

### Chat
- `GET /api/chat/:consultationId` — Load messages
- `POST /api/chat/:consultationId` — Send message

## 🔴 Socket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `new_consultation_request` | Server → Doctor | New patient request |
| `consultation_response` | Server → Patient | Doctor accepted/rejected |
| `new_message` | Server → Both | Real-time chat message |
| `user_typing` | Server → Both | Typing indicator |

## 🔒 Security

- Passwords hashed with bcrypt (12 rounds)
- JWT tokens (7 day expiry)
- Socket.io JWT authentication middleware
- Role-based route protection (patient/doctor)

## ⚠️ Notes

- The Python rPPG service requires good lighting and a stable face position
- If the Python service is unavailable, the backend returns a simulated heart rate (demo mode)
- rPPG accuracy improves with longer capture duration and better lighting
- For clinical use, always validate with a medical-grade device
