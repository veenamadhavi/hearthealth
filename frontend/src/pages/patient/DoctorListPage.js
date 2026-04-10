import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { doctorAPI, consultationAPI, heartAPI } from '../../utils/api';

export default function DoctorListPage() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [sending, setSending] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [latestReport, setLatestReport] = useState(null);

  useEffect(() => {
    Promise.all([doctorAPI.list(), heartAPI.latest()])
      .then(([docRes, repRes]) => {
        setDoctors(docRes.data);
        setLatestReport(repRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter ? doctors.filter(d => d.specialization === filter) : doctors;

  const sendRequest = async (doctorId) => {
    setSending(doctorId);
    setError('');
    try {
      await consultationAPI.create({
        doctorId,
        heartReportId: latestReport?._id,
        patientMessage: latestReport ? `Heart rate: ${latestReport.heartRate} BPM — Status: ${latestReport.status}` : ''
      });
      setSuccess(`Consultation request sent successfully!`);
      setTimeout(() => navigate('/patient/consultations'), 2500);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to send request');
    } finally {
      setSending(null);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Find Doctors 🩺</h1>
          <p className="page-subtitle">Connect with cardiologists and general physicians</p>
        </div>

        {success && (
          <div className="alert alert-success" style={{ marginBottom: 20 }}>
            ✅ {success} — Redirecting to consultations...
          </div>
        )}
        {error && <div className="alert alert-error">{error}</div>}

        {/* Latest report notice */}
        {latestReport && latestReport.status !== 'Normal' && (
          <div style={{
            padding: '16px 20px',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 12,
            marginBottom: 24,
            display: 'flex', alignItems: 'center', gap: 12
          }}>
            <span style={{ fontSize: 24 }}>⚠️</span>
            <div>
              <p style={{ fontWeight: 600, marginBottom: 4 }}>Abnormal Heart Rate Detected</p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Your latest reading is {latestReport.heartRate} BPM ({latestReport.status}). 
                We recommend consulting a doctor.
              </p>
            </div>
          </div>
        )}

        {/* Filter */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          {['', 'Cardiologist', 'General Physician'].map(f => (
            <button
              key={f}
              className={`btn ${filter === f ? 'btn-primary' : 'btn-outline'} btn-sm`}
              onClick={() => setFilter(f)}
            >
              {f || 'All Doctors'}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px 32px' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🩺</div>
            <h3 style={{ marginBottom: 8 }}>No Doctors Available</h3>
            <p style={{ color: 'var(--text-secondary)' }}>No doctors have registered yet</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {filtered.map(doc => (
              <div key={doc._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                  <div style={{
                    width: 60, height: 60,
                    background: 'linear-gradient(135deg, #1D4ED8, #3B82F6)',
                    borderRadius: 16,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 28, flexShrink: 0
                  }}>👨‍⚕️</div>
                  <div>
                    <h3 style={{ fontSize: 17, marginBottom: 4 }}>Dr. {doc.name}</h3>
                    <span className="badge badge-info">{doc.specialization}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                  {[
                    ['🎓', 'Qualification', doc.qualification],
                    ['⭐', 'Experience', `${doc.yearsOfExperience} years`],
                    ['📧', 'Contact', doc.email],
                  ].map(([icon, label, val]) => (
                    <div key={label} style={{ display: 'flex', gap: 10, fontSize: 13 }}>
                      <span>{icon}</span>
                      <span style={{ color: 'var(--text-muted)', minWidth: 90 }}>{label}:</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{val}</span>
                    </div>
                  ))}
                </div>

                <button
                  className="btn btn-primary btn-full"
                  onClick={() => sendRequest(doc._id)}
                  disabled={sending === doc._id}
                >
                  {sending === doc._id ? 'Sending...' : '💬 Request Consultation'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
