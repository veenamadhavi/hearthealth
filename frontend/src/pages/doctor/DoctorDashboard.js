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
      if (socket)
        socket.off(
          'new_consultation_request'
        );
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
    Normal: '#10B981',
    Warning: '#F59E0B',
    'High Risk': '#EF4444',
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
        {/* Hero Section */}
        <div
          style={{
            background:
              'linear-gradient(135deg,#065F46,#10B981)',
            borderRadius: 18,
            padding: 28,
            color: 'white',
            marginBottom: 28,
            boxShadow:
              '0 12px 30px rgba(16,185,129,0.2)',
          }}
        >
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <p
                style={{
                  opacity: 0.8,
                  marginBottom: 8,
                  fontSize: 13,
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
                  fontWeight: 700,
                }}
              >
                Welcome, Dr.{' '}
                {
                  user?.name?.split(
                    ' '
                  )[0]
                }{' '}
                👨‍⚕️
              </h2>

              <p
                style={{
                  marginTop: 8,
                  opacity: 0.9,
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
                  '16px 22px',
                borderRadius: 14,
                textAlign:
                  'center',
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  opacity: 0.85,
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

        {/* Stats */}
        <div className="row g-3 mb-4">
          {[
            {
              label:
                'Pending Requests',
              value:
                pending.length,
              icon: '⏳',
              color:
                '#F59E0B',
            },
            {
              label:
                'Active Chats',
              value:
                accepted.length,
              icon: '💬',
              color:
                '#10B981',
            },
            {
              label:
                'Total Patients',
              value: all.length,
              icon: '👥',
              color:
                '#3B82F6',
            },
            {
              label:
                'Experience',
              value: `${user?.yearsOfExperience} yrs`,
              icon: '🏆',
              color:
                '#8B5CF6',
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
                  borderRadius: 16,
                  padding: 20,
                  boxShadow:
                    '0 8px 20px rgba(0,0,0,0.05)',
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
                      fontSize: 26,
                    }}
                  >
                    {item.icon}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pending Requests */}
        <div
          style={{
            background: 'white',
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
              fontWeight: 700,
            }}
          >
            Pending Requests
          </h4>

          {pending.length === 0 ? (
            <p
              style={{
                color:
                  '#64748B',
              }}
            >
              No pending
              consultations.
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
                        }}
                      >
                        ❤️{' '}
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
                      className="btn btn-success"
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

        {/* Active Consultations */}
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
                fontWeight: 700,
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
                    className="btn btn-primary"
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