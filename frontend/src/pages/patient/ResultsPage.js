import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { heartAPI } from '../../utils/api';

const STATUS_CONFIG = {
  Normal: { color: 'var(--success)', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', icon: '✅', emoji: '💚' },
  Warning: { color: 'var(--warning)', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', icon: '⚠️', emoji: '💛' },
  'High Risk': { color: 'var(--danger)', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', icon: '🚨', emoji: '❤️' },
};

export default function ResultsPage() {
  const { reportId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [report, setReport] = useState(location.state?.report || null);
  const simulated = location.state?.simulated;

  useEffect(() => {
    if (!report) {
      heartAPI.report(reportId).then(r => setReport(r.data)).catch(console.error);
    }
  }, [reportId, report]);

  if (!report) return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    </div>
  );

  const cfg = STATUS_CONFIG[report.status] || STATUS_CONFIG.Normal;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Heart Scan Results</h1>
          <p className="page-subtitle">{new Date(report.createdAt).toLocaleString()}</p>
        </div>

        {report.rppgData?.signalQuality < 0.4 && (
          <div className="alert alert-error" style={{ marginBottom: 20 }}>
            Low signal quality detected. Results may not be accurate. Please rescan in better lighting.
          </div>
        )}

        <div style={{ maxWidth: 600 }}>
          {/* BPM Display */}
          <div className="card card-accent animate-fadeInUp" style={{ textAlign: 'center', padding: '48px 32px', marginBottom: 20, borderColor: cfg.border }}>
            <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
              {/* Pulse rings */}
              {[1, 2, 3].map(i => (
                <div key={i} style={{
                  position: 'absolute',
                  width: 140, height: 140,
                  borderRadius: '50%',
                  border: `1px solid ${cfg.color}`,
                  animation: `pulse-ring 2.5s ease-out ${i * 0.5}s infinite`,
                  opacity: 0
                }} />
              ))}
              <div style={{
                width: 140, height: 140,
                background: cfg.bg,
                border: `3px solid ${cfg.color}`,
                borderRadius: '50%',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 40px ${cfg.color}30`
              }}>
                <div style={{ fontSize: 48, fontWeight: 900, fontFamily: 'Syne', color: cfg.color, lineHeight: 1 }}>
                  {report.heartRate}
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>BPM</div>
              </div>
            </div>

            <div style={{ fontSize: 32, marginBottom: 12 }}>{cfg.emoji}</div>
            <h2 style={{ fontSize: 28, color: cfg.color, marginBottom: 8 }}>{report.status}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7, maxWidth: 400, margin: '0 auto' }}>
              {report.explanation}
            </p>

            {/* BPM Scale */}
            <div style={{ marginTop: 28, padding: '20px', background: 'var(--bg-surface)', borderRadius: 12 }}>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>Heart Rate Scale</div>
              <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ flex: 2, background: 'linear-gradient(90deg, #3B82F6, #10B981)', opacity: 0.6 }} />
                <div style={{ flex: 3, background: 'linear-gradient(90deg, #10B981, #F59E0B)', opacity: 0.6 }} />
                <div style={{ flex: 2, background: 'linear-gradient(90deg, #F59E0B, #EF4444)', opacity: 0.6 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                <span>{'<50'} Low</span>
                <span>60-100 Normal</span>
                <span>{'>'} 100 High</span>
              </div>
              {/* Marker */}
              <div style={{ fontSize: 12, color: cfg.color, marginTop: 8, fontWeight: 600 }}>
                Your reading: {report.heartRate} BPM
              </div>
            </div>
          </div>

          {/* Scan details */}
          {report.rppgData && (
            <div className="card" style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>SCAN DETAILS</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                {[
                  ['Frames Analyzed', report.rppgData.framesAnalyzed || 'N/A', '🎞️'],
                  ['Signal Quality', report.rppgData.signalQuality ? `${Math.round(report.rppgData.signalQuality * 100)}%` : 'N/A', '📡'],
                  ['Processing Time', report.rppgData.processingTime ? `${report.rppgData.processingTime.toFixed(1)}s` : 'N/A', '⏱️'],
                ].map(([label, val, icon]) => (
                  <div key={label} style={{ textAlign: 'center', padding: '14px', background: 'var(--bg-surface)', borderRadius: 10 }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{val}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => navigate('/patient/scan')}>
              🔄 New Scan
            </button>
            <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => navigate('/patient/history')}>
              📊 View History
            </button>
            {report.status !== 'Normal' && (
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => navigate('/patient/doctors')}>
                🩺 Consult Doctor
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
