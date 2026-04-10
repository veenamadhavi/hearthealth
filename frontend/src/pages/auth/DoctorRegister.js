import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function DoctorRegister() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    qualification: '', yearsOfExperience: '', specialization: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await register(form, 'doctor');
      navigate('/doctor/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate-fadeInUp">

        {/* Top banner */}
        <div style={{
          background: '#0F2552',
          padding: '28px 34px 24px',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(56,189,248,0.15)',
            border: '1px solid rgba(56,189,248,0.25)',
            borderRadius: 20, padding: '5px 14px',
            marginBottom: 12
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
          }}>Create Account</h2>
        </div>

        <div className="auth-body">
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" name="name"
                value={form.name} onChange={handleChange}
                placeholder="Dr. Jane Smith" required />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" name="email"
                value={form.email} onChange={handleChange}
                placeholder="doctor@hospital.com" required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" name="password"
                value={form.password} onChange={handleChange}
                placeholder="Create a password" required />
            </div>
            <div className="form-group">
              <label className="form-label">Qualification</label>
              <input className="form-input" name="qualification"
                value={form.qualification} onChange={handleChange}
                placeholder="MBBS, MD Cardiology" required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Experience (yrs)</label>
                <input className="form-input" type="number"
                  name="yearsOfExperience"
                  value={form.yearsOfExperience}
                  onChange={handleChange}
                  placeholder="10" required min="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Specialization</label>
                <select className="form-input" name="specialization"
                  value={form.specialization}
                  onChange={handleChange} required>
                  <option value="">Select...</option>
                  <option value="Cardiologist">Cardiologist</option>
                  <option value="General Physician">General Physician</option>
                </select>
              </div>
            </div>
            <button className="btn btn-primary btn-full btn-lg"
              type="submit" disabled={loading}
              style={{ marginTop: 8 }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <div style={{
            borderTop: '1px solid var(--border)',
            marginTop: 22, paddingTop: 20, textAlign: 'center'
          }}>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 10 }}>
              Already registered?{' '}
              <Link to="/doctor/login" style={{
                color: 'var(--navy)', fontWeight: 700,
                textDecoration: 'none'
              }}>Sign in</Link>
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