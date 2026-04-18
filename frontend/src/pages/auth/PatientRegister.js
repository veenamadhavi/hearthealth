import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function PatientRegister() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', age: '', occupation: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await register(form, 'patient');
      navigate('/patient/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ maxWidth: 480 }}>
        <div className="auth-card-header">
          <div className="auth-role-badge">
            <div className="auth-role-dot" />
            <span style={{ fontSize: 11, color: '#00B4D8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Patient Portal</span>
          </div>
          <h2 style={{ fontFamily: 'Poppins', fontSize: 22, fontWeight: 700, color: 'white', margin: 0 }}>Create Account</h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: '6px 0 0' }}>Fill in your details to get started</p>
        </div>
        <div className="auth-card-body">
          {error && <div className="alert-hh alert-error-hh d-flex align-items-center gap-2"><i className="bi bi-exclamation-circle-fill" />{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group-hh">
              <label className="form-label-hh">Full Name</label>
              <div style={{ position: 'relative' }}>
                <i className="bi bi-person" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: 15 }} />
                <input className="form-input-hh" style={{ paddingLeft: 40 }} name="name" value={form.name} onChange={handleChange} placeholder="John Doe" required />
              </div>
            </div>
            <div className="form-group-hh">
              <label className="form-label-hh">Email Address</label>
              <div style={{ position: 'relative' }}>
                <i className="bi bi-envelope" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: 15 }} />
                <input className="form-input-hh" style={{ paddingLeft: 40 }} type="email" name="email" value={form.email} onChange={handleChange} placeholder="john@example.com" required />
              </div>
            </div>
            <div className="form-group-hh">
              <label className="form-label-hh">Password</label>
              <div style={{ position: 'relative' }}>
                <i className="bi bi-lock" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: 15 }} />
                <input className="form-input-hh" style={{ paddingLeft: 40 }} type="password" name="password" value={form.password} onChange={handleChange} placeholder="Create a password" required />
              </div>
            </div>
            <div className="row g-3">
              <div className="col-6">
                <div className="form-group-hh">
                  <label className="form-label-hh">Age</label>
                  <input className="form-input-hh" type="number" name="age" value={form.age} onChange={handleChange} placeholder="25" required min="1" max="120" />
                </div>
              </div>
              <div className="col-6">
                <div className="form-group-hh">
                  <label className="form-label-hh">Occupation</label>
                  <input className="form-input-hh" name="occupation" value={form.occupation} onChange={handleChange} placeholder="Engineer" required />
                </div>
              </div>
            </div>
            <button className="btn-navy btn-full btn-lg-hh" type="submit" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? <><span className="spinner-border spinner-border-sm me-2" />Creating...</> : <><i className="bi bi-person-check" />Create Account</>}
            </button>
          </form>
          <div className="divider-hh">or</div>
          <div className="text-center">
            <p style={{ fontSize: 14, color: '#475569', marginBottom: 8 }}>Already have an account? <Link to="/patient/login" style={{ color: '#0B2D6F', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link></p>
            <Link to="/" style={{ fontSize: 13, color: '#94A3B8', textDecoration: 'none' }}><i className="bi bi-arrow-left me-1" />Back to home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}