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
    Promise.all([
      consultationAPI.pending(),
      consultationAPI.doctorAll(),
    ])
      .then(([pRes, aRes]) => {
        setPending(pRes.data || []);
        setAll(aRes.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    const socket = connectSocket(token);

    if (socket) {
      socket.on(
        'new_consultation_request',
        (req) => {
          setPending((prev) => [
            req,
            ...prev,
          ]);

          setAll((prev) => [
            req,
            ...prev,
          ]);
        }
      );
    }

    return () => {
      if (socket) {
        socket.off(
          'new_consultation_request'
        );
      }
    };
  }, [token]);

  const respond = async (
    id,
    status
  ) => {
    try {
      const updated =
        await consultationAPI.respond(
          id,
          { status }
        );

      setPending((prev) =>
        prev.filter(
          (c) => c._id !== id
        )
      );

      setAll((prev) =>
        prev.map((c) =>
          c._id === id
            ? updated.data
            : c
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  const accepted = all.filter(
    (c) =>
      c.status === 'accepted'
  );

  const statusColor = {
    Normal: '#0B2D6F',
    Warning: '#F59E0B',
    'High Risk': '#DC2626',
  };

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

        {/* HERO */}
        <div
          style={{
            background:
              'linear-gradient(135deg,#071D49,#0B2D6F)',
            borderRadius: 20,
            padding: 30,
            color: 'white',
            marginBottom: 28,
            boxShadow:
              '0 14px 32px rgba(11,45,111,0.22)',
          }}
        >
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">

            <div>
              <p
                style={{
                  marginBottom: 8,
                  fontSize: 12,
                  opacity: 0.75,
                  textTransform:
                    'uppercase',
                  letterSpacing:
                    '0.08em',
                }}
              >
                Doctor Dashboard
              </p>

              <h2
                style={{
                  margin: 0,
                  fontWeight: 800,
                }}
              >
                Welcome, Dr.{' '}
                {
                  user?.name?.split(
                    ' '
                  )[0]
                }
              </h2>

              <p
                style={{
                  marginTop: 8,
                  opacity: 0.85,
                }}
              >
                {
                  user?.specialization
                }{' '}
                •{' '}
                {
                  user?.qualification
                }
              </p>
            </div>

            <div
              style={{
                background:
                  'rgba(255,255,255,0.12)',
                padding:
                  '16px 24px',
                borderRadius: 14,
                textAlign:
                  'center',
                minWidth: 130,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  opacity: 0.75,
                }}
              >
                Pending
              </div>

              <div
                style={{
                  fontSize: 34,
                  fontWeight: 800,
                }}
              >
                {pending.length}
              </div>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="row g-3 mb-4">
          {[
            {
              label:
                'Pending Requests',
              value:
                pending.length,
              icon:
                'bi-hourglass-split',
              color:
                '#F59E0B',
            },
            {
              label:
                'Active Chats',
              value:
                accepted.length,
              icon:
                'bi-chat-dots',
              color:
                '#0B2D6F',
            },
            {
              label:
                'Total Patients',
              value:
                all.length,
              icon:
                'bi-people',
              color:
                '#2563EB',
            },
            {
              label:
                'Experience',
              value: `${user?.yearsOfExperience} yrs`,
              icon:
                'bi-award',
              color:
                '#7C3AED',
            },
          ].map((item) => (
            <div
              className="col-md-6 col-lg-3"
              key={item.label}
            >
              <div
                style={{
                  background:
                    'white',
                  borderRadius: 18,
                  padding: 22,
                  boxShadow:
                    '0 10px 22px rgba(0,0,0,0.05)',
                  height:
                    '100%',
                }}
              >
                <div className="d-flex justify-content-between align-items-center">

                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        color:
                          '#64748B',
                      }}
                    >
                      {
                        item.label
                      }
                    </div>

                    <div
                      style={{
                        fontSize: 28,
                        fontWeight: 800,
                        color:
                          item.color,
                      }}
                    >
                      {
                        item.value
                      }
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: 24,
                      color:
                        item.color,
                    }}
                  >
                    <i
                      className={`bi ${item.icon}`}
                    />
                  </div>

                </div>
              </div>
            </div>
          ))}
        </div>

        {/* PENDING REQUESTS */}
        <div
          style={{
            background:
              'white',
            borderRadius: 18,
            padding: 24,
            marginBottom: 24,
            boxShadow:
              '0 8px 20px rgba(0,0,0,0.05)',
          }}
        >
          <h4
            style={{
              marginBottom: 20,
              fontWeight: 800,
              color:
                '#0F172A',
            }}
          >
            Pending Requests
          </h4>

          {pending.length ===
          0 ? (
            <p
              style={{
                color:
                  '#64748B',
                margin: 0,
              }}
            >
              No pending consultations.
            </p>
          ) : (
            pending.map((c) => (
              <div
                key={c._id}
                style={{
                  border:
                    '1px solid #E2E8F0',
                  borderRadius: 14,
                  padding: 18,
                  marginBottom: 14,
                }}
              >
                <div className="d-flex justify-content-between flex-wrap gap-3">

                  <div>
                    <h5
                      style={{
                        margin: 0,
                        fontWeight: 700,
                      }}
                    >
                      {
                        c.patient
                          ?.name
                      }
                    </h5>

                    <p
                      style={{
                        margin:
                          '6px 0',
                        color:
                          '#64748B',
                        fontSize: 14,
                      }}
                    >
                      Age{' '}
                      {
                        c.patient
                          ?.age
                      }{' '}
                      •{' '}
                      {
                        c.patient
                          ?.occupation
                      }
                    </p>

                    {c.heartReport && (
                      <div
                        style={{
                          color:
                            statusColor[
                              c
                                .heartReport
                                .status
                            ],
                          fontWeight: 700,
                          display:
                            'flex',
                          alignItems:
                            'center',
                          gap: 6,
                        }}
                      >
                        <i className="bi bi-heart-pulse-fill" />

                        {
                          c
                            .heartReport
                            .heartRate
                        }{' '}
                        BPM •{' '}
                        {
                          c
                            .heartReport
                            .status
                        }
                      </div>
                    )}
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      className="btn"
                      style={{
                        background:
                          '#0B2D6F',
                        color:
                          'white',
                        border:
                          'none',
                      }}
                      onClick={() =>
                        respond(
                          c._id,
                          'accepted'
                        )
                      }
                    >
                      Accept
                    </button>

                    <button
                      className="btn btn-danger"
                      onClick={() =>
                        respond(
                          c._id,
                          'rejected'
                        )
                      }
                    >
                      Reject
                    </button>
                  </div>

                </div>
              </div>
            ))
          )}
        </div>

        {/* ACTIVE CHATS */}
        {accepted.length >
          0 && (
          <div
            style={{
              background:
                'white',
              borderRadius: 18,
              padding: 24,
              boxShadow:
                '0 8px 20px rgba(0,0,0,0.05)',
            }}
          >
            <h4
              style={{
                marginBottom: 20,
                fontWeight: 800,
              }}
            >
              Active Chats
            </h4>

            {accepted.map(
              (c) => (
                <div
                  key={c._id}
                  style={{
                    border:
                      '1px solid #E2E8F0',
                    borderRadius: 14,
                    padding: 16,
                    marginBottom: 12,
                  }}
                  className="d-flex justify-content-between align-items-center"
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 700,
                      }}
                    >
                      {
                        c
                          .patient
                          ?.name
                      }
                    </div>

                    <div
                      style={{
                        fontSize: 13,
                        color:
                          '#64748B',
                      }}
                    >
                      {c.heartReport
                        ? `${c.heartReport.heartRate} BPM • ${c.heartReport.status}`
                        : 'No report'}
                    </div>
                  </div>

                  <button
                    className="btn"
                    style={{
                      background:
                        '#0B2D6F',
                      color:
                        'white',
                    }}
                    onClick={() =>
                      navigate(
                        `/doctor/chat/${c._id}`
                      )
                    }
                  >
                    Open Chat
                  </button>
                </div>
              )
            )}
          </div>
        )}

      </div>
    </div>
  );
}
