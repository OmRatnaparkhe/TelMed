import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import PharmacistDashboard from './pages/PharmacistDashboard';
import AdminDashboard from './pages/AdminDashboard';
import UnauthorizedPage from './pages/UnauthorizedPage';
import BookAppointment from './pages/BookAppointment';
import SymptomChecker from './pages/SymptomChecker';
import MedicalHistory from './pages/MedicalHistory';
import ConsultationPage from './pages/ConsultationPage';
import PharmacyLocator from './pages/PharmacyLocator';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import LandingPage from './pages/LandingPage';
import AdminUsers from './pages/AdminUsers';
import AdminReports from './pages/AdminReports';
import AdminSettings from './pages/AdminSettings';
import AdminDatabase from './pages/AdminDatabase';

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Protected routes for any authenticated user */}
          <Route element={<ProtectedRoute />}>
            <Route path="/patient" element={<PatientDashboard />} />
            <Route path="/book-appointment" element={<BookAppointment />} />
            <Route path="/symptom-checker" element={<SymptomChecker />} />
            <Route path="/medical-history" element={<MedicalHistory />} />
            <Route path="/pharmacy-locator" element={<PharmacyLocator />} />
          </Route>

          {/* Doctor-only routes */}
          <Route element={<ProtectedRoute allowedRoles={["DOCTOR"]} />}>
            <Route path="/doctor" element={<DoctorDashboard />} />
            <Route path="/consultation/:appointmentId" element={<ConsultationPage />} />
          </Route>

          {/* Pharmacist-only routes */}
          <Route element={<ProtectedRoute allowedRoles={["PHARMACIST"]} />}>
            <Route path="/pharmacist" element={<PharmacistDashboard />} />
          </Route>

          {/* Admin-only routes */}
          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/database" element={<AdminDatabase />} />
          </Route>

          {/* Catch-all for 404 - You might want a dedicated 404 page */}
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </BrowserRouter>
    </I18nextProvider>
  );
}

export default App;
