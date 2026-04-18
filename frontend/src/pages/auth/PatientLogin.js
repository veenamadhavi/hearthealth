import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function PatientLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form.email, form.password, 'patient');
      navigate('/patient/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">

        {/* Header */}
        <div className="auth-card-header">
          <div className="auth-role-badge">
            <div className="auth-role-dot" />
            <span style={{ fontSize: 11, color: '#00B4D8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              Patient Portal
            </span>
          </div>
          <h2 style={{ fontFamily: 'Poppins', fontSize: 24, fontWeight: 700, color: 'white', margin: 0 }}>
            Welcome Back
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: '6px 0 0' }}>
            Sign in to your patient account
          </p>
        </div>

        {/* Body */}
        <div className="auth-card-body">
          {error && (
            <div className="alert-hh alert-error-hh d-flex align-items-center gap-2">
              <i className="bi bi-exclamation-circle-fill" />
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-group-hh">
              <label className="form-label-hh">Email Address</label>
              <div style={{ position: 'relative' }}>
                <i className="bi bi-envelope" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: 15 }} />
                <input
                  className="form-input-hh"
                  style={{ paddingLeft: 40 }}
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>
            <div className="form-group-hh">
              <label className="form-label-hh">Password</label>
              <div style={{ position: 'relative' }}>
                <i className="bi bi-lock" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: 15 }} />
                <input
                  className="form-input-hh"
                  style={{ paddingLeft: 40 }}
                  type="password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>
            <button
              className="btn-navy btn-full btn-lg-hh"
              type="submit"
              disabled={loading}
              style={{ marginTop: 8 }}
            >
              {loading
                ? <><span className="spinner-border spinner-border-sm me-2" /> Signing in...</>
                : <><i className="bi bi-box-arrow-in-right" /> Sign In</>
              }
            </button>
          </form>

          <div className="divider-hh">or</div>

          <div className="text-center">
            <p style={{ fontSize: 14, color: '#475569', marginBottom: 8 }}>
              New patient?{' '}
              <Link to="/patient/register" style={{ color: '#0B2D6F', fontWeight: 700, textDecoration: 'none' }}>
                Create account
              </Link>
            </p>
            <Link to="/" style={{ fontSize: 13, color: '#94A3B8', textDecoration: 'none' }}>
              <i className="bi bi-arrow-left me-1" />Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}