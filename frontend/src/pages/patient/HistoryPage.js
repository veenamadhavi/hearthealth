import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, AreaChart, Area
} from 'recharts';
import Sidebar from '../../components/Sidebar';
import { heartAPI } from '../../utils/api';

export default function HistoryPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    heartAPI.history()
      .then(r => setReports(r.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const chartData = reports
    .slice().reverse()
    .map((r, i) => ({
      index: i + 1,
      bpm: r.heartRate,
      date: new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      status: r.status
    }));

  const avg = reports.length ? Math.round(reports.reduce((s, r) => s + r.heartRate, 0) / reports.length) : 0;
  const max = reports.length ? Math.max(...reports.map(r => r.heartRate)) : 0;
  const min = reports.length ? Math.min(...reports.map(r => r.heartRate)) : 0;
  const normalCount = reports.filter(r => r.status === 'Normal').length;

  const statusColor = { Normal: '#10B981', Warning: '#F59E0B', 'High Risk': '#EF4444' };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px' }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{d.date}</p>
          <p style={{ fontSize: 20, fontWeight: 800, color: statusColor[d.status] }}>{d.bpm} BPM</p>
          <span className={`badge badge-${d.status === 'Normal' ? 'normal' : d.status === 'Warning' ? 'warning' : 'danger'}`} style={{ fontSize: 11, marginTop: 4 }}>
            {d.status}
          </span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Health History 📊</h1>
          <p className="page-subtitle">Your heart rate trends over time</p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
        ) : reports.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px 32px' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📊</div>
            <h3 style={{ marginBottom: 8 }}>No History Yet</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Take your first heart scan to start tracking</p>
            <button className="btn btn-primary" onClick={() => navigate('/patient/scan')}>Start First Scan</button>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="stats-grid" style={{ marginBottom: 28 }}>
              <div className="stat-card">
                <div className="stat-label">Total Scans</div>
                <div className="stat-value">{reports.length}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Average BPM</div>
                <div className="stat-value">{avg}</div>
                <div className="stat-sub">resting heart rate</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Range</div>
                <div className="stat-value" style={{ fontSize: 22 }}>{min}–{max}</div>
                <div className="stat-sub">BPM</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Normal Readings</div>
                <div className="stat-value" style={{ color: 'var(--success)' }}>
                  {reports.length ? Math.round(normalCount / reports.length * 100) : 0}%
                </div>
                <div className="stat-sub">{normalCount} of {reports.length}</div>
              </div>
            </div>

            {/* Chart */}
            <div className="card" style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, marginBottom: 24 }}>Heart Rate Trend</h3>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                  <defs>
                    <linearGradient id="bpmGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C41E3A" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#C41E3A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fill: '#4A5568', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[40, 130]} tick={{ fill: '#4A5568', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={100} stroke="#F59E0B" strokeDasharray="4 4" label={{ value: '100', fill: '#F59E0B', fontSize: 11, position: 'right' }} />
                  <ReferenceLine y={60} stroke="#3B82F6" strokeDasharray="4 4" label={{ value: '60', fill: '#3B82F6', fontSize: 11, position: 'right' }} />
                  <Area type="monotone" dataKey="bpm" stroke="#C41E3A" strokeWidth={2.5} fill="url(#bpmGrad)" dot={{ fill: '#E63950', r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: '#FF6B8A' }} />
                </AreaChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', gap: 20, marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 24, height: 2, background: '#F59E0B' }} /> Warning threshold (100 BPM)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 24, height: 2, background: '#3B82F6' }} /> Low threshold (60 BPM)
                </div>
              </div>
            </div>

            {/* Reports list */}
            <div className="card">
              <h3 style={{ fontSize: 16, marginBottom: 20 }}>All Readings</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {reports.map((r, i) => (
                  <div key={r._id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 16px',
                    background: i % 2 === 0 ? 'var(--bg-surface)' : 'transparent',
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                    transition: 'var(--transition)'
                  }}
                    onClick={() => navigate(`/patient/results/${r._id}`)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{
                        width: 44, height: 44,
                        borderRadius: '50%',
                        background: `${statusColor[r.status]}20`,
                        border: `2px solid ${statusColor[r.status]}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18, fontWeight: 800,
                        color: statusColor[r.status]
                      }}>{r.heartRate}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>{r.heartRate} BPM</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {new Date(r.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                    <span className={`badge badge-${r.status === 'Normal' ? 'normal' : r.status === 'Warning' ? 'warning' : 'danger'}`}>
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
