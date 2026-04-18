import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import { heartAPI } from '../../utils/api';

export default function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [latestReport, setLatestReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([heartAPI.latest(), heartAPI.history()])
      .then(([lr, hr]) => { setLatestReport(lr.data); setHistory(hr.data || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statusColor = { Normal: '#059669', Warning: '#D97706', 'High Risk': '#DC2626' };
  const statusBg = { Normal: '#D1FAE5', Warning: '#FEF3C7', 'High Risk': '#FEE2E2' };
  const statusBadge = { Normal: 'badge-normal', Warning: 'badge-warning', 'High Risk': 'badge-danger' };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">

        {/* Welcome Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #0B2D6F 0%, #1A3F8F 100%)',
          borderRadius: 16, padding: '28px 32px',
          marginBottom: 28, position: 'relative', overflow: 'hidden'
        }}
          className="animate-fadeInUp"
        >
          <div style={{ position: 'absolute', right: -40, top: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(0,180,216,0.08)', pointerEvents: 'none' }} />
          <div className="row align-items-center">
            <div className="col">
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: 4 }}>
                Patient Dashboard
              </p>
              <h2 style={{ fontFamily: 'Poppins', fontSize: 24, fontWeight: 700, color: 'white', margin: 0 }}>
                Good day, {user?.name?.split(' ')[0]}
              </h2>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: '6px 0 0' }}>
                {user?.occupation} &mdash; Age {user?.age}
              </p>
            </div>
            <div className="col-auto text-end">
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Scans</div>
              <div style={{ fontFamily: 'Poppins', fontSize: 36, fontWeight: 800, color: '#00B4D8', lineHeight: 1 }}>
                {history.length}
              </div>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="row g-4 mb-4">
          <div className="col-md-6">
            <div
              className="hh-card animate-fadeInUp delay-1"
              style={{ cursor: 'pointer', borderTop: '4px solid #0B2D6F' }}
              onClick={() => navigate('/patient/scan')}
            >
              <div className="d-flex align-items-center gap-3 mb-3">
                <div style={{ width: 52, height: 52, background: '#EFF6FF', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="bi bi-camera-video-fill" style={{ fontSize: 22, color: '#0B2D6F' }} />
                </div>
                <div>
                  <h5 style={{ fontFamily: 'Poppins', fontWeight: 700, margin: 0, color: '#0F172A' }}>Check Heart Health</h5>
                  <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>Facial video scan</p>
                </div>
              </div>
              <p style={{ fontSize: 13, color: '#475569', marginBottom: 16 }}>
                Start a 45-second contact-less heart rate scan using your webcam.
              </p>
              <button className="btn-navy btn-full">
                <i className="bi bi-play-circle" /> Start Scan
              </button>
            </div>
          </div>

          <div className="col-md-6">
            <div
              className="hh-card animate-fadeInUp delay-2"
              style={{ cursor: 'pointer', borderTop: '4px solid #059669' }}
              onClick={() => navigate('/patient/doctors')}
            >
              <div className="d-flex align-items-center gap-3 mb-3">
                <div style={{ width: 52, height: 52, background: '#F0FDF4', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="bi bi-person-badge-fill" style={{ fontSize: 22, color: '#059669' }} />
                </div>
                <div>
                  <h5 style={{ fontFamily: 'Poppins', fontWeight: 700, margin: 0, color: '#0F172A' }}>Consult Doctor</h5>
                  <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>Connect with specialists</p>
                </div>
              </div>
              <p style={{ fontSize: 13, color: '#475569', marginBottom: 16 }}>
                Consult with Cardiologists and General Physicians online.
              </p>
              <button className="btn-full btn-sm-hh" style={{ background: '#059669', color: 'white', border: 'none', borderRadius: 8, fontFamily: 'DM Sans', fontWeight: 600, cursor: 'pointer', padding: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <i className="bi bi-search" /> Find Doctors
              </button>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="row g-3 mb-4">
          {[
            { label: 'Total Scans', value: history.length, sub: 'health checks', color: '#0B2D6F', icon: 'bi-clipboard-pulse' },
            latestReport && { label: 'Latest BPM', value: latestReport.heartRate, sub: 'beats per minute', color: statusColor[latestReport.status], icon: 'bi-heart-pulse' },
            latestReport && { label: 'Health Status', value: latestReport.status, sub: 'last reading', color: statusColor[latestReport.status], icon: 'bi-shield-check' },
            { label: 'Age', value: user?.age, sub: user?.occupation, color: '#0B2D6F', icon: 'bi-person' },
          ].filter(Boolean).map((s, i) => (
            <div className="col-6 col-lg-3" key={s.label}>
              <div className={`stat-card animate-fadeInUp delay-${i + 1}`} style={{ '--before-color': s.color }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div className="stat-card-label">{s.label}</div>
                  <i className={`bi ${s.icon}`} style={{ color: s.color, fontSize: 18 }} />
                </div>
                <div className="stat-card-value" style={{ color: s.color, fontSize: 28 }}>{s.value}</div>
                <div className="stat-card-sub">{s.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Latest Report */}
        {latestReport && (
          <div className="hh-card hh-card-accent mb-4 animate-fadeInUp delay-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 style={{ fontFamily: 'Poppins', fontWeight: 700, margin: 0 }}>Latest Heart Report</h5>
              <button className="btn-outline-navy btn-sm-hh" onClick={() => navigate('/patient/history')}>
                <i className="bi bi-clock-history" /> View History
              </button>
            </div>
            <div className="d-flex align-items-center gap-4">
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                border: `3px solid ${statusColor[latestReport.status]}`,
                background: statusBg[latestReport.status],
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                boxShadow: `0 4px 20px ${statusColor[latestReport.status]}30`
              }}>
                <div style={{ fontFamily: 'Poppins', fontSize: 22, fontWeight: 800, color: statusColor[latestReport.status], lineHeight: 1 }}>
                  {latestReport.heartRate}
                </div>
                <div style={{ fontSize: 9, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>BPM</div>
              </div>
              <div>
                <span className={`badge-hh ${statusBadge[latestReport.status]}`} style={{ marginBottom: 8, display: 'inline-flex' }}>
                  {latestReport.status}
                </span>
                <p style={{ fontSize: 14, color: '#475569', margin: 0, lineHeight: 1.6 }}>{latestReport.explanation}</p>
                <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
                  <i className="bi bi-calendar3 me-1" />
                  {new Date(latestReport.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
            {latestReport.status !== 'Normal' && (
              <div className="alert-hh alert-warning-hh mt-3 d-flex align-items-center justify-content-between gap-3">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-exclamation-triangle-fill" />
                  <span style={{ fontSize: 13, fontWeight: 500 }}>Abnormal heart rate detected. Consider consulting a doctor.</span>
                </div>
                <button className="btn-danger-hh btn-sm-hh" style={{ flexShrink: 0 }} onClick={() => navigate('/patient/doctors')}>
                  Consult Doctor
                </button>
              </div>
            )}
          </div>
        )}

        {/* Recent Readings */}
        {history.length > 0 && (
          <div className="hh-card animate-fadeInUp delay-4">
            <h5 style={{ fontFamily: 'Poppins', fontWeight: 700, marginBottom: 16 }}>Recent Readings</h5>
            <div className="d-flex flex-column gap-2">
              {history.slice(0, 4).map(r => (
                <div key={r._id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 16px', background: '#F8FAFC',
                  borderRadius: 10, border: '1px solid #E2E8F0',
                  transition: 'all 0.2s', cursor: 'pointer'
                }}
                  onMouseEnter={e => e.currentTarget.style.background = '#EFF6FF'}
                  onMouseLeave={e => e.currentTarget.style.background = '#F8FAFC'}
                  onClick={() => navigate(`/patient/results/${r._id}`)}
                >
                  <div className="d-flex align-items-center gap-3">
                    <div style={{
                      width: 42, height: 42, borderRadius: '50%',
                      border: `2px solid ${statusColor[r.status]}`,
                      background: statusBg[r.status],
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 800, color: statusColor[r.status],
                      fontFamily: 'Poppins'
                    }}>{r.heartRate}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{r.heartRate} BPM</div>
                      <div style={{ fontSize: 12, color: '#94A3B8' }}>{new Date(r.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span className={`badge-hh ${statusBadge[r.status]}`}>{r.status}</span>
                    <i className="bi bi-chevron-right" style={{ color: '#CBD5E1', fontSize: 12 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No scans */}
        {!loading && history.length === 0 && (
          <div className="hh-card text-center animate-fadeInUp" style={{ padding: '52px 24px' }}>
            <div style={{ width: 72, height: 72, background: '#EFF6FF', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <i className="bi bi-camera-video" style={{ fontSize: 32, color: '#0B2D6F' }} />
            </div>
            <h4 style={{ fontFamily: 'Poppins', marginBottom: 8 }}>No Scans Yet</h4>
            <p style={{ color: '#64748B', marginBottom: 24, fontSize: 14 }}>Take your first contact-less heart health scan</p>
            <button className="btn-navy" onClick={() => navigate('/patient/scan')}>
              <i className="bi bi-play-circle" /> Start First Scan
            </button>
          </div>
        )}
      </div>
    </div>
  );
}