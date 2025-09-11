import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { Link, useNavigate } from 'react-router-dom';
import {QRCodeSVG} from 'qrcode.react'; // Import QRCode

interface Appointment {
  id: string;
  appointmentTime: string;
  symptoms: string;
  doctor: { user: { firstName: string; lastName: string } };
}

const PatientDashboard: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patientUserId, setPatientUserId] = useState<string | null>(null); // State to store patient's user ID
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Fetch user data to get the patient's userId
        const userResponse = await api.get('http://localhost:4000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPatientUserId(userResponse.data.id);

        // Fetch appointments
        const appointmentsResponse = await api.get('http://localhost:4000/api/appointments/my-appointments', {
          headers: { Authorization: `Bearer ${token}` },
        });
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

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Loading dashboard...</p></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600"><p>{error}</p></div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-6">Welcome to Your Patient Dashboard</h1>

        {/* QR Code Section */}
        {patientUserId && (
          <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">Your Patient QR Code</h2>
            <p className="text-gray-600 mb-4">Scan this QR code to quickly identify yourself.</p>
            <div className="flex justify-center">
              <QRCodeSVG value={patientUserId} size={256} level="H" includeMargin={true} />
            </div>
          </div>
        )}

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Upcoming Appointments</h2>
        {appointments.length === 0 ? (
          <p className="text-gray-600">No upcoming appointments. Time to book one!</p>
        ) : (
          <ul className="space-y-4">
            {appointments.map((appointment) => (
              <li key={appointment.id} className="bg-blue-50 p-4 rounded-md shadow-sm border border-blue-200">
                <p className="text-lg font-medium text-blue-800">Date: {new Date(appointment.appointmentTime).toLocaleString()}</p>
                <p className="text-gray-700">Doctor: {appointment.doctor.user.firstName} {appointment.doctor.user.lastName}</p>
                <p className="text-gray-700">Symptoms: {appointment.symptoms}</p>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8 flex space-x-4">
          <Link to="/book-appointment" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300">
            Book New Appointment
          </Link>
          <Link to="/symptom-checker" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300">
            AI Symptom Checker
          </Link>
          <Link to="/medical-history" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300">
            View Medical History
          </Link>
          <Link to="/pharmacy-locator" className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300">
            Pharmacy Locator
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
