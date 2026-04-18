import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { consultationAPI } from '../../utils/api';

export default function DoctorConsultations() {
  const navigate = useNavigate();

  const [consultations, setConsultations] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [filter, setFilter] =
    useState('All');

  useEffect(() => {
    consultationAPI
      .getDoctorConsultations()
      .then((r) =>
        setConsultations(
          r.data || []
        )
      )
      .finally(() =>
        setLoading(false)
      );
  }, []);

  const respond = async (
    id,
    status
  ) => {
    try {
      await consultationAPI.respond(
        id,
        { status }
      );

      setConsultations(
        (prev) =>
          prev.map((c) =>
            c._id === id
              ? {
                  ...c,
                  status,
                }
              : c
          )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const statusColor = {
    Normal: '#0B2D6F',
    Warning: '#D97706',
    'High Risk': '#DC2626',
  };

  const filtered =
    filter === 'All'
      ? consultations
      : consultations.filter(
          (c) =>
            c.status ===
            filter.toLowerCase()
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

        {/* HEADER */}
        <div
          style={{
            background:
              'linear-gradient(135deg,#071D49,#0B2D6F)',
            borderRadius: 20,
            padding: 28,
            color: 'white',
            marginBottom: 24,
            boxShadow:
              '0 14px 30px rgba(11,45,111,0.20)',
          }}
        >
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">

            <div className="d-flex align-items-center gap-3">
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background:
                    'rgba(255,255,255,0.12)',
                  display:
                    'flex',
                  alignItems:
                    'center',
                  justifyContent:
                    'center',
                }}
              >
                <i
                  className="bi bi-clipboard2-pulse-fill"
                  style={{
                    fontSize: 22,
                    color:
                      'white',
                  }}
                />
              </div>

              <div>
                <h2
                  style={{
                    margin: 0,
                    fontWeight: 800,
                  }}
                >
                  Consultations
                </h2>

                <p
                  style={{
                    margin:
                      '4px 0 0',
                    opacity: 0.75,
                  }}
                >
                  Manage patient consultation requests
                </p>
              </div>
            </div>

            <div
              style={{
                background:
                  'rgba(255,255,255,0.12)',
                padding:
                  '14px 20px',
                borderRadius: 14,
                textAlign:
                  'center',
                minWidth: 120,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  opacity: 0.7,
                }}
              >
                Total
              </div>

              <div
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                }}
              >
                {
                  consultations.length
                }
              </div>
            </div>

          </div>
        </div>

        {/* FILTER */}
        <div className="d-flex gap-2 flex-wrap mb-4">
          {[
            'All',
            'Pending',
            'Accepted',
            'Rejected',
          ].map((f) => (
            <button
              key={f}
              onClick={() =>
                setFilter(f)
              }
              style={{
                padding:
                  '10px 18px',
                borderRadius: 24,
                fontSize: 13,
                fontWeight: 700,
                border:
                  filter === f
                    ? 'none'
                    : '1px solid #E2E8F0',
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
                    ? '0 10px 18px rgba(11,45,111,0.18)'
                    : 'none',
                cursor:
                  'pointer',
              }}
            >
              {f}{' '}
              (
              {f === 'All'
                ? consultations.length
                : consultations.filter(
                    (c) =>
                      c.status ===
                      f.toLowerCase()
                  ).length}
              )
            </button>
          ))}
        </div>

        {/* EMPTY */}
        {filtered.length ===
        0 ? (
          <div
            style={{
              background:
                'white',
              borderRadius: 18,
              padding: 50,
              textAlign:
                'center',
              boxShadow:
                '0 8px 20px rgba(0,0,0,0.05)',
            }}
          >
            <i
              className="bi bi-inbox"
              style={{
                fontSize: 42,
                color:
                  '#CBD5E1',
              }}
            />

            <h5
              style={{
                marginTop: 14,
                color:
                  '#64748B',
              }}
            >
              No consultations found
            </h5>
          </div>
        ) : (
          <div className="row g-4">
            {filtered.map(
              (c, i) => (
                <div
                  className="col-lg-6"
                  key={c._id}
                >
                  <div
                    style={{
                      background:
                        'white',
                      borderRadius: 20,
                      padding: 22,
                      boxShadow:
                        '0 10px 24px rgba(0,0,0,0.05)',
                      height:
                        '100%',
                      borderTop: `4px solid ${
                        c.status ===
                        'pending'
                          ? '#D97706'
                          : c.status ===
                            'accepted'
                          ? '#0B2D6F'
                          : '#DC2626'
                      }`,
                    }}
                  >

                    {/* TOP */}
                    <div className="d-flex justify-content-between align-items-start mb-3">

                      <div className="d-flex gap-3">

                        <div
                          style={{
                            width: 54,
                            height: 54,
                            borderRadius:
                              '50%',
                            background:
                              '#EFF6FF',
                            color:
                              '#0B2D6F',
                            display:
                              'flex',
                            alignItems:
                              'center',
                            justifyContent:
                              'center',
                            fontWeight: 800,
                            fontSize: 20,
                          }}
                        >
                          {c.patient?.name
                            ?.charAt(
                              0
                            )
                            .toUpperCase()}
                        </div>

                        <div>
                          <h5
                            style={{
                              margin:
                                '0 0 4px',
                              fontWeight: 700,
                            }}
                          >
                            {
                              c
                                .patient
                                ?.name
                            }
                          </h5>

                          <div
                            style={{
                              fontSize: 13,
                              color:
                                '#64748B',
                            }}
                          >
                            Age{' '}
                            {
                              c
                                .patient
                                ?.age
                            }{' '}
                            •{' '}
                            {
                              c
                                .patient
                                ?.occupation
                            }
                          </div>

                          <div
                            style={{
                              fontSize: 12,
                              color:
                                '#94A3B8',
                              marginTop: 4,
                            }}
                          >
                            {new Date(
                              c.createdAt
                            ).toLocaleDateString()}
                          </div>
                        </div>

                      </div>

                      <span
                        style={{
                          padding:
                            '6px 12px',
                          borderRadius: 30,
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform:
                            'uppercase',
                          background:
                            c.status ===
                            'pending'
                              ? '#FEF3C7'
                              : c.status ===
                                'accepted'
                              ? '#DBEAFE'
                              : '#FEE2E2',
                          color:
                            c.status ===
                            'pending'
                              ? '#92400E'
                              : c.status ===
                                'accepted'
                              ? '#1D4ED8'
                              : '#991B1B',
                        }}
                      >
                        {
                          c.status
                        }
                      </span>

                    </div>

                    {/* HEART REPORT */}
                    {c.heartReport && (
                      <div
                        style={{
                          background:
                            '#F8FAFC',
                          border:
                            '1px solid #E2E8F0',
                          borderRadius: 14,
                          padding: 16,
                          marginBottom: 18,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 11,
                            color:
                              '#94A3B8',
                            fontWeight: 700,
                            textTransform:
                              'uppercase',
                            marginBottom: 6,
                          }}
                        >
                          Heart Report
                        </div>

                        <div className="d-flex justify-content-between align-items-center">

                          <div
                            style={{
                              fontSize: 24,
                              fontWeight: 800,
                              color:
                                statusColor[
                                  c
                                    .heartReport
                                    .status
                                ],
                            }}
                          >
                            {
                              c
                                .heartReport
                                .heartRate
                            }{' '}
                            BPM
                          </div>

                          <span
                            style={{
                              padding:
                                '6px 12px',
                              borderRadius: 20,
                              fontSize: 11,
                              fontWeight: 700,
                              background:
                                '#EFF6FF',
                              color:
                                '#0B2D6F',
                            }}
                          >
                            {
                              c
                                .heartReport
                                .status
                            }
                          </span>

                        </div>
                      </div>
                    )}

                    {/* ACTIONS */}
                    <div className="d-flex gap-2">

                      {c.status ===
                        'pending' && (
                        <>
                          <button
                            onClick={() =>
                              respond(
                                c._id,
                                'accepted'
                              )
                            }
                            style={{
                              flex: 1,
                              padding:
                                '11px',
                              border:
                                'none',
                              borderRadius: 10,
                              background:
                                '#0B2D6F',
                              color:
                                'white',
                              fontWeight: 700,
                            }}
                          >
                            Accept
                          </button>

                          <button
                            onClick={() =>
                              respond(
                                c._id,
                                'rejected'
                              )
                            }
                            style={{
                              flex: 1,
                              padding:
                                '11px',
                              border:
                                'none',
                              borderRadius: 10,
                              background:
                                '#DC2626',
                              color:
                                'white',
                              fontWeight: 700,
                            }}
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {c.status ===
                        'accepted' && (
                        <button
                          onClick={() =>
                            navigate(
                              `/doctor/chat/${c._id}`
                            )
                          }
                          style={{
                            width:
                              '100%',
                            padding:
                              '11px',
                            border:
                              'none',
                            borderRadius: 10,
                            background:
                              '#0B2D6F',
                            color:
                              'white',
                            fontWeight: 700,
                          }}
                        >
                          Open Chat
                        </button>
                      )}

                    </div>

                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
