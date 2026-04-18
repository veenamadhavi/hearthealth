import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PatientNav = [
  { path: '/patient/dashboard', icon: 'bi-house', label: 'Dashboard' },
  { path: '/patient/scan', icon: 'bi-camera-video', label: 'Heart Scan' },
  { path: '/patient/history', icon: 'bi-graph-up', label: 'Health History' },
  { path: '/patient/doctors', icon: 'bi-people', label: 'Find Doctors' },
  { path: '/patient/consultations', icon: 'bi-chat-dots', label: 'Consultations' },
];

const DoctorNav = [
  { path: '/doctor/dashboard', icon: 'bi-house', label: 'Dashboard' },
  { path: '/doctor/consultations', icon: 'bi-clipboard-pulse', label: 'Consultations' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isDoc = user?.role === 'doctor';
  const navItems = isDoc ? DoctorNav : PatientNav;

  return (
    <div className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="d-flex align-items-center gap-2">
          <div className="sidebar-brand-logo">
            <i className="bi bi-heart-pulse-fill" style={{ color: '#0B2D6F', fontSize: 18 }} />
          </div>
          <div className="sidebar-brand-text">
            Heart<span>Health</span>
          </div>
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4, marginLeft: 50 }}>
          {isDoc ? 'Doctor Portal' : 'Patient Portal'}
        </div>
      </div>

      {/* Nav */}
      <div className="sidebar-section-label">Navigation</div>
      {navItems.map(item => (
        <div
          key={item.path}
          className={`sidebar-nav-item ${location.pathname === item.path ? 'active' : ''}`}
          onClick={() => navigate(item.path)}
        >
          <i className={`bi ${item.icon}`} />
          {item.label}
        </div>
      ))}

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
              {isDoc ? user?.specialization : `Age ${user?.age}`}
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          style={{
            width: '100%', padding: '9px', background: 'rgba(220,38,38,0.1)',
            border: '1px solid rgba(220,38,38,0.2)', borderRadius: 8,
            color: '#FCA5A5', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'DM Sans',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
          }}
        >
          <i className="bi bi-box-arrow-right" /> Logout
        </button>
      </div>
    </div>
  );
}