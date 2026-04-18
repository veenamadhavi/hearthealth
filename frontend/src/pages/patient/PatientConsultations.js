import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { consultationAPI } from '../../utils/api';
import { getSocket } from '../../utils/socket';

export default function PatientConsultations() {
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    consultationAPI.getMyConsultations().then(r => setConsultations(r.data || [])).finally(() => setLoading(false));
    const socket = getSocket();
    if (socket) {
      socket.on('consultation_response', (data) => {
        setConsultations(prev => prev.map(c => c._id === data.consultationId ? { ...c, status: data.status } : c));
      });
    }
    return () => { if (socket) socket.off('consultation_response'); };
  }, []);

  const statusBadge = { pending: 'badge-pending', accepted: 'badge-accepted', rejected: 'badge-rejected' };
  const statusColor = { pending: '#D97706', accepted: '#059669', rejected: '#DC2626' };
  const statusIcon = { pending: 'bi-clock', accepted: 'bi-check-circle-fill', rejected: 'bi-x-circle-fill' };

  const filtered = filter === 'All' ? consultations : consultations.filter(c => c.status === filter.toLowerCase());

  if (loading) return <div className="loading-screen"><div className="spinner-hh" /></div>;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">

        <div className="page-header-hh animate-fadeInUp">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div className="d-flex align-items-center gap-3">
              <div style={{ width: 44, height: 44, background: '#0B2D6F', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="bi bi-chat-dots-fill" style={{ color: '#00B4D8', fontSize: 20 }} />
              </div>
              <div>
                <h2 className="page-title-hh">My Consultations</h2>
                <p className="page-subtitle-hh">{consultations.length} total consultation request{consultations.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <button className="btn-navy btn-sm-hh" onClick={() => navigate('/patient/doctors')}>
              <i className="bi bi-plus-circle" /> New Consultation
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="d-flex gap-2 mb-4 flex-wrap animate-fadeInUp delay-1">
          {['All', 'Pending', 'Accepted', 'Rejected'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '8px 20px', borderRadius: 24, fontSize: 13, fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'DM Sans',
              border: filter === f ? 'none' : '1.5px solid #E2E8F0',
              background: filter === f ? '#0B2D6F' : 'white',
              color: filter === f ? 'white' : '#64748B',
              boxShadow: filter === f ? '0 4px 12px rgba(11,45,111,0.2)' : 'none'
            }}>
              {f}
              <span style={{ marginLeft: 6, fontSize: 11 }}>
                ({f === 'All' ? consultations.length : consultations.filter(c => c.status === f.toLowerCase()).length})
              </span>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="hh-card text-center py-5 animate-scaleIn">
            <i className="bi bi-chat-dots" style={{ fontSize: 48, color: '#CBD5E1' }} />
            <h5 style={{ fontFamily: 'Poppins', marginTop: 16, color: '#64748B' }}>No consultations yet</h5>
            <p style={{ color: '#94A3B8', fontSize: 14 }}>Request a consultation from the Find Doctors page</p>
            <button className="btn-navy mt-3" onClick={() => navigate('/patient/doctors')}>Find Doctors</button>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {filtered.map((c, i) => (
              <div key={c._id} className="hh-card animate-fadeInUp" style={{ animationDelay: `${i * 0.08}s`, opacity: 0, borderLeft: `4px solid ${statusColor[c.status]}` }}>
                <div className="row align-items-center g-3">
                  <div className="col-md-6">
                    <div className="d-flex align-items-center gap-3">
                      <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#0B2D6F', fontFamily: 'Poppins', border: '2px solid #BFDBFE', flexShrink: 0 }}>
                        {c.doctor?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h6 style={{ fontFamily: 'Poppins', fontWeight: 700, margin: 0 }}>Dr. {c.doctor?.name}</h6>
                        <p style={{ fontSize: 12, color: '#64748B', margin: '2px 0 4px' }}>{c.doctor?.specialization}</p>
                        <div className="d-flex align-items-center gap-2">
                          <span className={`badge-hh ${statusBadge[c.status]}`}>
                            <i className={`bi ${statusIcon[c.status]} me-1`} />{c.status}
                          </span>
                          <span style={{ fontSize: 11, color: '#94A3B8' }}>{new Date(c.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {c.heartReport && (
                    <div className="col-md-4">
                      <div style={{ padding: '10px 14px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                        <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Attached Report</div>
                        <div style={{ fontFamily: 'Poppins', fontSize: 18, fontWeight: 800, color: '#0B2D6F' }}>{c.heartReport.heartRate} BPM</div>
                        <span className={`badge-hh badge-${c.heartReport.status === 'Normal' ? 'normal' : c.heartReport.status === 'Warning' ? 'warning' : 'danger'}`} style={{ fontSize: 11 }}>{c.heartReport.status}</span>
                      </div>
                    </div>
                  )}
                  <div className="col-md-2 text-md-end">
                    {c.status === 'accepted' ? (
                      <button className="btn-navy btn-sm-hh" onClick={() => navigate(`/patient/chat/${c._id}`)}>
                        <i className="bi bi-chat-fill" /> Open Chat
                      </button>
                    ) : c.status === 'pending' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#D97706', animation: 'pulse-slow 1.5s infinite' }} />
                        <span style={{ fontSize: 12, color: '#D97706', fontWeight: 600 }}>Awaiting</span>
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, color: '#DC2626', fontWeight: 600 }}>Declined</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}