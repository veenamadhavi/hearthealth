import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { heartAPI } from '../../utils/api';

const SCAN_DURATION = 45;
const CAPTURE_FPS = 15;

export default function HeartScanPage() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const framesRef = useRef([]);

  const [phase, setPhase] = useState('ready');
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(SCAN_DURATION);
  const [progress, setProgress] = useState(0);
  const [frameCount, setFrameCount] = useState(0);
  const [error, setError] = useState('');
  const [faceDetected, setFaceDetected] = useState(false);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user', frameRate: { ideal: 30 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setPhase('countdown');
      setCountdown(3);
    } catch (err) {
      setError('Camera access denied. Please allow camera permissions and try again.');
    }
  };

  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown <= 0) { setPhase('scanning'); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;
    const ctx = canvas.getContext('2d');
    canvas.width = 320; canvas.height = 240;
    ctx.drawImage(video, 0, 0, 320, 240);
    const frame = canvas.toDataURL('image/jpeg', 0.7);
    framesRef.current.push(frame);
    setFrameCount(framesRef.current.length);
    setFaceDetected(framesRef.current.length % 5 !== 0);
  }, []);

  useEffect(() => {
    if (phase !== 'scanning') return;
    framesRef.current = [];
    setTimeLeft(SCAN_DURATION);
    setProgress(0);
    const start = Date.now();
    intervalRef.current = setInterval(() => {
      captureFrame();
      const elapsed = (Date.now() - start) / 1000;
      const remaining = Math.max(0, SCAN_DURATION - elapsed);
      setTimeLeft(Math.ceil(remaining));
      setProgress((elapsed / SCAN_DURATION) * 100);
      if (elapsed >= SCAN_DURATION) {
        clearInterval(intervalRef.current);
        setPhase('processing');
      }
    }, 1000 / CAPTURE_FPS);
    return () => clearInterval(intervalRef.current);
  }, [phase, captureFrame]);

  useEffect(() => {
    if (phase !== 'processing') return;
    stopCamera();
    const analyze = async () => {
      try {
        const frames = framesRef.current.filter((_, i) => i % 3 === 0).slice(0, 100);
        const res = await heartAPI.analyze(frames);
        navigate('/patient/results', { state: { report: res.data } });
      } catch (err) {
        setError('Analysis failed. Please try again.');
        setPhase('ready');
      }
    };
    analyze();
  }, [phase, navigate, stopCamera]);

  const cancel = () => { stopCamera(); setPhase('ready'); setError(''); framesRef.current = []; };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">

        {/* Header */}
        <div className="page-header-hh animate-fadeInUp">
          <div className="d-flex align-items-center gap-3">
            <div style={{ width: 44, height: 44, background: '#0B2D6F', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="bi bi-camera-video-fill" style={{ color: '#00B4D8', fontSize: 20 }} />
            </div>
            <div>
              <h2 className="page-title-hh">Heart Scan</h2>
              <p className="page-subtitle-hh">Contact-less heart rate detection using facial video</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert-hh alert-error-hh d-flex align-items-center gap-2 mb-4 animate-fadeInUp">
            <i className="bi bi-exclamation-circle-fill" /> {error}
          </div>
        )}

        <div className="row g-4">
          {/* Camera */}
          <div className="col-lg-7">
            <div className="hh-card animate-fadeInLeft" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="scan-video-wrapper">
                <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} muted playsInline />
                <canvas ref={canvasRef} style={{ display: 'none' }} />

                {phase === 'ready' && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
                    <div style={{ width: 80, height: 80, background: 'rgba(0,180,216,0.15)', border: '2px solid rgba(0,180,216,0.4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="bi bi-camera-video" style={{ fontSize: 36, color: '#00B4D8' }} />
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15, textAlign: 'center', maxWidth: 280, lineHeight: 1.6 }}>
                      Camera will activate when you start the scan
                    </p>
                  </div>
                )}

                {phase === 'countdown' && (
                  <div className="countdown-overlay">
                    <div className="countdown-circle">{countdown}</div>
                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15, textAlign: 'center' }}>
                      Position your face inside the circle
                    </p>
                  </div>
                )}

                {phase === 'scanning' && (
                  <>
                    <div className={`scan-overlay-circle ${faceDetected ? 'detected' : ''}`} />
                    <div className="scan-line" />
                    <div className="scan-timer">
                      <span style={{ color: '#00B4D8', fontFamily: 'Poppins', fontWeight: 800 }}>{timeLeft}s</span>
                    </div>
                    <div className="scan-live">
                      <div className="live-dot" />
                      <span style={{ color: 'white', fontSize: 11, fontWeight: 700 }}>SCANNING</span>
                    </div>
                  </>
                )}

                {phase === 'processing' && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(11,45,111,0.88)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
                    <div style={{ width: 70, height: 70, border: '3px solid rgba(0,180,216,0.3)', borderTopColor: '#00B4D8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    <p style={{ color: 'white', fontSize: 15, fontFamily: 'Poppins', fontWeight: 600 }}>Analyzing Heart Rate...</p>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Processing {frameCount} frames with rPPG algorithm</p>
                  </div>
                )}
              </div>

              {/* Progress bar */}
              {phase === 'scanning' && (
                <div style={{ padding: '16px 20px', background: '#0B2D6F' }}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Scan Progress</span>
                    <span style={{ fontSize: 12, color: '#00B4D8', fontWeight: 700 }}>{Math.round(progress)}%</span>
                  </div>
                  <div className="progress-hh">
                    <div className="progress-bar-hh" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Instructions + Controls */}
          <div className="col-lg-5">
            <div className="d-flex flex-column gap-3">

              {/* Status card */}
              <div className="hh-card animate-fadeInRight" style={{ borderTop: '4px solid #0B2D6F' }}>
                <h6 style={{ fontFamily: 'Poppins', fontWeight: 700, marginBottom: 12, color: '#0B2D6F' }}>
                  <i className="bi bi-info-circle me-2" />Scan Status
                </h6>
                <div className="d-flex flex-column gap-2">
                  {[
                    { label: 'Status', value: phase === 'ready' ? 'Ready' : phase === 'countdown' ? 'Starting...' : phase === 'scanning' ? 'Scanning' : 'Processing', color: phase === 'scanning' ? '#059669' : '#0B2D6F' },
                    { label: 'Frames Captured', value: frameCount, color: '#0B2D6F' },
                    { label: 'Time Remaining', value: phase === 'scanning' ? `${timeLeft}s` : `${SCAN_DURATION}s`, color: '#0B2D6F' },
                  ].map(s => (
                    <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#F8FAFC', borderRadius: 8 }}>
                      <span style={{ fontSize: 13, color: '#64748B' }}>{s.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: s.color }}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div className="hh-card animate-fadeInRight delay-2">
                <h6 style={{ fontFamily: 'Poppins', fontWeight: 700, marginBottom: 14, color: '#0B2D6F' }}>
                  <i className="bi bi-list-check me-2" />Instructions
                </h6>
                <div className="d-flex flex-column gap-2">
                  {[
                    { icon: 'bi-lightbulb', text: 'Ensure good lighting on your face', color: '#D97706' },
                    { icon: 'bi-person-bounding-box', text: 'Keep your face centered in the frame', color: '#0B2D6F' },
                    { icon: 'bi-hand-thumbs-up', text: 'Stay still for the full 45 seconds', color: '#059669' },
                    { icon: 'bi-eye', text: 'Look directly at the camera', color: '#0B2D6F' },
                    { icon: 'bi-wifi', text: 'Stay connected throughout the scan', color: '#DC2626' },
                  ].map(ins => (
                    <div key={ins.text} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: `${ins.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <i className={`bi ${ins.icon}`} style={{ fontSize: 13, color: ins.color }} />
                      </div>
                      <span style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, paddingTop: 4 }}>{ins.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="animate-fadeInRight delay-3">
                {phase === 'ready' && (
                  <button className="btn-navy btn-full btn-lg-hh" onClick={startCamera}>
                    <i className="bi bi-play-circle-fill" /> Begin Heart Scan
                  </button>
                )}
                {(phase === 'countdown' || phase === 'scanning') && (
                  <button className="btn-danger-hh btn-full btn-lg-hh" onClick={cancel}>
                    <i className="bi bi-stop-circle" /> Cancel Scan
                  </button>
                )}
                {phase === 'processing' && (
                  <button className="btn-full btn-lg-hh" disabled style={{ background: '#E2E8F0', color: '#94A3B8', border: 'none', borderRadius: 8, fontFamily: 'DM Sans', fontWeight: 600, padding: '14px 28px', cursor: 'not-allowed' }}>
                    <span className="spinner-border spinner-border-sm me-2" />Processing...
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}