import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { Link, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

interface Appointment {
  id: string;
  appointmentTime: string;
  symptoms: string;
  status: string;
  doctor: { user: { firstName: string; lastName: string } };
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

const PatientDashboard: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Fetch user data
        const userResponse = await api.get('/api/auth/me');
        setUser(userResponse.data);

        // Fetch appointments
        const appointmentsResponse = await api.get('/api/appointments/my-appointments');
        setAppointments(appointmentsResponse.data);

      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-warning-100 text-warning-800 border-warning-200';
      case 'CONFIRMED': return 'bg-primary-100 text-primary-800 border-primary-200';
      case 'COMPLETED': return 'bg-info-100 text-info-800 border-info-200';
      case 'CANCELLED': return 'bg-accent-100 text-accent-800 border-accent-200';
      default: return 'bg-secondary-100 text-secondary-800 border-secondary-200';
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-secondary-50 to-info-50">
      <div className="text-center animate-fade-in">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600 mx-auto mb-6"></div>
        <p className="text-secondary-600 text-xl font-medium">Loading your dashboard...</p>
        <p className="text-secondary-400 text-sm mt-2">Please wait while we prepare your health data</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent-50 to-warning-50 p-4">
      <div className="text-center bg-white p-8 rounded-2xl shadow-strong max-w-md w-full animate-slide-up">
        <div className="text-accent-500 text-6xl mb-6 animate-bounce-gentle">⚠️</div>
        <h2 className="text-2xl font-bold text-secondary-900 mb-4">Oops! Something went wrong</h2>
        <p className="text-accent-600 text-lg mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-accent-600 hover:bg-accent-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-medium"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-info-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-soft border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 gap-4">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-3 rounded-2xl mr-4 shadow-medium">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900">TelMed Dashboard</h1>
                <p className="text-secondary-600 text-sm sm:text-base">Welcome back, {user?.firstName}! 👋</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowQR(!showQR)}
                className="bg-info-100 hover:bg-info-200 text-info-700 px-4 py-2 rounded-xl transition-all duration-300 flex items-center font-medium shadow-soft hover:shadow-medium transform hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                My QR Code
              </button>
              <button
                onClick={handleLogout}
                className="bg-accent-100 hover:bg-accent-200 text-accent-700 px-4 py-2 rounded-xl transition-all duration-300 flex items-center font-medium shadow-soft hover:shadow-medium transform hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* QR Code Modal */}
        {showQR && user && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-strong max-w-md w-full animate-slide-up">
              <div className="text-center">
                <div className="bg-gradient-to-br from-primary-100 to-info-100 p-4 rounded-2xl mb-6">
                  <h3 className="text-2xl font-bold text-secondary-900 mb-2">Your Patient QR Code</h3>
                  <p className="text-secondary-600">Show this QR code to healthcare providers for quick identification</p>
                </div>
                <div className="flex justify-center mb-6 p-4 bg-secondary-50 rounded-xl">
                  <QRCodeSVG value={user.id} size={200} level="H" includeMargin={true} />
                </div>
                <button
                  onClick={() => setShowQR(false)}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-soft border border-secondary-200 hover:shadow-medium transition-all duration-300 animate-fade-in">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-info-100 to-info-200 p-4 rounded-2xl">
                <svg className="w-7 h-7 text-info-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-secondary-600 uppercase tracking-wide">Total Appointments</p>
                <p className="text-3xl font-bold text-secondary-900">{appointments.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-soft border border-secondary-200 hover:shadow-medium transition-all duration-300 animate-fade-in">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-primary-100 to-primary-200 p-4 rounded-2xl">
                <svg className="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-secondary-600 uppercase tracking-wide">Confirmed</p>
                <p className="text-3xl font-bold text-secondary-900">{appointments.filter(apt => apt.status === 'CONFIRMED').length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-soft border border-secondary-200 hover:shadow-medium transition-all duration-300 animate-fade-in">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-warning-100 to-warning-200 p-4 rounded-2xl">
                <svg className="w-7 h-7 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-secondary-600 uppercase tracking-wide">Pending</p>
                <p className="text-3xl font-bold text-secondary-900">{appointments.filter(apt => apt.status === 'PENDING').length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-soft border border-secondary-200 hover:shadow-medium transition-all duration-300 animate-fade-in">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-secondary-100 to-secondary-200 p-4 rounded-2xl">
                <svg className="w-7 h-7 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-secondary-600 uppercase tracking-wide">Completed</p>
                <p className="text-3xl font-bold text-secondary-900">{appointments.filter(apt => apt.status === 'COMPLETED').length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Appointments Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-soft border border-secondary-200 overflow-hidden">
              <div className="p-6 border-b border-secondary-200 bg-gradient-to-r from-primary-50 to-info-50">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <h2 className="text-2xl font-bold text-secondary-900">Your Appointments</h2>
                  <Link
                    to="/book-appointment"
                    className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center shadow-medium hover:shadow-strong transform hover:scale-105"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Book New Appointment
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {appointments.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-6 animate-bounce-gentle">📅</div>
                    <h3 className="text-2xl font-bold text-secondary-900 mb-3">No appointments yet</h3>
                    <p className="text-secondary-600 mb-8 text-lg">Book your first appointment to get started with healthcare services</p>
                    <Link
                      to="/book-appointment"
                      className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 inline-flex items-center shadow-medium hover:shadow-strong transform hover:scale-105"
                    >
                      <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Book Your First Appointment
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointments.map((appointment, index) => (
                      <div key={appointment.id} className="border border-secondary-200 rounded-2xl p-6 hover:shadow-medium transition-all duration-300 bg-gradient-to-r from-white to-secondary-50/30 animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center mb-3 gap-2">
                              <h3 className="text-xl font-bold text-secondary-900">
                                Dr. {appointment.doctor.user.firstName} {appointment.doctor.user.lastName}
                              </h3>
                              <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(appointment.status)}`}>
                                {appointment.status}
                              </span>
                            </div>
                            <div className="space-y-2">
                              <p className="text-secondary-600 flex items-center">
                                <svg className="w-5 h-5 mr-3 text-info-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {new Date(appointment.appointmentTime).toLocaleString()}
                              </p>
                              <p className="text-secondary-700 flex items-start">
                                <svg className="w-5 h-5 mr-3 text-warning-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 6.291A7.962 7.962 0 0012 5c-2.34 0-4.29 1.009-5.824 2.709" />
                                </svg>
                                <span className="font-medium">{appointment.symptoms}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-soft border border-secondary-200 p-6">
              <h3 className="text-xl font-bold text-secondary-900 mb-6">Quick Actions</h3>
              <div className="space-y-4">
                <Link
                  to="/symptom-checker"
                  className="flex items-center p-4 bg-gradient-to-r from-primary-50 to-primary-100 hover:from-primary-100 hover:to-primary-200 rounded-2xl transition-all duration-300 group shadow-soft hover:shadow-medium transform hover:scale-105"
                >
                  <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-3 rounded-2xl mr-4 group-hover:from-primary-600 group-hover:to-primary-700 transition-all duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-secondary-900 text-lg">AI Symptom Checker</p>
                    <p className="text-sm text-secondary-600">Get instant health insights</p>
                  </div>
                </Link>

                <Link
                  to="/medical-history"
                  className="flex items-center p-4 bg-gradient-to-r from-info-50 to-info-100 hover:from-info-100 hover:to-info-200 rounded-2xl transition-all duration-300 group shadow-soft hover:shadow-medium transform hover:scale-105"
                >
                  <div className="bg-gradient-to-br from-info-500 to-info-600 p-3 rounded-2xl mr-4 group-hover:from-info-600 group-hover:to-info-700 transition-all duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-secondary-900 text-lg">Medical History</p>
                    <p className="text-sm text-secondary-600">View your records</p>
                  </div>
                </Link>

                <Link
                  to="/pharmacy-locator"
                  className="flex items-center p-4 bg-gradient-to-r from-warning-50 to-warning-100 hover:from-warning-100 hover:to-warning-200 rounded-2xl transition-all duration-300 group shadow-soft hover:shadow-medium transform hover:scale-105"
                >
                  <div className="bg-gradient-to-br from-warning-500 to-warning-600 p-3 rounded-2xl mr-4 group-hover:from-warning-600 group-hover:to-warning-700 transition-all duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-secondary-900 text-lg">Find Pharmacy</p>
                    <p className="text-sm text-secondary-600">Locate nearby pharmacies</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-gradient-to-br from-accent-50 to-accent-100 border border-accent-200 rounded-2xl p-6 shadow-soft">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-br from-accent-500 to-accent-600 p-3 rounded-2xl mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-accent-900">Emergency Contact</h3>
              </div>
              <p className="text-accent-700 text-sm mb-4">In case of medical emergency, call:</p>
              <p className="text-accent-900 font-bold text-3xl">911</p>
              <p className="text-accent-600 text-xs mt-2">Available 24/7 for immediate assistance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
