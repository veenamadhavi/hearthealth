import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function DoctorLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form.email, form.password, 'doctor');
      navigate('/doctor/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate-fadeInUp">

        {/* Top banner */}
        <div style={{
          background: '#0F2552',
          padding: '32px 34px 28px',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(56,189,248,0.15)',
            border: '1px solid rgba(56,189,248,0.25)',
            borderRadius: 20, padding: '5px 14px',
            marginBottom: 14
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#38BDF8'
            }} />
            <span style={{
              fontSize: 11, color: '#38BDF8',
              fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.12em'
            }}>Doctor Portal</span>
          </div>
          <h2 style={{
            fontSize: 22, fontWeight: 700,
            color: 'white',
            fontFamily: 'Poppins, sans-serif'
          }}>Welcome Back</h2>
          <p style={{
            fontSize: 13,
            color: 'rgba(255,255,255,0.5)',
            marginTop: 6
          }}>Sign in to your doctor dashboard</p>
        </div>

        <div className="auth-body">
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="doctor@hospital.com" required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="Enter your password" required />
            </div>
            <button className="btn btn-primary btn-full btn-lg"
              type="submit" disabled={loading}
              style={{ marginTop: 8 }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <div style={{
            borderTop: '1px solid var(--border)',
            marginTop: 22, paddingTop: 20, textAlign: 'center'
          }}>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 10 }}>
              New doctor?{' '}
              <Link to="/doctor/register" style={{
                color: 'var(--navy)', fontWeight: 700,
                textDecoration: 'none'
              }}>Register here</Link>
            </p>
            <Link to="/" style={{
              fontSize: 13, color: 'var(--text-muted)',
              textDecoration: 'none'
            }}>Back to home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}