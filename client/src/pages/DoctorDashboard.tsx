import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { useNavigate, Link } from 'react-router-dom';

interface Appointment {
  id: string;
  appointmentTime: string;
  symptoms: string;
  status: string;
  patient: { user: { firstName: string; lastName: string; phone: string; email: string } };
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

const DoctorDashboard: React.FC = () => {
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([]);
  const [todaysAppointments, setTodaysAppointments] = useState<Appointment[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [history, setHistory] = useState<Appointment[]>([]);
  const [historyStatus, setHistoryStatus] = useState<string>('');
  const [historyLimit, setHistoryLimit] = useState<number>(20);
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchAppointmentsAndStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Fetch current user (for greeting)
      const userRes = await api.get('/api/auth/me');
      setUser(userRes.data);

      // Fetch pending appointments
      const pendingRes = await api.get('/api/appointments/pending');
      setPendingAppointments(pendingRes.data);

      // For today's confirmed appointments, we'd ideally have a separate endpoint or filter more robustly.
      // For now, let's assume a simple filter on all confirmed for today.
      // This part might need refinement depending on backend capabilities.
      const todaysConfirmedRes = await api.get('/api/appointments/today-confirmed');
      setTodaysAppointments(todaysConfirmedRes.data);

      // Initial fetch for appointment history with default filters
      await fetchHistory();

      // Set default availability (could be replaced with an endpoint in future)
      setIsAvailable(true);

    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    const params: any = {};
    if (historyStatus) params.status = historyStatus;
    if (historyLimit) params.limit = historyLimit;
    const historyRes = await api.get('/api/appointments/history', { params });
    setHistory(historyRes.data);
  };

  useEffect(() => {
    fetchAppointmentsAndStatus();
  }, [navigate]);

  const handleStatusToggle = async () => {
    const newStatus = !isAvailable;
    try {
      await api.put('/api/doctors/me/status', { isAvailable: newStatus });
      setIsAvailable(newStatus);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update availability');
      console.error(err);
    }
  };

  const handleAppointmentAction = async (appointmentId: string, action: 'approve' | 'reject') => {
    try {
      await api.put(`/api/appointments/${appointmentId}/${action}`);
      alert(`Appointment ${action}d successfully!`);
      fetchAppointmentsAndStatus(); // Refresh data
    } catch (err: any) {
      setError(err.response?.data?.error || `Failed to ${action} appointment`);
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CONFIRMED': return 'bg-green-100 text-green-800 border-green-200';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const cardStat = (label: string, value: number, icon: React.ReactNode, colorClasses: { bg: string; text: string; iconBg: string }) => (
    <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-200`}>
      <div className="flex items-center">
        <div className={`${colorClasses.iconBg} p-3 rounded-lg`}>
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className={`text-2xl font-bold ${colorClasses.text}`}>{value}</p>
        </div>
      </div>

      {/* Appointment History */}
      <div className="mt-10 bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between flex-wrap gap-4">
          <h2 className="text-xl font-bold text-gray-900">Appointment History</h2>
          <div className="flex items-center gap-3">
            <select
              value={historyStatus}
              onChange={(e) => setHistoryStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              title="Filter by status"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <input
              type="number"
              min={1}
              max={100}
              value={historyLimit}
              onChange={(e) => setHistoryLimit(Math.max(1, Math.min(100, Number(e.target.value))))}
              className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm"
              title="Limit"
            />
            <button
              onClick={fetchHistory}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-300"
            >
              Apply
            </button>
          </div>
        </div>
        <div className="p-6">
          {history.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🗂️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No history records</h3>
              <p className="text-gray-600">Adjust filters to view more records</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((appointment) => (
                <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-300">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {appointment.patient.user.firstName} {appointment.patient.user.lastName}
                        </h3>
                        <span className={`ml-3 px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">
                        <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        {new Date(appointment.appointmentTime).toLocaleString()}
                      </p>
                      <p className="text-gray-700">
                        <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                        {appointment.symptoms}
                      </p>
                    </div>
                    <div className="mt-3 space-x-2 flex-shrink-0">
                      <Link to={`/consultation/${appointment.id}`} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300 inline-block">Open</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-secondary-50 to-info-50">
      <div className="text-center animate-fade-in">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600 mx-auto mb-6"></div>
        <p className="text-secondary-600 text-xl font-medium">Loading your dashboard...</p>
        <p className="text-secondary-400 text-sm mt-2">Please wait while we prepare your medical data</p>
      </div>
    </div>
  );
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent-50 to-warning-50 p-4">
      <div className="text-center bg-white p-8 rounded-2xl shadow-strong max-w-md w-full animate-slide-up">
        <div className="text-accent-500 text-6xl mb-6 animate-bounce-gentle">⚠️</div>
        <h2 className="text-2xl font-bold text-secondary-900 mb-4">Oops! Something went wrong</h2>
        <p className="text-accent-600 text-lg mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="bg-accent-600 hover:bg-accent-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-medium">Try Again</button>
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
              <div className="bg-gradient-to-br from-info-500 to-info-600 p-3 rounded-2xl mr-4 shadow-medium">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900">Doctor Dashboard</h1>
                <p className="text-secondary-600 text-sm sm:text-base">Welcome back, Dr. {user?.lastName}! 👨‍⚕️</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center">
                <label htmlFor="availability-toggle" className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input type="checkbox" id="availability-toggle" className="sr-only" checked={isAvailable} onChange={handleStatusToggle} />
                    <div className={`block w-16 h-9 rounded-full transition-colors duration-300 ${isAvailable ? 'bg-primary-500' : 'bg-secondary-400'}`}></div>
                    <div className={`absolute top-1 left-1 bg-white w-7 h-7 rounded-full transition-transform duration-300 ${isAvailable ? 'translate-x-7' : 'translate-x-0'}`}></div>
                  </div>
                  <div className="ml-4 text-secondary-700 font-semibold">
                    {isAvailable ? 'Available' : 'Not Available'}
                  </div>
                </label>
              </div>
              <button onClick={handleLogout} className="bg-accent-100 hover:bg-accent-200 text-accent-700 px-4 py-2 rounded-xl transition-all duration-300 flex items-center font-medium shadow-soft hover:shadow-medium transform hover:scale-105">
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
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {cardStat('Pending Requests', pendingAppointments.length,
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
            { bg: 'bg-yellow-100', text: 'text-gray-900', iconBg: 'bg-yellow-100' })}
          {cardStat("Today's Confirmed", todaysAppointments.length,
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
            { bg: 'bg-green-100', text: 'text-gray-900', iconBg: 'bg-green-100' })}
          {cardStat('Total Today', pendingAppointments.length + todaysAppointments.length,
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
            { bg: 'bg-blue-100', text: 'text-gray-900', iconBg: 'bg-blue-100' })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pending Requests */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Pending Appointment Requests</h2>
                </div>
              </div>
              <div className="p-6">
                {pendingAppointments.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">📥</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No pending requests</h3>
                    <p className="text-gray-600">You're all caught up!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingAppointments.map((appointment) => (
                      <div key={appointment.id} className="border border-yellow-200 bg-yellow-50 rounded-lg p-4 hover:shadow-md transition duration-300">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {appointment.patient.user.firstName} {appointment.patient.user.lastName}
                              </h3>
                            </div>
                            <p className="text-gray-700 mb-2">
                              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                              {new Date(appointment.appointmentTime).toLocaleString()}
                            </p>
                            <p className="text-gray-700">
                              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                              {appointment.symptoms}
                            </p>
                          </div>
                          <div className="mt-3 space-x-2 flex-shrink-0">
                            <button onClick={() => handleAppointmentAction(appointment.id, 'approve')} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300">Approve</button>
                            <button onClick={() => handleAppointmentAction(appointment.id, 'reject')} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300">Reject</button>
                            <Link to={`/consultation/${appointment.id}`} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300 inline-block ml-2">Start Consultation</Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button onClick={handleStatusToggle} className="w-full p-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition duration-300 text-indigo-700 font-medium">Toggle Availability</button>
              </div>
            </div>
          </div>
        </div>

        {/* History */}
        <div className="mt-10 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Appointment History</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <label className="text-gray-700 font-medium">Status:</label>
                <select value={historyStatus} onChange={(e) => setHistoryStatus(e.target.value)} className="ml-2 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="ALL">All</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              <div className="flex items-center">
                <label className="text-gray-700 font-medium">Limit:</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={historyLimit}
                  onChange={(e) => setHistoryLimit(Math.max(1, Math.min(100, Number(e.target.value))))}
                  className="ml-2 w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
          <div className="p-6">
            {history.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🗂️</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No history records</h3>
                <p className="text-gray-600">Adjust filters to view more records</p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((appointment) => (
                  <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-300">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {appointment.patient.user.firstName} {appointment.patient.user.lastName}
                          </h3>
                          <span className={`ml-3 px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">
                          <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          {new Date(appointment.appointmentTime).toLocaleString()}
                        </p>
                        <p className="text-gray-700">
                          <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                          {appointment.symptoms}
                        </p>
                      </div>
                      <div className="mt-3 space-x-2 flex-shrink-0">
                        <Link to={`/consultation/${appointment.id}`} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300 inline-block">Open</Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Today's Confirmed */}
        <div className="mt-10 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Today's Confirmed Appointments</h2>
          </div>
          <div className="p-6">
            {todaysAppointments.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📅</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No confirmed appointments today</h3>
                <p className="text-gray-600">Newly confirmed appointments will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todaysAppointments.map((appointment) => (
                  <div key={appointment.id} className="border border-blue-200 bg-blue-50 rounded-lg p-4 hover:shadow-md transition duration-300">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{appointment.patient.user.firstName} {appointment.patient.user.lastName}</h3>
                        <p className="text-gray-700 mb-2">
                          <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          {new Date(appointment.appointmentTime).toLocaleTimeString()}
                        </p>
                        <p className="text-gray-700">
                          <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                          {appointment.symptoms}
                        </p>
                      </div>
                      <Link to={`/consultation/${appointment.id}`} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300 inline-block ml-2">Start</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
