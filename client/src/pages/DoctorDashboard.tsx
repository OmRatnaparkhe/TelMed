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

const DoctorDashboard: React.FC = () => {
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([]);
  const [todaysAppointments, setTodaysAppointments] = useState<Appointment[]>([]);
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

      // Fetch pending appointments
      const pendingRes = await api.get('/api/appointments/pending');
      setPendingAppointments(pendingRes.data);

      // For today's confirmed appointments, we'd ideally have a separate endpoint or filter more robustly.
      // For now, let's assume a simple filter on all confirmed for today.
      // This part might need refinement depending on backend capabilities.
      const todaysConfirmedRes = await api.get('/api/appointments/today-confirmed');
      setTodaysAppointments(todaysConfirmedRes.data);

      // Set default availability (could be replaced with an endpoint in future)
      setIsAvailable(true);

    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch data');
      console.error(err);
    } finally {
      setLoading(false);
    }
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

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Loading dashboard...</p></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600"><p>{error}</p></div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-6">Doctor Dashboard</h1>

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-800">Your Availability</h2>
          <label htmlFor="availability-toggle" className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                id="availability-toggle"
                className="sr-only"
                checked={isAvailable}
                onChange={handleStatusToggle}
              />
              <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
              <div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition"></div>
            </div>
            <div className="ml-3 text-gray-700 font-medium">
              {isAvailable ? 'Available' : 'Not Available'}
            </div>
          </label>
        </div>

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Pending Appointment Requests</h2>
        {pendingAppointments.length === 0 ? (
          <p className="text-gray-600">No pending appointment requests.</p>
        ) : (
          <ul className="space-y-4">
            {pendingAppointments.map((appointment) => (
              <li key={appointment.id} className="bg-yellow-50 p-4 rounded-md shadow-sm border border-yellow-200">
                <p className="text-lg font-medium text-yellow-800">Patient: {appointment.patient.user.firstName} {appointment.patient.user.lastName}</p>
                <p className="text-gray-700">Time: {new Date(appointment.appointmentTime).toLocaleString()}</p>
                <p className="text-gray-700">Symptoms: {appointment.symptoms}</p>
                <div className="mt-3 space-x-2">
                  <button
                    onClick={() => handleAppointmentAction(appointment.id, 'approve')}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleAppointmentAction(appointment.id, 'reject')}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300"
                  >
                    Reject
                  </button>
                  <Link
                    to={`/consultation/${appointment.id}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300 inline-block ml-2"
                  >
                    Start Consultation
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}

        <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Today's Confirmed Appointments</h2>
        {todaysAppointments.length === 0 ? (
          <p className="text-gray-600">No confirmed appointments for today.</p>
        ) : (
          <ul className="space-y-4">
            {todaysAppointments.map((appointment) => (
              <li key={appointment.id} className="bg-blue-50 p-4 rounded-md shadow-sm border border-blue-200">
                <p className="text-lg font-medium text-blue-800">Patient: {appointment.patient.user.firstName} {appointment.patient.user.lastName}</p>
                <p className="text-gray-700">Time: {new Date(appointment.appointmentTime).toLocaleTimeString()}</p>
                <p className="text-gray-700">Symptoms: {appointment.symptoms}</p>
                <Link
                  to={`/consultation/${appointment.id}`}
                  className="mt-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300 inline-block"
                >
                  Start Consultation
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
