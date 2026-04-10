import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PatientNav = [
  { path: '/patient/dashboard', icon: '🏠', label: 'Dashboard' },
  { path: '/patient/scan', icon: '📷', label: 'Heart Scan' },
  { path: '/patient/history', icon: '📊', label: 'Health History' },
  { path: '/patient/doctors', icon: '🩺', label: 'Find Doctors' },
  { path: '/patient/consultations', icon: '💬', label: 'Consultations' },
];

const DoctorNav = [
  { path: '/doctor/dashboard', icon: '🏠', label: 'Dashboard' },
  { path: '/doctor/consultations', icon: '📋', label: 'Consultations' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const navItems = user?.role === 'doctor' ? DoctorNav : PatientNav;
  const isDoc = user?.role === 'doctor';

  return (
    <div className="sidebar">

      {/* Logo */}
      <div className="sidebar-logo">
        <div style={{
          width: 38, height: 38,
          background: `linear-gradient(135deg, ${isDoc ? '#0891B2, #06B6D4' : '#2563EB, #3B82F6'})`,
          borderRadius: 10,
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 18
        }}>
          {isDoc ? '👨‍⚕️' : '🏥'}
        </div>
        <div>
          <div style={{
            fontSize: 14, fontWeight: 700,
            fontFamily: 'Poppins, sans-serif',
            color: 'var(--text-primary)'
          }}>
            Heart<span style={{ color: isDoc ? '#0891B2' : 'var(--primary)' }}>Health</span>
          </div>
          <div style={{
            fontSize: 11, color: 'var(--text-muted)',
            fontWeight: 500
          }}>
            {isDoc ? 'Doctor Portal' : 'Patient Portal'}
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', padding: '6px 12px', marginBottom: 4 }}>
        Menu
      </div>

      {navItems.map(item => (
        <div
          key={item.path}
          className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          onClick={() => navigate(item.path)}
          style={location.pathname === item.path ? {
            background: isDoc
              ? 'rgba(8,145,178,0.1)'
              : 'rgba(37,99,235,0.1)',
            color: isDoc ? '#0891B2' : 'var(--primary)',
            borderColor: isDoc
              ? 'rgba(8,145,178,0.2)'
              : 'rgba(37,99,235,0.2)'
          } : {}}
        >
          <span className="icon">{item.icon}</span>
          {item.label}
        </div>
      ))}

      {/* Footer */}
      <div className="sidebar-footer">
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: '12px 14px',
          marginBottom: 10
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10
          }}>
            <div style={{
              width: 36, height: 36,
              background: `linear-gradient(135deg, ${isDoc ? '#0891B2, #06B6D4' : '#2563EB, #3B82F6'})`,
              borderRadius: '50%',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center',
              color: 'white', fontSize: 14, fontWeight: 700,
              flexShrink: 0
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{
                fontSize: 13, fontWeight: 600,
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap', overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>{user?.name}</div>
              <div style={{
                fontSize: 11, color: 'var(--text-muted)'
              }}>
                {isDoc ? user?.specialization : `Age ${user?.age}`}
              </div>
            </div>
          </div>
        </div>

        <button
          className="btn btn-outline btn-full btn-sm"
          onClick={logout}
          style={{ color: 'var(--danger)', borderColor: 'rgba(220,38,38,0.2)' }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}