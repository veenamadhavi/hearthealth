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
    const fetchData = async () => {
      try {
        const [latestRes, historyRes] = await Promise.all([
          heartAPI.latest(),
          heartAPI.history()
        ]);
        setLatestReport(latestRes.data);
        setHistory(historyRes.data || []);
      } catch (e) { }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const statusColor = {
    Normal: '#059669',
    Warning: '#D97706',
    'High Risk': '#DC2626'
  };

  const statusBg = {
    Normal: 'rgba(5,150,105,0.08)',
    Warning: 'rgba(217,119,6,0.08)',
    'High Risk': 'rgba(220,38,38,0.08)'
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">

        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
          borderRadius: 16, padding: '24px 28px',
          marginBottom: 28, color: 'white'
        }}>
          <h1 style={{
            fontSize: 24, fontWeight: 700,
            fontFamily: 'Poppins, sans-serif',
            marginBottom: 6
          }}>
            Welcome, {user?.name?.split(' ')[0]}
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>
            Track your heart health and connect with specialists
          </p>
        </div>

        {/* Quick Actions */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 16, marginBottom: 24, maxWidth: 580
        }}>
          <div
            className="card"
            style={{
              cursor: 'pointer', textAlign: 'center',
              padding: '28px 20px',
              border: '1.5px solid rgba(37,99,235,0.2)',
              transition: 'all 0.2s'
            }}
            onClick={() => navigate('/patient/scan')}
          >
            <div style={{
              width: 52, height: 52,
              background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
              borderRadius: 14,
              display: 'flex', alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px', fontSize: 24
            }}>📷</div>
            <h3 style={{
              fontSize: 15, fontWeight: 700,
              marginBottom: 6, color: 'var(--text-primary)'
            }}>Check Heart Health</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
              Facial video scan
            </p>
            <button className="btn btn-primary btn-sm btn-full">
              Start Scan
            </button>
          </div>

          <div
            className="card"
            style={{
              cursor: 'pointer', textAlign: 'center',
              padding: '28px 20px',
              border: '1.5px solid rgba(8,145,178,0.2)',
              transition: 'all 0.2s'
            }}
            onClick={() => navigate('/patient/doctors')}
          >
            <div style={{
              width: 52, height: 52,
              background: 'linear-gradient(135deg, #ECFEFF, #CFFAFE)',
              borderRadius: 14,
              display: 'flex', alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px', fontSize: 24
            }}>🩺</div>
            <h3 style={{
              fontSize: 15, fontWeight: 700,
              marginBottom: 6, color: 'var(--text-primary)'
            }}>Consult Doctor</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
              Connect with cardiologists
            </p>
            <button className="btn btn-outline btn-sm btn-full">
              Find Doctors
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Scans</div>
            <div className="stat-value" style={{ color: 'var(--primary)' }}>
              {history.length}
            </div>
            <div className="stat-sub">scans done</div>
          </div>

          {latestReport && (
            <>
              <div className="stat-card" style={{
                borderColor: `${statusColor[latestReport.status]}30`
              }}>
                <div className="stat-label">Latest Heart Rate</div>
                <div className="stat-value" style={{
                  color: statusColor[latestReport.status]
                }}>
                  {latestReport.heartRate}
                </div>
                <div className="stat-sub">BPM</div>
              </div>

              <div className="stat-card">
                <div className="stat-label">Status</div>
                <div className="stat-value" style={{
                  fontSize: 20,
                  color: statusColor[latestReport.status]
                }}>
                  {latestReport.status}
                </div>
                <div className="stat-sub">last reading</div>
              </div>
            </>
          )}

          <div className="stat-card">
            <div className="stat-label">Age</div>
            <div className="stat-value">{user?.age}</div>
            <div className="stat-sub">{user?.occupation}</div>
          </div>
        </div>

        {/* Latest Report */}
        {latestReport && (
          <div className="card card-accent" style={{ marginBottom: 20 }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 18
            }}>
              <h3 style={{ fontSize: 16, color: 'var(--text-primary)' }}>
                Latest Heart Report
              </h3>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => navigate('/patient/history')}
              >
                View History
              </button>
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', gap: 20,
              padding: '16px',
              background: statusBg[latestReport.status],
              borderRadius: 12,
              border: `1px solid ${statusColor[latestReport.status]}20`
            }}>
              <div style={{
                width: 72, height: 72,
                background: 'white',
                border: `2.5px solid ${statusColor[latestReport.status]}`,
                borderRadius: '50%',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexShrink: 0,
                boxShadow: `0 4px 16px ${statusColor[latestReport.status]}25`
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: 20, fontWeight: 800,
                    color: statusColor[latestReport.status],
                    fontFamily: 'Poppins, sans-serif',
                    lineHeight: 1
                  }}>{latestReport.heartRate}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600 }}>BPM</div>
                </div>
              </div>

              <div>
                <span className={`badge badge-${latestReport.status === 'Normal' ? 'normal' : latestReport.status === 'Warning' ? 'warning' : 'danger'}`}
                  style={{ marginBottom: 8, display: 'inline-flex' }}>
                  {latestReport.status}
                </span>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {latestReport.explanation}
                </p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                  {new Date(latestReport.createdAt).toLocaleDateString('en-US', {
                    month: 'long', day: 'numeric', year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {latestReport.status !== 'Normal' && (
              <div style={{
                marginTop: 14, padding: '12px 16px',
                background: 'rgba(220,38,38,0.05)',
                borderRadius: 10,
                border: '1px solid rgba(220,38,38,0.15)',
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', gap: 12
              }}>
                <p style={{ fontSize: 13, color: '#B91C1C', fontWeight: 500 }}>
                  Your heart rate is abnormal. Consider consulting a doctor.
                </p>
                <button
                  className="btn btn-danger btn-sm"
                  style={{ flexShrink: 0 }}
                  onClick={() => navigate('/patient/doctors')}
                >
                  Consult Doctor
                </button>
              </div>
            )}
          </div>
        )}

        {/* Recent History */}
        {history.length > 0 && (
          <div className="card">
            <h3 style={{ fontSize: 16, marginBottom: 18, color: 'var(--text-primary)' }}>
              Recent Readings
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {history.slice(0, 5).map(r => (
                <div key={r._id} style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: 'var(--bg-surface)',
                  borderRadius: 10,
                  border: '1px solid var(--border)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: '50%',
                      background: `${statusColor[r.status]}15`,
                      border: `2px solid ${statusColor[r.status]}`,
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 13, fontWeight: 700,
                      color: statusColor[r.status],
                      fontFamily: 'Poppins, sans-serif'
                    }}>
                      {r.heartRate}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>
                        {r.heartRate} BPM
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {new Date(r.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <span className={`badge badge-${r.status === 'Normal' ? 'normal' : r.status === 'Warning' ? 'warning' : 'danger'}`}>
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No scans yet */}
        {!loading && history.length === 0 && (
          <div className="card" style={{
            textAlign: 'center', padding: '52px 32px'
          }}>
            <div style={{
              width: 72, height: 72,
              background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
              borderRadius: 20,
              display: 'flex', alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px', fontSize: 32
            }}>📷</div>
            <h3 style={{ marginBottom: 8, fontSize: 18 }}>No Heart Scans Yet</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 14 }}>
              Take your first scan using facial video analysis
            </p>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/patient/scan')}
            >
              Start First Scan
            </button>
          </div>
        )}

      </div>
    </div>
  );
}