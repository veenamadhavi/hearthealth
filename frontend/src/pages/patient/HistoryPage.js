import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { heartAPI } from '../../utils/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';

export default function HistoryPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    heartAPI.history().then(r => setHistory(r.data || [])).finally(() => setLoading(false));
  }, []);

  const statusColor = { Normal: '#059669', Warning: '#D97706', 'High Risk': '#DC2626' };
  const statusBadge = { Normal: 'badge-normal', Warning: 'badge-warning', 'High Risk': 'badge-danger' };

  const filtered = filter === 'All' ? history : history.filter(r => r.status === filter);
  const chartData = [...history].reverse().slice(-20).map(r => ({
    date: new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    bpm: r.heartRate, status: r.status
  }));

  const avg = history.length ? Math.round(history.reduce((s, r) => s + r.heartRate, 0) / history.length) : 0;
  const max = history.length ? Math.max(...history.map(r => r.heartRate)) : 0;
  const min = history.length ? Math.min(...history.map(r => r.heartRate)) : 0;
  const normalPct = history.length ? Math.round((history.filter(r => r.status === 'Normal').length / history.length) * 100) : 0;

  if (loading) return <div className="loading-screen"><div className="spinner-hh" /></div>;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">

        <div className="page-header-hh animate-fadeInUp">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div className="d-flex align-items-center gap-3">
              <div style={{ width: 44, height: 44, background: '#0B2D6F', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="bi bi-graph-up" style={{ color: '#00B4D8', fontSize: 20 }} />
              </div>
              <div>
                <h2 className="page-title-hh">Health History</h2>
                <p className="page-subtitle-hh">Your complete heart rate scan history</p>
              </div>
            </div>
            <button className="btn-navy btn-sm-hh" onClick={() => navigate('/patient/scan')}>
              <i className="bi bi-plus-circle" /> New Scan
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="row g-3 mb-4">
          {[
            { label: 'Total Scans', value: history.length, icon: 'bi-clipboard-pulse', color: '#0B2D6F' },
            { label: 'Average BPM', value: avg, icon: 'bi-heart-pulse', color: '#0B2D6F' },
            { label: 'Highest BPM', value: max, icon: 'bi-arrow-up-circle', color: '#DC2626' },
            { label: 'Normal Rate', value: `${normalPct}%`, icon: 'bi-shield-check', color: '#059669' },
          ].map((s, i) => (
            <div className="col-6 col-lg-3" key={s.label}>
              <div className={`stat-card animate-fadeInUp delay-${i + 1}`}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="stat-card-label">{s.label}</div>
                  <i className={`bi ${s.icon}`} style={{ color: s.color, fontSize: 18 }} />
                </div>
                <div className="stat-card-value" style={{ color: s.color }}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Chart */}
        {chartData.length > 1 && (
          <div className="hh-card mb-4 animate-fadeInUp delay-2">
            <h5 style={{ fontFamily: 'Poppins', fontWeight: 700, marginBottom: 20 }}>
              <i className="bi bi-activity me-2" style={{ color: '#0B2D6F' }} />Heart Rate Trend
            </h5>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <YAxis domain={[40, 140]} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <Tooltip contentStyle={{ background: '#0B2D6F', border: 'none', borderRadius: 10, color: 'white', fontSize: 13 }} />
                <ReferenceLine y={60} stroke="#059669" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: '60', fill: '#059669', fontSize: 11 }} />
                <ReferenceLine y={100} stroke="#D97706" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: '100', fill: '#D97706', fontSize: 11 }} />
                <Line type="monotone" dataKey="bpm" stroke="#0B2D6F" strokeWidth={2.5} dot={{ fill: '#00B4D8', r: 4, strokeWidth: 2, stroke: 'white' }} activeDot={{ r: 6, fill: '#0B2D6F' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Filter tabs */}
        <div className="hh-card animate-fadeInUp delay-3">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
            <h5 style={{ fontFamily: 'Poppins', fontWeight: 700, margin: 0 }}>All Readings</h5>
            <div className="d-flex gap-2 flex-wrap">
              {['All', 'Normal', 'Warning', 'High Risk'].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'DM Sans',
                  border: filter === f ? 'none' : '1.5px solid #E2E8F0',
                  background: filter === f ? '#0B2D6F' : 'transparent',
                  color: filter === f ? 'white' : '#64748B',
                }}>
                  {f} {f === 'All' ? `(${history.length})` : `(${history.filter(r => r.status === f).length})`}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-inbox" style={{ fontSize: 40, color: '#CBD5E1' }} />
              <p style={{ color: '#94A3B8', marginTop: 12 }}>No records found</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-2">
              {filtered.map((r, i) => (
                <div key={r._id}
                  className="animate-fadeInUp"
                  style={{
                    animationDelay: `${i * 0.05}s`, opacity: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 16px', background: '#F8FAFC',
                    borderRadius: 10, border: '1px solid #E2E8F0',
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#EFF6FF'; e.currentTarget.style.borderColor = '#BFDBFE'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#E2E8F0'; }}
                  onClick={() => navigate(`/patient/results/${r._id}`)}
                >
                  <div className="d-flex align-items-center gap-3">
                    <div style={{
                      width: 48, height: 48, borderRadius: '50%',
                      border: `2.5px solid ${statusColor[r.status]}`,
                      background: `${statusColor[r.status]}12`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'Poppins', fontSize: 14, fontWeight: 800,
                      color: statusColor[r.status]
                    }}>{r.heartRate}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#0F172A' }}>{r.heartRate} BPM</div>
                      <div style={{ fontSize: 12, color: '#64748B' }}>
                        <i className="bi bi-calendar3 me-1" />
                        {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        <span className="mx-2">·</span>
                        {new Date(r.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span className={`badge-hh ${statusBadge[r.status]}`}>{r.status}</span>
                    <i className="bi bi-chevron-right" style={{ color: '#CBD5E1', fontSize: 12 }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}