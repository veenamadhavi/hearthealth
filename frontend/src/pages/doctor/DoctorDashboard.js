import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import { consultationAPI } from '../../utils/api';
import { connectSocket } from '../../utils/socket';

export default function DoctorDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [pending, setPending] = useState([]);
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([consultationAPI.pending(), consultationAPI.doctorAll()])
      .then(([pRes, aRes]) => {
        setPending(pRes.data);
        setAll(aRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    const socket = connectSocket(token);
    socket.on('new_consultation_request', (req) => {
      setPending(prev => [req, ...prev]);
      setAll(prev => [req, ...prev]);
    });
    return () => socket.off('new_consultation_request');
  }, [token]);

  const respond = async (id, status) => {
    try {
      const updated = await consultationAPI.respond(id, { status });
      setPending(prev => prev.filter(c => c._id !== id));
      setAll(prev => prev.map(c => c._id === id ? updated.data : c));
    } catch (e) {
      console.error(e);
    }
  };

  const accepted = all.filter(c => c.status === 'accepted');
  const statusColor = { Normal: '#10B981', Warning: '#F59E0B', 'High Risk': '#EF4444' };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Welcome, Dr. {user?.name?.split(' ')[0]} 🩺</h1>
          <p className="page-subtitle">{user?.specialization} · {user?.qualification} · {user?.yearsOfExperience} years experience</p>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ marginBottom: 32 }}>
          <div className="stat-card" style={{ borderColor: 'rgba(245,158,11,0.3)' }}>
            <div className="stat-label">Pending Requests</div>
            <div className="stat-value" style={{ color: 'var(--warning)' }}>{pending.length}</div>
          </div>
          <div className="stat-card" style={{ borderColor: 'rgba(16,185,129,0.3)' }}>
            <div className="stat-label">Active Chats</div>
            <div className="stat-value" style={{ color: 'var(--success)' }}>{accepted.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Patients</div>
            <div className="stat-value">{all.length}</div>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
        ) : (
          <>
            {/* Pending Requests */}
            <div className="card" style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, marginBottom: 20 }}>
                Pending Consultation Requests
                {pending.length > 0 && (
                  <span style={{
                    marginLeft: 10, background: 'var(--warning)', color: '#000',
                    borderRadius: 12, padding: '2px 8px', fontSize: 12, fontWeight: 700
                  }}>{pending.length}</span>
                )}
              </h3>

              {pending.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  No pending requests
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {pending.map(c => (
                    <div key={c._id} style={{
                      padding: '20px',
                      background: 'var(--bg-surface)',
                      borderRadius: 12,
                      border: '1px solid var(--border)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                        <div>
                          <h4 style={{ fontSize: 16, marginBottom: 4 }}>{c.patient?.name}</h4>
                          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                            Age {c.patient?.age} · {c.patient?.occupation}
                          </p>
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {new Date(c.createdAt).toLocaleString()}
                        </span>
                      </div>

                      {c.heartReport && (
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '12px 16px',
                          background: `${statusColor[c.heartReport.status]}10`,
                          border: `1px solid ${statusColor[c.heartReport.status]}30`,
                          borderRadius: 10, marginBottom: 14
                        }}>
                          <span style={{ fontSize: 20 }}>❤️</span>
                          <div>
                            <span style={{ fontWeight: 700, color: statusColor[c.heartReport.status] }}>
                              {c.heartReport.heartRate} BPM
                            </span>
                            <span className={`badge badge-${c.heartReport.status === 'Normal' ? 'normal' : c.heartReport.status === 'Warning' ? 'warning' : 'danger'}`} style={{ marginLeft: 10, fontSize: 11 }}>
                              {c.heartReport.status}
                            </span>
                          </div>
                          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 8 }}>
                            {c.heartReport.explanation}
                          </p>
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: 10 }}>
                        <button className="btn btn-success" style={{ flex: 1 }} onClick={() => respond(c._id, 'accepted')}>
                          ✓ Accept
                        </button>
                        <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => respond(c._id, 'rejected')}>
                          ✗ Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Active chats */}
            {accepted.length > 0 && (
              <div className="card">
                <h3 style={{ fontSize: 16, marginBottom: 20 }}>Active Consultations</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {accepted.map(c => (
                    <div key={c._id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '14px 16px',
                      background: 'var(--bg-surface)',
                      borderRadius: 10,
                      border: '1px solid var(--border)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: 10,
                          background: 'linear-gradient(135deg, var(--crimson), var(--crimson-light))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
                        }}>🧑‍💼</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 15 }}>{c.patient?.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            {c.heartReport ? `${c.heartReport.heartRate} BPM · ${c.heartReport.status}` : 'No report'}
                          </div>
                        </div>
                      </div>
                      <button className="btn btn-primary btn-sm" onClick={() => navigate(`/doctor/chat/${c._id}`)}>
                        💬 Open Chat
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
