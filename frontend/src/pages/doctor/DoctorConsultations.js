import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { consultationAPI } from '../../utils/api';

export default function DoctorConsultations() {
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    consultationAPI.getDoctorConsultations().then(r => setConsultations(r.data || [])).finally(() => setLoading(false));
  }, []);

  const respond = async (id, status) => {
    try {
      await consultationAPI.respond(id, { status });
      setConsultations(prev => prev.map(c => c._id === id ? { ...c, status } : c));
    } catch (err) { console.error(err); }
  };

  const statusColor = { Normal: '#059669', Warning: '#D97706', 'High Risk': '#DC2626' };
  const statusBadge = { pending: 'badge-pending', accepted: 'badge-accepted', rejected: 'badge-rejected' };
  const filtered = filter === 'All' ? consultations : consultations.filter(c => c.status === filter.toLowerCase());

  if (loading) return <div className="loading-screen"><div className="spinner-hh" /></div>;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">

        <div className="page-header-hh animate-fadeInUp">
          <div className="d-flex align-items-center gap-3">
            <div style={{ width: 44, height: 44, background: '#059669', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="bi bi-clipboard-pulse-fill" style={{ color: 'white', fontSize: 20 }} />
            </div>
            <div>
              <h2 className="page-title-hh">Consultations</h2>
              <p className="page-subtitle-hh">Manage patient consultation requests</p>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="d-flex gap-2 mb-4 flex-wrap animate-fadeInUp delay-1">
          {['All', 'Pending', 'Accepted', 'Rejected'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '8px 20px', borderRadius: 24, fontSize: 13, fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'DM Sans',
              border: filter === f ? 'none' : '1.5px solid #E2E8F0',
              background: filter === f ? '#059669' : 'white',
              color: filter === f ? 'white' : '#64748B',
              boxShadow: filter === f ? '0 4px 12px rgba(5,150,105,0.2)' : 'none'
            }}>
              {f} ({f === 'All' ? consultations.length : consultations.filter(c => c.status === f.toLowerCase()).length})
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="hh-card text-center py-5 animate-scaleIn">
            <i className="bi bi-inbox" style={{ fontSize: 48, color: '#CBD5E1' }} />
            <h5 style={{ fontFamily: 'Poppins', marginTop: 16, color: '#64748B' }}>No consultations</h5>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {filtered.map((c, i) => (
              <div key={c._id} className="hh-card animate-fadeInUp" style={{ animationDelay: `${i * 0.08}s`, opacity: 0, borderLeft: `4px solid ${c.status === 'pending' ? '#D97706' : c.status === 'accepted' ? '#059669' : '#DC2626'}` }}>
                <div className="row align-items-center g-3">
                  <div className="col-md-5">
                    <div className="d-flex align-items-center gap-3">
                      <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#0B2D6F', fontFamily: 'Poppins', border: '2px solid #BFDBFE', flexShrink: 0 }}>
                        {c.patient?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h6 style={{ fontFamily: 'Poppins', fontWeight: 700, margin: 0 }}>{c.patient?.name}</h6>
                        <p style={{ fontSize: 12, color: '#64748B', margin: '2px 0 4px' }}>
                          Age {c.patient?.age} &bull; {c.patient?.occupation}
                        </p>
                        <div className="d-flex align-items-center gap-2">
                          <span className={`badge-hh ${statusBadge[c.status]}`}>{c.status}</span>
                          <span style={{ fontSize: 11, color: '#94A3B8' }}>{new Date(c.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {c.heartReport && (
                    <div className="col-md-4">
                      <div style={{ padding: '10px 14px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                        <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Heart Report</div>
                        <div style={{ fontFamily: 'Poppins', fontSize: 20, fontWeight: 800, color: statusColor[c.heartReport.status] }}>{c.heartReport.heartRate} BPM</div>
                        <span className={`badge-hh badge-${c.heartReport.status === 'Normal' ? 'normal' : c.heartReport.status === 'Warning' ? 'warning' : 'danger'}`} style={{ fontSize: 11 }}>{c.heartReport.status}</span>
                      </div>
                    </div>
                  )}
                  <div className="col-md-3 text-md-end">
                    {c.status === 'pending' && (
                      <div className="d-flex flex-column gap-2">
                        <button className="btn-success-hh btn-full btn-sm-hh" onClick={() => respond(c._id, 'accepted')}>
                          <i className="bi bi-check-circle me-1" /> Accept
                        </button>
                        <button className="btn-danger-hh btn-full btn-sm-hh" onClick={() => respond(c._id, 'rejected')}>
                          <i className="bi bi-x-circle me-1" /> Decline
                        </button>
                      </div>
                    )}
                    {c.status === 'accepted' && (
                      <button className="btn-navy btn-sm-hh" onClick={() => navigate(`/doctor/chat/${c._id}`)}>
                        <i className="bi bi-chat-fill me-1" /> Open Chat
                      </button>
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