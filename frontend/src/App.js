import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

// Pages
import LandingPage from './pages/LandingPage';
import PatientLogin from './pages/auth/PatientLogin';
import DoctorLogin from './pages/auth/DoctorLogin';
import PatientRegister from './pages/auth/PatientRegister';
import DoctorRegister from './pages/auth/DoctorRegister';
import PatientDashboard from './pages/patient/PatientDashboard';
import HeartScanPage from './pages/patient/HeartScanPage';
import ResultsPage from './pages/patient/ResultsPage';
import HistoryPage from './pages/patient/HistoryPage';
import DoctorListPage from './pages/patient/DoctorListPage';
import PatientChatPage from './pages/patient/PatientChatPage';
import PatientConsultations from './pages/patient/PatientConsultations';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorConsultations from './pages/doctor/DoctorConsultations';
import DoctorChatPage from './pages/doctor/DoctorChatPage';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={user.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'} replace /> : <LandingPage />} />
      <Route path="/patient/login" element={<PatientLogin />} />
      <Route path="/patient/register" element={<PatientRegister />} />
      <Route path="/doctor/login" element={<DoctorLogin />} />
      <Route path="/doctor/register" element={<DoctorRegister />} />

      {/* Patient Routes */}
      <Route path="/patient/dashboard" element={<ProtectedRoute role="patient"><PatientDashboard /></ProtectedRoute>} />
      <Route path="/patient/scan" element={<ProtectedRoute role="patient"><HeartScanPage /></ProtectedRoute>} />
      <Route path="/patient/results/:reportId" element={<ProtectedRoute role="patient"><ResultsPage /></ProtectedRoute>} />
      <Route path="/patient/history" element={<ProtectedRoute role="patient"><HistoryPage /></ProtectedRoute>} />
      <Route path="/patient/doctors" element={<ProtectedRoute role="patient"><DoctorListPage /></ProtectedRoute>} />
      <Route path="/patient/consultations" element={<ProtectedRoute role="patient"><PatientConsultations /></ProtectedRoute>} />
      <Route path="/patient/chat/:consultationId" element={<ProtectedRoute role="patient"><PatientChatPage /></ProtectedRoute>} />

      {/* Doctor Routes */}
      <Route path="/doctor/dashboard" element={<ProtectedRoute role="doctor"><DoctorDashboard /></ProtectedRoute>} />
      <Route path="/doctor/consultations" element={<ProtectedRoute role="doctor"><DoctorConsultations /></ProtectedRoute>} />
      <Route path="/doctor/chat/:consultationId" element={<ProtectedRoute role="doctor"><DoctorChatPage /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
