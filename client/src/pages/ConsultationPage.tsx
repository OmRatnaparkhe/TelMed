import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';

interface AppointmentDetails {
  id: string;
  patient: { user: { firstName: string; lastName: string; email: string; phone: string } };
  symptoms: string;
  appointmentTime: string;
}

const ConsultationPage: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      if (!appointmentId) {
        setError('Appointment ID is missing.');
        setLoading(false);
        return;
      }
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        // This assumes a backend endpoint like GET /api/appointments/:id for doctors
        const response = await api.get(`http://localhost:4000/api/appointments/${appointmentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAppointment(response.data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch appointment details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointmentDetails();
  }, [appointmentId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    if (!appointment || !diagnosis.trim() || !prescription.trim()) {
      setError('Diagnosis and Prescription are required.');
      setSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      // Create medical record
      await api.post(
        'http://localhost:4000/api/medical-records',
        {
          patientId: appointment.patient.user.id, // Assuming patient user object has ID
          doctorId: 'replace_with_actual_doctor_id', // This will be handled by backend middleware or current user context
          appointmentId: appointment.id,
          diagnosis,
          prescription,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update appointment status to completed
      await api.put(
        `http://localhost:4000/api/appointments/${appointment.id}/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Consultation completed and medical record saved!');
      navigate('/doctor'); // Redirect back to doctor dashboard
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to complete consultation');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Loading consultation details...</p></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600"><p>{error}</p></div>;
  if (!appointment) return <div className="min-h-screen flex items-center justify-center"><p>Appointment not found.</p></div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Consultation for {appointment.patient.user.firstName} {appointment.patient.user.lastName}</h1>

        <div className="mb-4 p-4 bg-blue-50 rounded-md border border-blue-200">
          <h2 className="text-xl font-semibold text-blue-800">Patient Details:</h2>
          <p className="text-gray-700">Email: {appointment.patient.user.email}</p>
          <p className="text-gray-700">Phone: {appointment.patient.user.phone}</p>
          <p className="text-gray-700">Appointment Time: {new Date(appointment.appointmentTime).toLocaleString()}</p>
          <p className="text-gray-700 font-medium mt-2">Symptoms: {appointment.symptoms}</p>
        </div>

        {error && <p className="mt-4 text-sm text-red-600">Error: {error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700">Diagnosis:</label>
            <textarea
              id="diagnosis"
              name="diagnosis"
              rows={5}
              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              required
            ></textarea>
          </div>

          <div>
            <label htmlFor="prescription" className="block text-sm font-medium text-gray-700">Prescription:</label>
            <textarea
              id="prescription"
              name="prescription"
              rows={5}
              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2"
              value={prescription}
              onChange={(e) => setPrescription(e.target.value)}
              required
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Completing...' : 'Complete Consultation & Save Record'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ConsultationPage;
