from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# ✅ CORS (VERY IMPORTANT)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # you can restrict later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ ROOT ROUTE (this fixes "Not Found")
@app.get("/")
def root():
    return {"message": "HeartHealth Python API is running 🚀"}

# ✅ TEST ROUTE
@app.get("/test")
def test():
    return {"status": "working"}