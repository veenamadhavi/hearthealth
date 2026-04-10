import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { consultationAPI } from '../../utils/api';

export default function DoctorConsultations() {
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    consultationAPI.doctorAll()
      .then(r => setConsultations(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const respond = async (id, status) => {
    const updated = await consultationAPI.respond(id, { status });
    setConsultations(prev => prev.map(c => c._id === id ? updated.data : c));
  };

  const filtered = filter === 'all' ? consultations : consultations.filter(c => c.status === filter);
  const statusColor = { Normal: '#10B981', Warning: '#F59E0B', 'High Risk': '#EF4444' };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">All Consultations 📋</h1>
          <p className="page-subtitle">Manage patient consultation requests</p>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {['all', 'pending', 'accepted', 'rejected'].map(f => (
            <button
              key={f}
              className={`btn ${filter === f ? 'btn-primary' : 'btn-outline'} btn-sm`}
              onClick={() => setFilter(f)}
              style={{ textTransform: 'capitalize' }}
            >
              {f}
              <span style={{
                background: filter === f ? 'rgba(255,255,255,0.2)' : 'var(--bg-surface)',
                borderRadius: 10, padding: '1px 7px', fontSize: 11, marginLeft: 4
              }}>
                {(f === 'all' ? consultations : consultations.filter(c => c.status === f)).length}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px 32px' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
            <p style={{ color: 'var(--text-muted)' }}>No consultations in this category</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 750 }}>
            {filtered.map(c => (
              <div key={c._id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div>
                    <h3 style={{ fontSize: 17, marginBottom: 4 }}>{c.patient?.name}</h3>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      Age {c.patient?.age} · {c.patient?.occupation} · {c.patient?.email}
                    </p>
                  </div>
                  <span className={`badge badge-${c.status === 'pending' ? 'pending' : c.status === 'accepted' ? 'accepted' : c.status === 'rejected' ? 'rejected' : 'normal'}`} style={{ textTransform: 'capitalize' }}>
                    {c.status}
                  </span>
                </div>

                {c.heartReport && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '12px 16px',
                    background: `${statusColor[c.heartReport.status]}10`,
                    border: `1px solid ${statusColor[c.heartReport.status]}30`,
                    borderRadius: 10, marginBottom: 14
                  }}>
                    <span style={{ fontSize: 22 }}>❤️</span>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: 18, color: statusColor[c.heartReport.status] }}>
                        {c.heartReport.heartRate} BPM
                      </span>
                      <span className={`badge badge-${c.heartReport.status === 'Normal' ? 'normal' : c.heartReport.status === 'Warning' ? 'warning' : 'danger'}`} style={{ marginLeft: 10, fontSize: 11 }}>
                        {c.heartReport.status}
                      </span>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{c.heartReport.explanation}</p>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10 }}>
                  {c.status === 'pending' && (
                    <>
                      <button className="btn btn-success btn-sm" onClick={() => respond(c._id, 'accepted')}>✓ Accept</button>
                      <button className="btn btn-danger btn-sm" onClick={() => respond(c._id, 'rejected')}>✗ Reject</button>
                    </>
                  )}
                  {c.status === 'accepted' && (
                    <button className="btn btn-primary btn-sm" onClick={() => navigate(`/doctor/chat/${c._id}`)}>
                      💬 Open Chat
                    </button>
                  )}
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto', alignSelf: 'center' }}>
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
