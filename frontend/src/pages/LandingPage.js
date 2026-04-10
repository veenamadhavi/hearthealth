import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #EFF6FF 0%, #F0F9FF 60%, #E0F2FE 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Inter, sans-serif'
    }}>

      {/* Background blobs */}
      <div style={{
        position: 'absolute', top: '-80px', right: '-80px',
        width: 450, height: 450, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '-100px', left: '-80px',
        width: 450, height: 450, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{
        textAlign: 'center',
        maxWidth: 560,
        position: 'relative',
        zIndex: 1
      }}>

        {/* Logo box */}
        <div style={{
          width: 68, height: 68,
          background: 'linear-gradient(135deg, #2563EB, #06B6D4)',
          borderRadius: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
          boxShadow: '0 10px 30px rgba(37,99,235,0.3)'
        }}>
          <svg width="34" height="22" viewBox="0 0 48 28" fill="none">
            <polyline
              points="0,14 8,14 12,4 16,24 20,10 24,18 28,14 48,14"
              stroke="white" strokeWidth="3"
              strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* App name */}
        <div style={{
          fontSize: 12, fontWeight: 700,
          color: '#2563EB', letterSpacing: '0.14em',
          textTransform: 'uppercase', marginBottom: 16
        }}>
          Heart Health Monitor
        </div>

        {/* Main heading */}
        <h1 style={{
          fontSize: 50, fontWeight: 800,
          lineHeight: 1.1, marginBottom: 18,
          color: '#0F172A',
          fontFamily: 'Poppins, sans-serif',
          letterSpacing: '-0.02em'
        }}>
          Monitor Your Heart
          <br />
          <span style={{ color: '#2563EB' }}>
            Without Contact
          </span>
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: 16, color: '#475569',
          lineHeight: 1.8, marginBottom: 40,
          maxWidth: 420, margin: '0 auto 40px'
        }}>
          Measure your heart rate using facial video.
          Get instant results and consult doctors online.
        </p>

        {/* Stats */}
        <div style={{
          display: 'flex', justifyContent: 'center',
          gap: 48, marginBottom: 44
        }}>
          {[
            ['100%', 'Contactless'],
            ['45s', 'Quick Scan'],
            ['24/7', 'Doctor Access'],
          ].map(([val, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: 26, fontWeight: 800,
                color: '#2563EB',
                fontFamily: 'Poppins, sans-serif',
                marginBottom: 2
              }}>{val}</div>
              <div style={{
                fontSize: 11, color: '#94A3B8',
                textTransform: 'uppercase',
                letterSpacing: '0.08em', fontWeight: 500
              }}>{label}</div>
            </div>
          ))}
        </div>

        {/* CTA cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16, maxWidth: 440, margin: '0 auto'
        }}>

          {/* Patient */}
          <div style={{
            background: 'white',
            border: '1.5px solid rgba(37,99,235,0.18)',
            borderRadius: 18, padding: '26px 18px',
            display: 'flex', flexDirection: 'column', gap: 10,
            boxShadow: '0 4px 20px rgba(37,99,235,0.08)'
          }}>
            <div style={{
              width: 44, height: 44,
              background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
              borderRadius: 12,
              display: 'flex', alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 6px',
              fontSize: 22
            }}>🧑‍💼</div>
            <div style={{
              fontSize: 17, fontWeight: 700,
              color: '#0F172A', textAlign: 'center',
              fontFamily: 'Poppins, sans-serif'
            }}>Patient</div>
            <div style={{
              fontSize: 12, color: '#94A3B8',
              textAlign: 'center', marginBottom: 2
            }}>Monitor your heart health</div>
            <button onClick={() => navigate('/patient/register')} style={{
              width: '100%', padding: '11px',
              background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
              color: 'white', border: 'none',
              borderRadius: 9, fontSize: 14, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              boxShadow: '0 2px 10px rgba(37,99,235,0.25)'
            }}>Register</button>
            <button onClick={() => navigate('/patient/login')} style={{
              width: '100%', padding: '11px',
              background: 'transparent', color: '#2563EB',
              border: '1.5px solid rgba(37,99,235,0.25)',
              borderRadius: 9, fontSize: 14, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'Inter, sans-serif'
            }}>Login</button>
          </div>

          {/* Doctor */}
          <div style={{
            background: 'white',
            border: '1.5px solid rgba(8,145,178,0.2)',
            borderRadius: 18, padding: '26px 18px',
            display: 'flex', flexDirection: 'column', gap: 10,
            boxShadow: '0 4px 20px rgba(6,182,212,0.08)'
          }}>
            <div style={{
              width: 44, height: 44,
              background: 'linear-gradient(135deg, #ECFEFF, #CFFAFE)',
              borderRadius: 12,
              display: 'flex', alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 6px',
              fontSize: 22
            }}>👨‍⚕️</div>
            <div style={{
              fontSize: 17, fontWeight: 700,
              color: '#0F172A', textAlign: 'center',
              fontFamily: 'Poppins, sans-serif'
            }}>Doctor</div>
            <div style={{
              fontSize: 12, color: '#94A3B8',
              textAlign: 'center', marginBottom: 2
            }}>Consult with patients</div>
            <button onClick={() => navigate('/doctor/register')} style={{
              width: '100%', padding: '11px',
              background: 'linear-gradient(135deg, #0891B2, #06B6D4)',
              color: 'white', border: 'none',
              borderRadius: 9, fontSize: 14, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              boxShadow: '0 2px 10px rgba(8,145,178,0.25)'
            }}>Register</button>
            <button onClick={() => navigate('/doctor/login')} style={{
              width: '100%', padding: '11px',
              background: 'transparent', color: '#0891B2',
              border: '1.5px solid rgba(8,145,178,0.25)',
              borderRadius: 9, fontSize: 14, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'Inter, sans-serif'
            }}>Login</button>
          </div>
        </div>

        <p style={{
          fontSize: 12, color: '#94A3B8', marginTop: 28
        }}>
          No physical sensors required — just your webcam
        </p>
      </div>
    </div>
  );
}