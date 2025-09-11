import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';

interface Doctor {
  id: string;
  specialization: string;
  user: { firstName: string; lastName: string; email: string };
}

const BookAppointment: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [appointmentTime, setAppointmentTime] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        const response = await api.get('http://localhost:4000/api/doctors?isAvailable=true', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDoctors(response.data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch doctors');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    if (!selectedDoctor || !appointmentTime || !symptoms) {
      setError('Please fill in all fields.');
      setSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await api.post('/api/appointments', { doctorId: selectedDoctor, appointmentTime, symptoms }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Appointment booked successfully!');
      navigate('/patient');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to book appointment');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Loading doctors...</p></div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Book a New Appointment</h1>

        {error && <p className="mt-4 text-sm text-red-600">Error: {error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="doctor" className="block text-sm font-medium text-gray-700">Select Doctor:</label>
            <select
              id="doctor"
              name="doctor"
              value={selectedDoctor || ''}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              required
            >
              <option value="" disabled>Select a doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  Dr. {doctor.user.firstName} {doctor.user.lastName} ({doctor.specialization})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="appointmentTime" className="block text-sm font-medium text-gray-700">Appointment Time:</label>
            <input
              type="datetime-local"
              id="appointmentTime"
              name="appointmentTime"
              value={appointmentTime}
              onChange={(e) => setAppointmentTime(e.target.value)}
              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2"
              required
            />
          </div>

          <div>
            <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700">Briefly describe your symptoms:</label>
            <textarea
              id="symptoms"
              name="symptoms"
              rows={3}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2"
              placeholder="e.g., persistent cough and mild fever"
              required
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Booking...' : 'Book Appointment'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookAppointment;
