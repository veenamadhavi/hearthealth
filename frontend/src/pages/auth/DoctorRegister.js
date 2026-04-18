import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function DoctorRegister() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', qualification: '', yearsOfExperience: '', specialization: '' });
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
    <div className="auth-wrapper">
      <div className="auth-card" style={{ maxWidth: 480 }}>
        <div className="auth-card-header" style={{ background: '#065F46' }}>
          <div className="auth-role-badge" style={{ background: 'rgba(16,185,129,0.15)', borderColor: 'rgba(16,185,129,0.3)' }}>
            <div className="auth-role-dot" style={{ background: '#10B981', boxShadow: '0 0 8px #10B981' }} />
            <span style={{ fontSize: 11, color: '#10B981', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Doctor Portal</span>
          </div>
          <h2 style={{ fontFamily: 'Poppins', fontSize: 22, fontWeight: 700, color: 'white', margin: 0 }}>Create Account</h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: '6px 0 0' }}>Join our medical network</p>
        </div>
        <div className="auth-card-body">
          {error && <div className="alert-hh alert-error-hh d-flex align-items-center gap-2"><i className="bi bi-exclamation-circle-fill" />{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group-hh">
              <label className="form-label-hh">Full Name</label>
              <div style={{ position: 'relative' }}>
                <i className="bi bi-person" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: 15 }} />
                <input className="form-input-hh" style={{ paddingLeft: 40 }} name="name" value={form.name} onChange={handleChange} placeholder="Dr. Jane Smith" required />
              </div>
            </div>
            <div className="form-group-hh">
              <label className="form-label-hh">Email Address</label>
              <div style={{ position: 'relative' }}>
                <i className="bi bi-envelope" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: 15 }} />
                <input className="form-input-hh" style={{ paddingLeft: 40 }} type="email" name="email" value={form.email} onChange={handleChange} placeholder="doctor@hospital.com" required />
              </div>
            </div>
            <div className="form-group-hh">
              <label className="form-label-hh">Password</label>
              <div style={{ position: 'relative' }}>
                <i className="bi bi-lock" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: 15 }} />
                <input className="form-input-hh" style={{ paddingLeft: 40 }} type="password" name="password" value={form.password} onChange={handleChange} placeholder="Create a password" required />
              </div>
            </div>
            <div className="form-group-hh">
              <label className="form-label-hh">Qualification</label>
              <div style={{ position: 'relative' }}>
                <i className="bi bi-award" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: 15 }} />
                <input className="form-input-hh" style={{ paddingLeft: 40 }} name="qualification" value={form.qualification} onChange={handleChange} placeholder="MBBS, MD Cardiology" required />
              </div>
            </div>
            <div className="row g-3">
              <div className="col-6">
                <div className="form-group-hh">
                  <label className="form-label-hh">Experience (yrs)</label>
                  <input className="form-input-hh" type="number" name="yearsOfExperience" value={form.yearsOfExperience} onChange={handleChange} placeholder="10" required min="0" />
                </div>
              </div>
              <div className="col-6">
                <div className="form-group-hh">
                  <label className="form-label-hh">Specialization</label>
                  <select className="form-input-hh" name="specialization" value={form.specialization} onChange={handleChange} required>
                    <option value="">Select...</option>
                    <option value="Cardiologist">Cardiologist</option>
                    <option value="General Physician">General Physician</option>
                  </select>
                </div>
              </div>
            </div>
            <button className="btn-full btn-lg-hh" type="submit" disabled={loading} style={{ background: '#059669', color: 'white', border: 'none', borderRadius: 8, fontFamily: 'DM Sans', fontWeight: 600, cursor: 'pointer', marginTop: 8, padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {loading ? <><span className="spinner-border spinner-border-sm me-2" />Creating...</> : <><i className="bi bi-person-check" />Create Account</>}
            </button>
          </form>
          <div className="divider-hh">or</div>
          <div className="text-center">
            <p style={{ fontSize: 14, color: '#475569', marginBottom: 8 }}>Already registered? <Link to="/doctor/login" style={{ color: '#059669', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link></p>
            <Link to="/" style={{ fontSize: 13, color: '#94A3B8', textDecoration: 'none' }}><i className="bi bi-arrow-left me-1" />Back to home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}