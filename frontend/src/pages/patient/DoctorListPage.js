import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { doctorAPI, consultationAPI, heartAPI } from '../../utils/api';

export default function DoctorListPage() {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(null);
  const [latestReport, setLatestReport] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([doctorAPI.list(), heartAPI.latest()])
      .then(([dr, lr]) => {
        setDoctors(dr.data || []);
        setLatestReport(lr.data || null);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const requestConsultation = async (doctorId) => {
    if (!latestReport) {
      setError(
        'Please complete a heart scan before requesting consultation.'
      );
      return;
    }

    setRequesting(doctorId);
    setError('');
    setSuccess('');

    try {
      await consultationAPI.create({
        doctorId,
        heartReportId: latestReport._id,
      });

      setSuccess('Consultation request sent successfully!');

      setTimeout(() => {
        navigate('/patient/consultations');
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Request failed. Please try again.'
      );
    } finally {
      setRequesting(null);
    }
  };

  const filtered =
    filter === 'All'
      ? doctors
      : doctors.filter(
          (d) => d.specialization === filter
        );

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner-hh" />
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-content">
        <div className="page-header-hh animate-fadeInUp">
          <div className="d-flex align-items-center gap-3">
            <div
              style={{
                width: 44,
                height: 44,
                background: '#0B2D6F',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <i
                className="bi bi-people-fill"
                style={{
                  color: '#00B4D8',
                  fontSize: 20,
                }}
              />
            </div>

            <div>
              <h2 className="page-title-hh">
                Find Doctors
              </h2>

              <p className="page-subtitle-hh">
                {doctors.length} specialist
                {doctors.length !== 1
                  ? 's'
                  : ''}{' '}
                available for consultation
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert-hh alert-error-hh d-flex align-items-center gap-2 mb-4 animate-slideInDown">
            <i className="bi bi-exclamation-circle-fill" />
            {error}
          </div>
        )}

        {success && (
          <div className="alert-hh alert-success-hh d-flex align-items-center gap-2 mb-4 animate-slideInDown">
            <i className="bi bi-check-circle-fill" />
            {success}
          </div>
        )}

        {!latestReport && (
          <div className="alert-hh alert-warning-hh d-flex align-items-center justify-content-between gap-3 mb-4 animate-fadeInUp">
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-exclamation-triangle-fill" />
              <span style={{ fontSize: 14 }}>
                You need a heart scan before
                requesting consultation.
              </span>
            </div>

            <button
              className="btn-navy btn-sm-hh"
              onClick={() =>
                navigate('/patient/scan')
              }
            >
              Scan Now
            </button>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="d-flex gap-2 mb-4 flex-wrap animate-fadeInUp delay-1">
          {[
            'All',
            'Cardiologist',
            'General Physician',
          ].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 20px',
                borderRadius: 24,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontFamily: 'DM Sans',
                border:
                  filter === f
                    ? 'none'
                    : '1.5px solid #E2E8F0',
                background:
                  filter === f
                    ? '#0B2D6F'
                    : 'white',
                color:
                  filter === f
                    ? 'white'
                    : '#64748B',
                boxShadow:
                  filter === f
                    ? '0 4px 12px rgba(11,45,111,0.2)'
                    : 'none',
              }}
            >
              {f}
              <span
                style={{
                  marginLeft: 6,
                  fontSize: 11,
                }}
              >
                (
                {f === 'All'
                  ? doctors.length
                  : doctors.filter(
                      (d) =>
                        d.specialization === f
                    ).length}
                )
              </span>
            </button>
          ))}
        </div>

        {/* Doctors Grid */}
        <div className="row g-4">
          {filtered.map((doc, i) => (
            <div
              className="col-md-6 col-lg-4"
              key={doc._id}
            >
              <div
                className="hh-card animate-fadeInUp"
                style={{
                  animationDelay: `${i * 0.1}s`,
                  opacity: 0,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div
                  style={{
                    height: 4,
                    background:
                      doc.specialization ===
                      'Cardiologist'
                        ? 'linear-gradient(90deg, #0B2D6F, #00B4D8)'
                        : 'linear-gradient(90deg, #059669, #10B981)',
                    marginTop: -24,
                    marginLeft: -24,
                    marginRight: -24,
                    marginBottom: 20,
                    borderRadius:
                      '12px 12px 0 0',
                  }}
                />

                <div className="d-flex align-items-center gap-3 mb-3">
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: '50%',
                      background:
                        doc.specialization ===
                        'Cardiologist'
                          ? '#EFF6FF'
                          : '#F0FDF4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent:
                        'center',
                      fontSize: 20,
                      fontWeight: 800,
                      fontFamily:
                        'Poppins',
                      color:
                        doc.specialization ===
                        'Cardiologist'
                          ? '#0B2D6F'
                          : '#059669',
                    }}
                  >
                    {doc.name
                      ?.charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <h6
                      style={{
                        fontFamily:
                          'Poppins',
                        fontWeight: 700,
                        margin: 0,
                      }}
                    >
                      Dr. {doc.name}
                    </h6>

                    <span className="badge-hh badge-info">
                      {
                        doc.specialization
                      }
                    </span>
                  </div>
                </div>

                <div className="d-flex flex-column gap-2 mb-4 flex-grow-1">
                  <div>
                    <strong>
                      Qualification:
                    </strong>{' '}
                    {doc.qualification}
                  </div>

                  <div>
                    <strong>
                      Experience:
                    </strong>{' '}
                    {
                      doc.yearsOfExperience
                    }{' '}
                    years
                  </div>

                  <div>
                    <strong>Email:</strong>{' '}
                    {doc.email}
                  </div>
                </div>

                <button
                  className="btn-navy btn-full"
                  disabled={
                    !latestReport ||
                    requesting === doc._id
                  }
                  onClick={() =>
                    requestConsultation(
                      doc._id
                    )
                  }
                  style={{
                    background:
                      doc.specialization ===
                      'Cardiologist'
                        ? '#0B2D6F'
                        : '#059669',
                  }}
                >
                  {requesting ===
                  doc._id ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-chat-dots" />{' '}
                      Request
                      Consultation
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="hh-card text-center py-5 animate-scaleIn">
            <i
              className="bi bi-people"
              style={{
                fontSize: 48,
                color: '#CBD5E1',
              }}
            />

            <h5
              style={{
                fontFamily:
                  'Poppins',
                marginTop: 16,
                color: '#64748B',
              }}
            >
              No doctors found
            </h5>
          </div>
        )}
      </div>
    </div>
  );
}