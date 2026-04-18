import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [counts, setCounts] = useState({ patients: 0, scans: 0, doctors: 0, accuracy: 0 });
  const statsRef = useRef(null);
  const countStarted = useRef(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);

    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateY(0) translateX(0)';
          observer.unobserve(e.target);
        }
      }),
      { threshold: 0.12 }
    );
    document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));

    // Counter animation observer
    const counterObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !countStarted.current) {
        countStarted.current = true;
        const targets = { patients: 1200, scans: 8500, doctors: 48, accuracy: 95 };
        const duration = 1800;
        const steps = 60;
        const interval = duration / steps;
        let step = 0;
        const timer = setInterval(() => {
          step++;
          const progress = step / steps;
          const ease = 1 - Math.pow(1 - progress, 3);
          setCounts({
            patients: Math.round(targets.patients * ease),
            scans: Math.round(targets.scans * ease),
            doctors: Math.round(targets.doctors * ease),
            accuracy: Math.round(targets.accuracy * ease),
          });
          if (step >= steps) clearInterval(timer);
        }, interval);
      }
    }, { threshold: 0.5 });
    if (statsRef.current) counterObserver.observe(statsRef.current);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
      counterObserver.disconnect();
    };
  }, []);

  const revealStyle = {
    opacity: 0,
    transform: 'translateY(40px)',
    transition: 'opacity 0.7s ease, transform 0.7s ease',
  };

  const revealLeftStyle = {
    opacity: 0,
    transform: 'translateX(-40px)',
    transition: 'opacity 0.7s ease, transform 0.7s ease',
  };

  const revealRightStyle = {
    opacity: 0,
    transform: 'translateX(40px)',
    transition: 'opacity 0.7s ease, transform 0.7s ease',
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", overflowX: 'hidden' }}>

      {/* ── NAVBAR ────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        padding: scrolled ? '12px 0' : '20px 0',
        background: scrolled ? 'rgba(7,20,50,0.96)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : 'none',
        boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.3)' : 'none',
        transition: 'all 0.4s ease'
      }}>
        <div className="container">
          <div className="d-flex align-items-center justify-content-between">
            {/* Logo */}
            <div className="d-flex align-items-center gap-2">
              <div style={{
                width: 38, height: 38,
                background: 'linear-gradient(135deg, #00B4D8, #0077B6)',
                borderRadius: 10, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(0,180,216,0.4)'
              }}>
                <i className="bi bi-heart-pulse-fill" style={{ color: 'white', fontSize: 18 }} />
              </div>
              <span style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: 20, color: 'white', letterSpacing: '-0.5px' }}>
                Heart<span style={{ color: '#00B4D8' }}>Health</span>
              </span>
            </div>

            {/* Nav links */}
            <div className="d-none d-lg-flex align-items-center gap-4">
              {['#features', '#services', '#portals'].map((href, i) => (
                <a key={href} href={href} style={{
                  color: 'rgba(255,255,255,0.7)', textDecoration: 'none',
                  fontSize: 14, fontWeight: 500, letterSpacing: '0.01em',
                  transition: 'color 0.2s', padding: '4px 0',
                  borderBottom: '2px solid transparent'
                }}
                  onMouseEnter={e => { e.target.style.color = 'white'; e.target.style.borderBottomColor = '#00B4D8'; }}
                  onMouseLeave={e => { e.target.style.color = 'rgba(255,255,255,0.7)'; e.target.style.borderBottomColor = 'transparent'; }}
                >
                  {['Features', 'Services', 'Get Started'][i]}
                </a>
              ))}
            </div>

            {/* CTA */}
            <div className="d-flex align-items-center gap-2">
              <button onClick={() => navigate('/patient/login')} style={{
                background: 'transparent', color: 'rgba(255,255,255,0.8)',
                border: '1.5px solid rgba(255,255,255,0.25)', borderRadius: 8,
                padding: '8px 18px', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'DM Sans', transition: 'all 0.2s'
              }}
                onMouseEnter={e => { e.target.style.borderColor = 'rgba(255,255,255,0.6)'; e.target.style.color = 'white'; }}
                onMouseLeave={e => { e.target.style.borderColor = 'rgba(255,255,255,0.25)'; e.target.style.color = 'rgba(255,255,255,0.8)'; }}
              >
                Sign In
              </button>
              <button onClick={() => navigate('/patient/register')} style={{
                background: 'linear-gradient(135deg, #00B4D8, #0077B6)',
                color: 'white', border: 'none', borderRadius: 8,
                padding: '8px 20px', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'DM Sans',
                boxShadow: '0 4px 14px rgba(0,180,216,0.35)',
                transition: 'all 0.2s'
              }}
                onMouseEnter={e => e.target.style.transform = 'translateY(-1px)'}
                onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── HERO ──────────────────────────────────────── */}
      <section style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #040D21 0%, #071D4A 40%, #0A2A6E 70%, #0D3580 100%)',
        display: 'flex', alignItems: 'center',
        position: 'relative', overflow: 'hidden', paddingTop: 100
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -200, right: -200, width: 700, height: 700, borderRadius: '50%', border: '1px solid rgba(0,180,216,0.07)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: -100, right: -100, width: 500, height: 500, borderRadius: '50%', border: '1px solid rgba(0,180,216,0.1)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -300, left: -200, width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,119,182,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        {/* Grid pattern */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="row align-items-center g-5">

            {/* LEFT */}
            <div className="col-lg-6">
              {/* Badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(0,180,216,0.1)',
                border: '1px solid rgba(0,180,216,0.3)',
                borderRadius: 30, padding: '7px 18px', marginBottom: 28,
                animation: 'fadeInUp 0.6s ease forwards'
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00B4D8', animation: 'pulse-slow 2s infinite' }} />
                <span style={{ fontSize: 12, color: '#00B4D8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em' }}>
                  Advanced Health Monitoring
                </span>
              </div>

              {/* Headline */}
              <h1 style={{
                fontFamily: 'Poppins', fontWeight: 800, color: 'white',
                fontSize: 'clamp(38px, 5.5vw, 62px)', lineHeight: 1.08,
                letterSpacing: '-0.03em', marginBottom: 24,
                animation: 'fadeInUp 0.6s 0.1s ease both'
              }}>
                Take Control of<br />
                Your Wellness<br />
                <span style={{
                  background: 'linear-gradient(90deg, #00B4D8, #90E0EF)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>with HeartHealth</span>
              </h1>

              <p style={{
                fontSize: 17, color: 'rgba(255,255,255,0.6)', lineHeight: 1.8,
                marginBottom: 40, maxWidth: 460,
                animation: 'fadeInUp 0.6s 0.2s ease both'
              }}>
                Prioritize your well-being with contact-less heart rate monitoring and personalized care — book your appointment today with HeartHealth.
              </p>

              {/* Buttons */}
              <div className="d-flex flex-wrap gap-3 mb-5" style={{ animation: 'fadeInUp 0.6s 0.3s ease both' }}>
                <button onClick={() => navigate('/patient/register')} style={{
                  background: 'linear-gradient(135deg, #00B4D8 0%, #0077B6 100%)',
                  color: 'white', border: 'none', borderRadius: 10,
                  padding: '14px 32px', fontSize: 15, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'DM Sans',
                  boxShadow: '0 8px 24px rgba(0,180,216,0.35)',
                  display: 'flex', alignItems: 'center', gap: 8,
                  transition: 'all 0.25s'
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,180,216,0.5)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,180,216,0.35)'; }}
                >
                  <i className="bi bi-person-plus-fill" /> Get Started Free
                </button>
                <button onClick={() => navigate('/doctor/login')} style={{
                  background: 'rgba(255,255,255,0.06)',
                  color: 'white', border: '1.5px solid rgba(255,255,255,0.2)',
                  borderRadius: 10, padding: '14px 32px', fontSize: 15, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'DM Sans', backdropFilter: 'blur(10px)',
                  display: 'flex', alignItems: 'center', gap: 8,
                  transition: 'all 0.25s'
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                >
                  <i className="bi bi-hospital" /> Doctor Portal
                </button>
              </div>

              {/* Trust badges */}
              <div className="d-flex align-items-center gap-4 flex-wrap" style={{ animation: 'fadeInUp 0.6s 0.4s ease both' }}>
                {[
                  { icon: 'bi-lock-fill', text: 'HIPAA Secure' },
                  { icon: 'bi-camera-video-fill', text: 'Webcam Only' },
                  { icon: 'bi-lightning-charge-fill', text: '45s Scan' },
                ].map(b => (
                  <div key={b.text} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <i className={`bi ${b.icon}`} style={{ color: '#00B4D8', fontSize: 13 }} />
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>{b.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — Dashboard preview */}
            <div className="col-lg-6 d-none d-lg-block">
              <div style={{ position: 'relative', animation: 'fadeInRight 0.8s 0.3s ease both' }}>

                {/* Main card */}
                <div style={{
                  background: 'rgba(255,255,255,0.06)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 24, padding: 28,
                  boxShadow: '0 30px 80px rgba(0,0,0,0.4)'
                }}>
                  {/* Card header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                    <div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Live Heart Rate</div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                        <span style={{ fontFamily: 'Poppins', fontSize: 48, fontWeight: 800, color: '#00B4D8', lineHeight: 1 }}>72</span>
                        <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>BPM</span>
                      </div>
                    </div>
                    <div style={{
                      width: 56, height: 56, borderRadius: 16,
                      background: 'rgba(0,180,216,0.15)',
                      border: '1px solid rgba(0,180,216,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <i className="bi bi-heart-pulse-fill" style={{ fontSize: 26, color: '#00B4D8', animation: 'heartbeat 1.5s ease infinite' }} />
                    </div>
                  </div>

                  {/* ECG Line */}
                  <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: '12px 16px', marginBottom: 20 }}>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>ECG Signal</div>
                    <svg viewBox="0 0 300 50" style={{ width: '100%', height: 50 }}>
                      <polyline
                        points="0,25 20,25 30,25 35,5 40,45 45,15 50,30 55,25 80,25 100,25 110,25 115,5 120,45 125,15 130,30 135,25 160,25 180,25 190,25 195,5 200,45 205,15 210,30 215,25 240,25 260,25 270,25 275,5 280,45 285,15 290,30 295,25 300,25"
                        fill="none" stroke="#00B4D8" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  {/* Status row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                    {[
                      { icon: 'bi-shield-check-fill', label: 'Status', value: 'Normal', color: '#10B981' },
                      { icon: 'bi-clock-fill', label: 'Duration', value: '45 sec', color: '#00B4D8' },
                      { icon: 'bi-camera-video-fill', label: 'Method', value: 'rPPG', color: '#818CF8' },
                    ].map(s => (
                      <div key={s.label} style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
                        <i className={`bi ${s.icon}`} style={{ color: s.color, fontSize: 16, marginBottom: 4, display: 'block' }} />
                        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
                        <div style={{ fontFamily: 'Poppins', fontSize: 13, fontWeight: 700, color: 'white', marginTop: 2 }}>{s.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Floating card 1 — Doctor */}
                <div style={{
                  position: 'absolute', top: -28, right: -28,
                  background: 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 16, padding: '14px 18px',
                  display: 'flex', alignItems: 'center', gap: 12,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                  animation: 'float 3s ease-in-out infinite'
                }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #10B981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="bi bi-person-badge-fill" style={{ color: 'white', fontSize: 18 }} />
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Poppins', fontSize: 13, fontWeight: 700, color: 'white' }}>Dr. Available</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Cardiologist</div>
                  </div>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', animation: 'pulse-slow 2s infinite' }} />
                </div>

                {/* Floating card 2 — Accuracy */}
                <div style={{
                  position: 'absolute', bottom: -24, left: -28,
                  background: 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 16, padding: '14px 20px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                  animation: 'float 3s 1.5s ease-in-out infinite'
                }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Scan Quality</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ fontFamily: 'Poppins', fontSize: 24, fontWeight: 800, color: '#00B4D8' }}>95%</div>
                    <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden', minWidth: 80 }}>
                      <div style={{ height: '100%', width: '95%', background: 'linear-gradient(90deg, #00B4D8, #10B981)', borderRadius: 3 }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div style={{ position: 'absolute', bottom: -2, left: 0, right: 0 }}>
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ width: '100%', height: 80, display: 'block' }}>
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#F8FAFC" />
          </svg>
        </div>
      </section>

      {/* ── STATS COUNTER ─────────────────────────────── */}
      <section ref={statsRef} style={{ background: '#F8FAFC', padding: '60px 0' }}>
        <div className="container">
          <div className="row g-4 text-center">
            {[
              { value: counts.patients, suffix: '+', label: 'Patients Monitored', icon: 'bi-people-fill', color: '#0B2D6F' },
              { value: counts.scans, suffix: '+', label: 'Heart Scans Done', icon: 'bi-camera-video-fill', color: '#00B4D8' },
              { value: counts.doctors, suffix: '+', label: 'Expert Doctors', icon: 'bi-person-badge-fill', color: '#059669' },
              { value: counts.accuracy, suffix: '%', label: 'Scan Accuracy', icon: 'bi-shield-check-fill', color: '#7C3AED' },
            ].map((s, i) => (
              <div key={s.label} className="col-6 col-md-3 scroll-reveal" style={{ ...revealStyle, transitionDelay: `${i * 0.1}s` }}>
                <div style={{ padding: '24px 16px' }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: `${s.color}15`, border: `1px solid ${s.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                    <i className={`bi ${s.icon}`} style={{ fontSize: 24, color: s.color }} />
                  </div>
                  <div style={{ fontFamily: 'Poppins', fontSize: 36, fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: 6 }}>
                    {s.value.toLocaleString()}{s.suffix}
                  </div>
                  <div style={{ fontSize: 14, color: '#64748B', fontWeight: 500 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ──────────────────────────────────── */}
      <section id="services" style={{ background: '#0B2D6F', padding: '90px 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: 400, height: 400, borderRadius: '0 0 0 400px', background: 'rgba(0,180,216,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: 300, height: 300, borderRadius: '0 300px 0 0', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="text-center mb-5 scroll-reveal" style={revealStyle}>
            <div style={{ display: 'inline-block', background: 'rgba(0,180,216,0.12)', border: '1px solid rgba(0,180,216,0.25)', borderRadius: 20, padding: '5px 16px', marginBottom: 16 }}>
              <span style={{ fontSize: 11, color: '#00B4D8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em' }}>Our Services</span>
            </div>
            <h2 style={{ fontFamily: 'Poppins', fontSize: 38, fontWeight: 800, color: 'white', marginBottom: 14, letterSpacing: '-0.02em' }}>
              Trusted Care, Every Step<br />with HeartHealth
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, maxWidth: 480, margin: '0 auto' }}>
              Comprehensive cardiac health monitoring with professional medical consultation
            </p>
          </div>

          <div className="row g-4">
            {[
              { icon: 'bi-heart-pulse', title: 'Heart Rate Monitoring', desc: 'Contact-less heart rate detection using facial video and rPPG signal processing technology.' },
              { icon: 'bi-camera-video', title: 'Facial Video Scan', desc: 'Advanced Daubechies wavelet-based STI feature extraction for accurate BPM estimation.' },
              { icon: 'bi-person-badge', title: 'Cardiologist Consult', desc: 'Connect with expert cardiologists and general physicians for personalized cardiac care.' },
              { icon: 'bi-chat-dots', title: 'Real-time Chat', desc: 'Instant secure messaging with your doctor through Socket.io WebSocket communication.' },
              { icon: 'bi-graph-up', title: 'Health Analytics', desc: 'Interactive heart rate trend charts with complete history and health status breakdown.' },
              { icon: 'bi-shield-check', title: 'Health Classification', desc: 'Automatic Normal, Warning, and High Risk classification with immediate recommendations.' },
            ].map((s, i) => (
              <div key={s.title} className="col-md-6 col-lg-4">
                <div className="scroll-reveal" style={{ ...revealStyle, transitionDelay: `${i * 0.1}s` }}>
                  <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 16, padding: '28px 24px',
                    transition: 'all 0.3s ease', cursor: 'default', height: '100%'
                  }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(0,180,216,0.1)';
                      e.currentTarget.style.borderColor = 'rgba(0,180,216,0.3)';
                      e.currentTarget.style.transform = 'translateY(-6px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{ width: 54, height: 54, borderRadius: 14, background: 'rgba(0,180,216,0.12)', border: '1px solid rgba(0,180,216,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, transition: 'all 0.3s' }}>
                      <i className={`bi ${s.icon}`} style={{ fontSize: 24, color: '#00B4D8' }} />
                    </div>
                    <h6 style={{ fontFamily: 'Poppins', fontWeight: 700, color: 'white', marginBottom: 10, fontSize: 16 }}>{s.title}</h6>
                    <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.7 }}>{s.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────── */}
      <section id="features" style={{ padding: '90px 0', background: 'white' }}>
        <div className="container">
          <div className="row align-items-center g-5 mb-6">
            <div className="col-lg-5 scroll-reveal" style={revealLeftStyle}>
              <div style={{ display: 'inline-block', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 20, padding: '5px 16px', marginBottom: 16 }}>
                <span style={{ fontSize: 11, color: '#1E40AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em' }}>Why HeartHealth</span>
              </div>
              <h2 style={{ fontFamily: 'Poppins', fontSize: 38, fontWeight: 800, color: '#0B2D6F', marginBottom: 16, letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                No Sensors.<br />Just Your Webcam.
              </h2>
              <p style={{ fontSize: 16, color: '#475569', lineHeight: 1.8, marginBottom: 28 }}>
                Using advanced rPPG technology, HeartHealth detects subtle color changes in your facial skin caused by blood circulation — giving you accurate heart rate readings without any physical device.
              </p>
              <button onClick={() => navigate('/patient/register')} style={{
                background: '#0B2D6F', color: 'white', border: 'none',
                borderRadius: 10, padding: '13px 28px', fontSize: 14,
                fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans',
                display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s'
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#1A3F8F'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#0B2D6F'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <i className="bi bi-play-circle-fill" /> Start Free Scan
              </button>
            </div>

            <div className="col-lg-7 scroll-reveal" style={{ ...revealRightStyle, transitionDelay: '0.2s' }}>
              <div className="row g-3">
                {[
                  { icon: 'bi-broadcast', title: 'Contact-less', desc: 'Zero physical contact required — just sit in front of your camera.', color: '#0B2D6F', bg: '#EFF6FF' },
                  { icon: 'bi-lightning-charge', title: 'Instant Results', desc: 'Get your full heart health analysis in under 60 seconds.', color: '#7C3AED', bg: '#F5F3FF' },
                  { icon: 'bi-stethoscope', title: 'Expert Doctors', desc: 'Verified Cardiologists and General Physicians on-demand.', color: '#059669', bg: '#F0FDF4' },
                  { icon: 'bi-lock-fill', title: 'Fully Secure', desc: 'JWT encrypted with bcrypt password protection at all times.', color: '#DC2626', bg: '#FEF2F2' },
                ].map((f, i) => (
                  <div className="col-6" key={f.title}>
                    <div style={{
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: 16, padding: '20px',
                      transition: 'all 0.3s', height: '100%'
                    }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(11,45,111,0.1)'; e.currentTarget.style.borderColor = '#CBD5E1'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#E2E8F0'; }}
                    >
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                        <i className={`bi ${f.icon}`} style={{ fontSize: 20, color: f.color }} />
                      </div>
                      <h6 style={{ fontFamily: 'Poppins', fontWeight: 700, color: '#0F172A', marginBottom: 6, fontSize: 15 }}>{f.title}</h6>
                      <p style={{ fontSize: 13, color: '#64748B', margin: 0, lineHeight: 1.6 }}>{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────── */}
      <section style={{ background: '#F8FAFC', padding: '90px 0' }}>
        <div className="container">
          <div className="text-center mb-5 scroll-reveal" style={revealStyle}>
            <div style={{ display: 'inline-block', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 20, padding: '5px 16px', marginBottom: 16 }}>
              <span style={{ fontSize: 11, color: '#1E40AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em' }}>How It Works</span>
            </div>
            <h2 style={{ fontFamily: 'Poppins', fontSize: 38, fontWeight: 800, color: '#0B2D6F', marginBottom: 12, letterSpacing: '-0.02em' }}>
              Working Hours &amp; Process
            </h2>
            <p style={{ color: '#64748B', fontSize: 16, maxWidth: 440, margin: '0 auto' }}>
              Get your heart health report in 4 simple steps
            </p>
          </div>

          <div className="row g-4">
            {[
              { step: '01', icon: 'bi-person-check', title: 'Register', desc: 'Create your free patient account with basic health details in under 2 minutes.', color: '#0B2D6F' },
              { step: '02', icon: 'bi-camera-video', title: 'Scan', desc: 'Allow webcam access and complete the 45-second facial video heart scan.', color: '#00B4D8' },
              { step: '03', icon: 'bi-bar-chart-line', title: 'Get Results', desc: 'Receive instant BPM reading with Normal, Warning, or High Risk classification.', color: '#7C3AED' },
              { step: '04', icon: 'bi-chat-dots', title: 'Consult Doctor', desc: 'If results are abnormal, connect with a specialist for real-time consultation.', color: '#059669' },
            ].map((s, i) => (
              <div key={s.step} className="col-md-6 col-lg-3">
                <div className="scroll-reveal" style={{ ...revealStyle, transitionDelay: `${i * 0.12}s` }}>
                  <div style={{
                    background: 'white', border: '1px solid #E2E8F0',
                    borderRadius: 18, padding: '28px 22px',
                    position: 'relative', overflow: 'hidden',
                    transition: 'all 0.3s', height: '100%'
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(11,45,111,0.12)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    {/* Step number watermark */}
                    <div style={{ position: 'absolute', top: -10, right: 10, fontFamily: 'Poppins', fontSize: 72, fontWeight: 900, color: `${s.color}08`, lineHeight: 1, pointerEvents: 'none', userSelect: 'none' }}>{s.step}</div>
                    <div style={{ width: 52, height: 52, borderRadius: 14, background: `${s.color}12`, border: `1.5px solid ${s.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                      <i className={`bi ${s.icon}`} style={{ fontSize: 24, color: s.color }} />
                    </div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                      <span style={{ fontFamily: 'Poppins', fontSize: 11, fontWeight: 800, color: s.color, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Step {s.step}</span>
                    </div>
                    <h6 style={{ fontFamily: 'Poppins', fontWeight: 700, color: '#0F172A', marginBottom: 8, fontSize: 16 }}>{s.title}</h6>
                    <p style={{ fontSize: 14, color: '#64748B', margin: 0, lineHeight: 1.7 }}>{s.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PORTALS ───────────────────────────────────── */}
      <section id="portals" style={{ background: 'white', padding: '90px 0' }}>
        <div className="container">
          <div className="text-center mb-5 scroll-reveal" style={revealStyle}>
            <div style={{ display: 'inline-block', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 20, padding: '5px 16px', marginBottom: 16 }}>
              <span style={{ fontSize: 11, color: '#1E40AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em' }}>Get Started</span>
            </div>
            <h2 style={{ fontFamily: 'Poppins', fontSize: 38, fontWeight: 800, color: '#0B2D6F', marginBottom: 12, letterSpacing: '-0.02em' }}>
              Choose Your Portal
            </h2>
            <p style={{ color: '#64748B', fontSize: 16 }}>Begin your heart health journey today — completely free</p>
          </div>

          <div className="row g-4 justify-content-center">
            {/* Patient */}
            <div className="col-md-5">
              <div className="scroll-reveal" style={revealLeftStyle}>
                <div style={{
                  background: 'white', borderRadius: 20, overflow: 'hidden',
                  border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(11,45,111,0.07)',
                  transition: 'all 0.3s'
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 48px rgba(11,45,111,0.15)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(11,45,111,0.07)'; }}
                >
                  <div style={{ background: 'linear-gradient(135deg, #0B2D6F 0%, #1A3F8F 100%)', padding: '28px 28px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>Patient Portal</div>
                        <h3 style={{ fontFamily: 'Poppins', fontWeight: 800, color: 'white', fontSize: 26, margin: 0 }}>Patient</h3>
                      </div>
                      <div style={{ width: 56, height: 56, background: 'rgba(255,255,255,0.12)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="bi bi-person-heart" style={{ fontSize: 26, color: '#00B4D8' }} />
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: '24px 28px 28px' }}>
                    <p style={{ fontSize: 14, color: '#64748B', marginBottom: 20, lineHeight: 1.7 }}>Monitor your heart health from the comfort of home — no equipment needed.</p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px' }}>
                      {[
                        'Contact-less facial video heart scan',
                        'Instant BPM result and health status',
                        'Complete health history with charts',
                        'Real-time doctor consultation chat',
                      ].map(item => (
                        <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                          <i className="bi bi-check-circle-fill" style={{ color: '#059669', fontSize: 15, marginTop: 1, flexShrink: 0 }} />
                          <span style={{ fontSize: 14, color: '#334155' }}>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button onClick={() => navigate('/patient/register')} style={{
                        flex: 1, padding: '13px', background: '#0B2D6F', color: 'white',
                        border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700,
                        cursor: 'pointer', fontFamily: 'DM Sans',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        transition: 'all 0.2s'
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = '#1A3F8F'}
                        onMouseLeave={e => e.currentTarget.style.background = '#0B2D6F'}
                      >
                        <i className="bi bi-person-plus" /> Register
                      </button>
                      <button onClick={() => navigate('/patient/login')} style={{
                        padding: '13px 20px', background: 'transparent', color: '#0B2D6F',
                        border: '2px solid #E2E8F0', borderRadius: 10, fontSize: 14,
                        fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans',
                        whiteSpace: 'nowrap', transition: 'all 0.2s'
                      }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#0B2D6F'; e.currentTarget.style.background = '#EFF6FF'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = 'transparent'; }}
                      >
                        Sign In
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Doctor */}
            <div className="col-md-5">
              <div className="scroll-reveal" style={{ ...revealRightStyle, transitionDelay: '0.2s' }}>
                <div style={{
                  background: 'white', borderRadius: 20, overflow: 'hidden',
                  border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(5,150,105,0.07)',
                  transition: 'all 0.3s'
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 48px rgba(5,150,105,0.15)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(5,150,105,0.07)'; }}
                >
                  <div style={{ background: 'linear-gradient(135deg, #065F46 0%, #047857 100%)', padding: '28px 28px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>Doctor Portal</div>
                        <h3 style={{ fontFamily: 'Poppins', fontWeight: 800, color: 'white', fontSize: 26, margin: 0 }}>Doctor</h3>
                      </div>
                      <div style={{ width: 56, height: 56, background: 'rgba(255,255,255,0.12)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="bi bi-hospital" style={{ fontSize: 26, color: '#10B981' }} />
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: '24px 28px 28px' }}>
                    <p style={{ fontSize: 14, color: '#64748B', marginBottom: 20, lineHeight: 1.7 }}>Consult and support patients remotely with full heart health data at your fingertips.</p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px' }}>
                      {[
                        'Review patient heart scan reports',
                        'Accept or decline consultation requests',
                        'Real-time patient messaging chat',
                        'Complete patient health history',
                      ].map(item => (
                        <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                          <i className="bi bi-check-circle-fill" style={{ color: '#059669', fontSize: 15, marginTop: 1, flexShrink: 0 }} />
                          <span style={{ fontSize: 14, color: '#334155' }}>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button onClick={() => navigate('/doctor/register')} style={{
                        flex: 1, padding: '13px', background: '#059669', color: 'white',
                        border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700,
                        cursor: 'pointer', fontFamily: 'DM Sans',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        transition: 'all 0.2s'
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = '#047857'}
                        onMouseLeave={e => e.currentTarget.style.background = '#059669'}
                      >
                        <i className="bi bi-person-plus" /> Register
                      </button>
                      <button onClick={() => navigate('/doctor/login')} style={{
                        padding: '13px 20px', background: 'transparent', color: '#059669',
                        border: '2px solid #E2E8F0', borderRadius: 10, fontSize: 14,
                        fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans',
                        whiteSpace: 'nowrap', transition: 'all 0.2s'
                      }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#059669'; e.currentTarget.style.background = '#F0FDF4'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = 'transparent'; }}
                      >
                        Sign In
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(135deg, #040D21 0%, #071D4A 50%, #0A2A6E 100%)',
        padding: '70px 0', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '50px 50px', pointerEvents: 'none' }} />
        <div className="container text-center" style={{ position: 'relative', zIndex: 1 }}>
          <div className="scroll-reveal" style={revealStyle}>
            <h2 style={{ fontFamily: 'Poppins', fontSize: 40, fontWeight: 800, color: 'white', marginBottom: 16, letterSpacing: '-0.02em' }}>
              Ready to Monitor Your Heart?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 16, marginBottom: 36, maxWidth: 500, margin: '0 auto 36px' }}>
              Join thousands of patients using HeartHealth for contact-less cardiac monitoring — no equipment, no appointments, no waiting.
            </p>
            <div className="d-flex gap-3 justify-content-center flex-wrap">
              <button onClick={() => navigate('/patient/register')} style={{
                background: 'linear-gradient(135deg, #00B4D8, #0077B6)',
                color: 'white', border: 'none', borderRadius: 10,
                padding: '14px 36px', fontSize: 15, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'DM Sans',
                boxShadow: '0 8px 24px rgba(0,180,216,0.35)',
                display: 'flex', alignItems: 'center', gap: 8,
                transition: 'all 0.25s'
              }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <i className="bi bi-play-circle-fill" /> Start Free Scan
              </button>
              <button onClick={() => navigate('/doctor/register')} style={{
                background: 'rgba(255,255,255,0.07)',
                color: 'white', border: '1.5px solid rgba(255,255,255,0.2)',
                borderRadius: 10, padding: '14px 36px', fontSize: 15, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'DM Sans',
                display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.25s'
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
              >
                <i className="bi bi-hospital" /> Join as Doctor
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────── */}
      <footer style={{ background: '#040D21', padding: '48px 0 24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="container">
          <div className="row g-4 mb-4">
            <div className="col-md-4">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #00B4D8, #0077B6)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="bi bi-heart-pulse-fill" style={{ color: 'white', fontSize: 17 }} />
                </div>
                <span style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: 18, color: 'white' }}>Heart<span style={{ color: '#00B4D8' }}>Health</span></span>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', lineHeight: 1.7 }}>
                Contact-less heart rate monitoring using advanced rPPG technology. No sensors — just your webcam.
              </p>
            </div>
            <div className="col-6 col-md-2">
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>Patients</div>
              {['Register', 'Login', 'Heart Scan', 'Find Doctors'].map(link => (
                <div key={link} style={{ marginBottom: 8 }}>
                  <span onClick={() => navigate(`/patient/${link.toLowerCase().replace(' ', '/')}`)} style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.target.style.color = '#00B4D8'}
                    onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.4)'}
                  >{link}</span>
                </div>
              ))}
            </div>
            <div className="col-6 col-md-2">
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>Doctors</div>
              {['Register', 'Login', 'Dashboard', 'Consultations'].map(link => (
                <div key={link} style={{ marginBottom: 8 }}>
                  <span onClick={() => navigate(`/doctor/${link.toLowerCase()}`)} style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.target.style.color = '#10B981'}
                    onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.4)'}
                  >{link}</span>
                </div>
              ))}
            </div>
            <div className="col-md-4">
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>About</div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', lineHeight: 1.7 }}>
                Developed at RGUKT RK Valley, CSE Department, as a Major Project 2025-2026.
              </p>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                {['bi-shield-check-fill', 'bi-lock-fill', 'bi-heart-pulse-fill'].map(icon => (
                  <div key={icon} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(0,180,216,0.1)', border: '1px solid rgba(0,180,216,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className={`bi ${icon}`} style={{ color: '#00B4D8', fontSize: 14 }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>
              HeartHealth Monitor &copy; 2026 — RGUKT RK Valley
            </span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>
              No physical sensors required — just your webcam
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
