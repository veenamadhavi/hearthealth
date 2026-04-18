import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { heartAPI } from '../../utils/api';

export default function ResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [report, setReport] = useState(location.state?.report || null);
  const [loading, setLoading] = useState(!report);

  useEffect(() => {
    if (!report && id) {
      heartAPI.getById(id).then(r => setReport(r.data)).finally(() => setLoading(false));
    }
  }, [id, report]);

  if (loading) return <div className="loading-screen"><div className="spinner-hh" /></div>;
  if (!report) return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content d-flex align-items-center justify-content-center">
        <div className="text-center">
          <i className="bi bi-exclamation-circle" style={{ fontSize: 48, color: '#DC2626' }} />
          <h4 style={{ fontFamily: 'Poppins', marginTop: 16 }}>Report not found</h4>
          <button className="btn-navy mt-3" onClick={() => navigate('/patient/dashboard')}>Go to Dashboard</button>
        </div>
      </div>
    </div>
  );

  const statusColor = { Normal: '#059669', Warning: '#D97706', 'High Risk': '#DC2626' };
  const statusBg = { Normal: '#D1FAE5', Warning: '#FEF3C7', 'High Risk': '#FEE2E2' };
  const statusIcon = { Normal: 'bi-check-circle-fill', Warning: 'bi-exclamation-triangle-fill', 'High Risk': 'bi-x-circle-fill' };
  const statusBadge = { Normal: 'badge-normal', Warning: 'badge-warning', 'High Risk': 'badge-danger' };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">

        {/* Header */}
        <div className="page-header-hh animate-fadeInUp">
          <div className="d-flex align-items-center gap-3">
            <button className="btn-outline-navy btn-sm-hh" onClick={() => navigate('/patient/dashboard')}>
              <i className="bi bi-arrow-left" /> Back
            </button>
            <div>
              <h2 className="page-title-hh">Scan Results</h2>
              <p className="page-subtitle-hh">Your heart health analysis report</p>
            </div>
          </div>
        </div>

        <div className="row g-4">

          {/* BPM Card */}
          <div className="col-lg-5">
            <div className="hh-card text-center animate-scaleIn" style={{ padding: '40px 24px', borderTop: `4px solid ${statusColor[report.status]}` }}>
              {/* Ripple BPM circle */}
              <div style={{ position: 'relative', width: 180, height: 180, margin: '0 auto 24px' }}>
                <div style={{
                  position: 'absolute', inset: -20, borderRadius: '50%',
                  border: `2px solid ${statusColor[report.status]}`,
                  opacity: 0.2, animation: 'ripple 2s ease-out infinite'
                }} />
                <div style={{
                  position: 'absolute', inset: -10, borderRadius: '50%',
                  border: `2px solid ${statusColor[report.status]}`,
                  opacity: 0.15, animation: 'ripple 2s ease-out 0.5s infinite'
                }} />
                <div style={{
                  width: 180, height: 180, borderRadius: '50%',
                  border: `5px solid ${statusColor[report.status]}`,
                  background: statusBg[report.status],
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 8px 32px ${statusColor[report.status]}30`,
                  position: 'relative'
                }}>
                  <div style={{ fontFamily: 'Poppins', fontSize: 52, fontWeight: 800, color: statusColor[report.status], lineHeight: 1 }}>
                    {report.heartRate}
                  </div>
                  <div style={{ fontSize: 13, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>BPM</div>
                </div>
              </div>

              <span className={`badge-hh ${statusBadge[report.status]}`} style={{ fontSize: 14, padding: '6px 18px', marginBottom: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <i className={`bi ${statusIcon[report.status]}`} />
                {report.status}
              </span>
              <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.7 }}>{report.explanation}</p>

              {report.simulated && (
                <div className="alert-hh alert-info-hh mt-3">
                  <i className="bi bi-info-circle me-2" />
                  Simulated result — Python service offline
                </div>
              )}
            </div>
          </div>

          {/* Info + Actions */}
          <div className="col-lg-7">
            <div className="d-flex flex-column gap-3">

              {/* Details */}
              <div className="hh-card animate-fadeInRight">
                <h5 style={{ fontFamily: 'Poppins', fontWeight: 700, marginBottom: 16 }}>
                  <i className="bi bi-file-medical me-2 text-primary" />Report Details
                </h5>
                <div className="row g-3">
                  {[
                    { label: 'Heart Rate', value: `${report.heartRate} BPM`, icon: 'bi-heart-pulse', color: statusColor[report.status] },
                    { label: 'Status', value: report.status, icon: 'bi-shield-check', color: statusColor[report.status] },
                    { label: 'Frames Analyzed', value: `${report.framesAnalyzed || 'N/A'}`, icon: 'bi-camera-video', color: '#0B2D6F' },
                    { label: 'Signal Quality', value: `${report.signalQuality || 'N/A'}%`, icon: 'bi-wifi', color: '#0B2D6F' },
                    { label: 'Scan Date', value: new Date(report.createdAt).toLocaleDateString(), icon: 'bi-calendar3', color: '#0B2D6F' },
                    { label: 'Scan Time', value: new Date(report.createdAt).toLocaleTimeString(), icon: 'bi-clock', color: '#0B2D6F' },
                  ].map(d => (
                    <div className="col-6" key={d.label}>
                      <div style={{ padding: '12px 14px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <i className={`bi ${d.icon}`} style={{ color: d.color, fontSize: 13 }} />
                          <span style={{ fontSize: 11, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{d.label}</span>
                        </div>
                        <div style={{ fontFamily: 'Poppins', fontSize: 16, fontWeight: 700, color: d.color }}>{d.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Normal range reference */}
              <div className="hh-card animate-fadeInRight delay-2">
                <h6 style={{ fontFamily: 'Poppins', fontWeight: 700, marginBottom: 14 }}>
                  <i className="bi bi-bar-chart me-2" />Heart Rate Reference
                </h6>
                <div className="d-flex flex-column gap-2">
                  {[
                    { range: '60 - 100 BPM', label: 'Normal', badge: 'badge-normal', active: report.status === 'Normal' },
                    { range: '50-59 or 101-120 BPM', label: 'Warning', badge: 'badge-warning', active: report.status === 'Warning' },
                    { range: 'Below 50 or above 120 BPM', label: 'High Risk', badge: 'badge-danger', active: report.status === 'High Risk' },
                  ].map(r => (
                    <div key={r.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: r.active ? '#F0F9FF' : '#F8FAFC', borderRadius: 9, border: r.active ? '1.5px solid #BFDBFE' : '1px solid #E2E8F0' }}>
                      <span style={{ fontSize: 13, color: '#475569', fontWeight: r.active ? 600 : 400 }}>{r.range}</span>
                      <span className={`badge-hh ${r.badge}`}>{r.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="d-flex gap-2 animate-fadeInRight delay-3">
                <button className="btn-navy" onClick={() => navigate('/patient/scan')}>
                  <i className="bi bi-arrow-repeat" /> New Scan
                </button>
                <button className="btn-outline-navy" onClick={() => navigate('/patient/history')}>
                  <i className="bi bi-clock-history" /> View History
                </button>
                {report.status !== 'Normal' && (
                  <button className="btn-danger-hh" onClick={() => navigate('/patient/doctors')}>
                    <i className="bi bi-people" /> Consult Doctor
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