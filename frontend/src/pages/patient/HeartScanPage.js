import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { heartAPI } from '../../utils/api';

const SCAN_DURATION = 25; // seconds
const CAPTURE_FPS = 5; // frames per second

export default function HeartScanPage() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const framesRef = useRef([]);

  const [phase, setPhase] = useState('ready'); // ready | scanning | processing | done
  const [countdown, setCountdown] = useState(SCAN_DURATION);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [faceDetected, setFaceDetected] = useState(false);

  useEffect(() => {
    return () => {
      stopCamera();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user', frameRate: 30 }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      return true;
    } catch (e) {
      setError('Camera access denied. Please allow webcam access.');
      return false;
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = 320;
    canvas.height = 240;
    ctx.drawImage(videoRef.current, 0, 0, 320, 240);

    // Basic brightness check — reject dark/empty frames
    const imageData = ctx.getImageData(0, 0, 320, 240);
    const data = imageData.data;
    let totalBrightness = 0;
    let skinPixels = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      totalBrightness += (r + g + b) / 3;
      // Basic skin tone detection
      if (r > 60 && g > 40 && b > 20 && r > g && r > b && (r - g) > 10) {
        skinPixels++;
      }
    }
    const avgBrightness = totalBrightness / (data.length / 4);
    const skinRatio = skinPixels / (data.length / 4);

    // Reject frame if too dark or not enough skin tone detected
    if (avgBrightness < 30 || skinRatio < 0.05) {
      return null;
    }

    return canvas.toDataURL('image/jpeg', 0.6);
  }, []);

  const startScan = async () => {
    setError('');
    framesRef.current = [];
    setCountdown(SCAN_DURATION);
    setProgress(0);
    setFaceDetected(false);

    const ok = await startCamera();
    if (!ok) return;

    // Wait for camera to stabilize
    await new Promise(r => setTimeout(r, 1000));
    setPhase('scanning');

    let elapsed = 0;
    const totalFrames = SCAN_DURATION * CAPTURE_FPS;

    intervalRef.current = setInterval(() => {
      const frame = captureFrame();
      if (frame) {
        framesRef.current.push(frame);
        setFaceDetected(true);
      } else {
        setFaceDetected(false);
      }

      elapsed++;
      const remaining = Math.max(0, SCAN_DURATION - Math.floor(elapsed / CAPTURE_FPS));
      setCountdown(remaining);
      setProgress((elapsed / totalFrames) * 100);

      if (elapsed >= totalFrames) {
        clearInterval(intervalRef.current);
        processFrames();
      }
    }, 1000 / CAPTURE_FPS);
  };

  const processFrames = async () => {
    setPhase('processing');
    stopCamera();
    try {
      const frames = framesRef.current;
      if (frames.length < 5) {
        throw new Error('No face detected. Please ensure your face is clearly visible in good lighting and try again.');
      }
      const totalCaptured = SCAN_DURATION * CAPTURE_FPS;
      const validRatio = frames.length / totalCaptured;
      if (validRatio < 0.4) {
        throw new Error('Face not clearly visible. Please ensure good lighting, remove glasses, and keep your face in the center of the camera.');
      }

      const res = await heartAPI.analyze(frames);
      const report = res.data.report;
      navigate(`/patient/results/${report._id}`, { state: { report, simulated: res.data.simulated } });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Analysis failed');
      setPhase('ready');
    }
  };

  const cancelScan = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    stopCamera();
    setPhase('ready');
    setProgress(0);
    setCountdown(SCAN_DURATION);
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Heart Health Scan 💓</h1>
          <p className="page-subtitle">rPPG facial video analysis — no contact required</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Instructions */}
        {phase === 'ready' && (
          <div className="card" style={{ marginBottom: 24, maxWidth: 700 }}>
            <h3 style={{ marginBottom: 16 }}>📋 Scan Instructions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                ['💡', 'Good Lighting', 'Ensure your face is well-lit, facing a light source'],
                ['😐', 'Stay Still', 'Keep your head steady during the 15-second scan'],
                ['📷', 'Face Camera', 'Position your face in the center of the frame'],
                ['🚫', 'No Glasses', 'Remove glasses if possible for better accuracy'],
              ].map(([icon, title, desc]) => (
                <div key={title} style={{ display: 'flex', gap: 12, padding: '14px', background: 'var(--bg-surface)', borderRadius: 10 }}>
                  <span style={{ fontSize: 24 }}>{icon}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main scan area */}
        <div style={{ maxWidth: 700 }}>
          <div className="card card-accent" style={{ position: 'relative', overflow: 'hidden' }}>
            {/* Video preview */}
            <div style={{
              width: '100%',
              aspectRatio: '4/3',
              background: '#000',
              borderRadius: 12,
              overflow: 'hidden',
              position: 'relative',
              marginBottom: 24
            }}>
              <video
                ref={videoRef}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: 'scaleX(-1)',
                  display: phase === 'ready' ? 'none' : 'block'
                }}
                muted
                playsInline
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />

              {/* Overlay when not scanning */}
              {phase === 'ready' && (
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  background: 'var(--bg-surface)'
                }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Camera will activate when scan begins</p>
                </div>
              )}

              {/* Scanning overlay */}
              {phase === 'scanning' && (
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                  {/* Face frame */}
                  <div style={{
                    position: 'absolute',
                    top: '15%', left: '25%', right: '25%', bottom: '10%',
                    border: `2px solid ${faceDetected ? 'var(--success)' : 'rgba(255,255,255,0.4)'}`,
                    borderRadius: '50%',
                    boxShadow: faceDetected ? '0 0 20px rgba(16,185,129,0.3)' : 'none',
                    transition: 'all 0.5s'
                  }} />
                  {/* Scan line animation */}
                  <div style={{
                    position: 'absolute',
                    top: '15%', left: '25%', right: '25%',
                    height: 2,
                    background: 'linear-gradient(90deg, transparent, var(--crimson-light), transparent)',
                    animation: 'scan-line 2s linear infinite',
                    overflow: 'hidden'
                  }} />
                  {/* Countdown */}
                  <div style={{
                    position: 'absolute',
                    top: 16, right: 16,
                    background: 'rgba(0,0,0,0.7)',
                    borderRadius: 24,
                    padding: '8px 16px',
                    fontSize: 18,
                    fontWeight: 800,
                    color: countdown <= 5 ? 'var(--danger)' : 'white'
                  }}>
                    {countdown}s
                  </div>
                  {/* Live indicator */}
                  <div style={{
                    position: 'absolute', top: 16, left: 16,
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'rgba(0,0,0,0.7)',
                    borderRadius: 24, padding: '8px 14px'
                  }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: 'var(--danger)',
                      animation: 'heartbeat 1s infinite'
                    }} />
                    <span style={{ fontSize: 12, fontWeight: 600 }}>SCANNING</span>
                  </div>
                </div>
              )}

              {/* Processing */}
              {phase === 'processing' && (
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(0,0,0,0.9)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 16
                }}>
                  <div className="spinner" style={{ width: 60, height: 60, borderWidth: 4 }} />
                  <p style={{ fontSize: 16, fontWeight: 600 }}>Analyzing heart rate...</p>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Running rPPG algorithm on {framesRef.current.length} frames</p>
                </div>
              )}
            </div>

            {/* Progress bar */}
            {phase === 'scanning' && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  <span>Capturing frames: {framesRef.current.length}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div style={{ height: 6, background: 'var(--bg-surface)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, var(--crimson), var(--rose))',
                    borderRadius: 3,
                    transition: 'width 0.2s'
                  }} />
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 12 }}>
              {phase === 'ready' && (
                <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={startScan}>
                  Begin Heart Scan
                </button>
              )}
              {phase === 'scanning' && (
                <button className="btn btn-danger btn-lg" style={{ flex: 1 }} onClick={cancelScan}>
                  ✕ Cancel Scan
                </button>
              )}
              {phase === 'processing' && (
                <button className="btn btn-outline btn-lg" style={{ flex: 1 }} disabled>
                  Processing...
                </button>
              )}
            </div>
          </div>

          {/* How it works */}
          <div className="card" style={{ marginTop: 20 }}>
          <h4 style={{ fontSize: 14, marginBottom: 14, color: 'var(--text-secondary)' }}>HOW IT WORKS</h4>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                '1. Your face is detected by the camera',
                '2. Skin areas on your face are identified',
                '3. Tiny color changes from blood flow are captured',
                '4. Your pulse signal is extracted from the video',
                '5. The signal is analyzed for patterns',
                '6. Your heart rate in BPM is calculated'
              ].map(step => (
                <div key={step} style={{
                  padding: '6px 12px',
                  background: 'var(--bg-surface)',
                  borderRadius: 6,
                  fontSize: 12,
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border)'
                }}>{step}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
