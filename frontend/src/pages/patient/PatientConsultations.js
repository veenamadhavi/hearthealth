import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { consultationAPI } from '../../utils/api';
import { connectSocket } from '../../utils/socket';
import { useAuth } from '../../context/AuthContext';

export default function PatientConsultations() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    consultationAPI.my()
      .then(r => setConsultations(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));

    const socket = connectSocket(token);
    socket.on('consultation_response', (updated) => {
      setConsultations(prev => prev.map(c => c._id === updated._id ? updated : c));
    });
    return () => socket.off('consultation_response');
  }, [token]);

  const statusBadge = (s) => {
    const map = { pending: 'pending', accepted: 'accepted', rejected: 'rejected', completed: 'normal' };
    return map[s] || 'info';
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">My Consultations 💬</h1>
          <p className="page-subtitle">Track your consultation requests</p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
        ) : consultations.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px 32px' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>💬</div>
            <h3 style={{ marginBottom: 8 }}>No Consultations Yet</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Request a consultation from the doctors list</p>
            <button className="btn btn-primary" onClick={() => navigate('/patient/doctors')}>Find Doctors</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 700 }}>
            {consultations.map(c => (
              <div key={c._id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontSize: 17, marginBottom: 4 }}>Dr. {c.doctor?.name}</h3>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{c.doctor?.specialization} · {c.doctor?.qualification}</p>
                  </div>
                  <span className={`badge badge-${statusBadge(c.status)}`} style={{ textTransform: 'capitalize' }}>
                    {c.status}
                  </span>
                </div>

                {c.heartReport && (
                  <div style={{
                    padding: '12px 16px',
                    background: 'var(--bg-surface)',
                    borderRadius: 10,
                    marginBottom: 14,
                    display: 'flex', gap: 12, alignItems: 'center'
                  }}>
                    <span style={{ fontSize: 20 }}>❤️</span>
                    <div>
                      <span style={{ fontWeight: 600 }}>{c.heartReport.heartRate} BPM</span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>({c.heartReport.status})</span>
                    </div>
                  </div>
                )}

                {c.status === 'pending' && (
                  <div className="alert alert-info">
                    ⏳ Consultation request sent. Waiting for doctor to accept.
                  </div>
                )}

                {c.status === 'rejected' && c.doctorNote && (
                  <div className="alert alert-error">
                    ❌ Rejected: {c.doctorNote}
                  </div>
                )}

                {c.status === 'accepted' && (
                  <button className="btn btn-primary btn-full" onClick={() => navigate(`/patient/chat/${c._id}`)}>
                    💬 Open Chat with Doctor
                  </button>
                )}

                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10 }}>
                  {new Date(c.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
