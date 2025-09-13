import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { useNavigate, Link } from 'react-router-dom';

interface Doctor {
  id: string;
  specialization: string;
  experienceYears: number;
  qualifications: string;
  isAvailable: boolean;
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
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        const response = await api.get('/api/doctors');
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
    setSuccess(false);

    if (!selectedDoctor || !appointmentTime || !symptoms) {
      setError('Please fill in all fields.');
      setSubmitting(false);
      return;
    }

    // Validate appointment time is in the future
    const selectedDate = new Date(appointmentTime);
    const now = new Date();
    if (selectedDate <= now) {
      setError('Please select a future date and time for your appointment.');
      setSubmitting(false);
      return;
    }

    try {
      await api.post('/api/appointments', { doctorId: selectedDoctor, appointmentTime, symptoms });
      setSuccess(true);
      setTimeout(() => {
        navigate('/patient');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to book appointment');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30); // Allow appointments 30 minutes from now
    return now.toISOString().slice(0, 16);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">Loading available doctors...</p>
      </div>
    </div>
  );

  if (success) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
        <div className="text-green-500 text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Appointment Booked!</h2>
        <p className="text-gray-600 mb-6">Your appointment has been successfully booked. You will be redirected to your dashboard shortly.</p>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link to="/patient" className="mr-4">
                <svg className="w-6 h-6 text-gray-600 hover:text-indigo-600 transition duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div className="bg-indigo-600 p-2 rounded-lg mr-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
                <p className="text-gray-600">Schedule your healthcare consultation</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Appointment Details</h2>
                <p className="text-gray-600 mt-1">Fill in the details below to book your appointment</p>
              </div>
              <div className="p-6">
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex">
                      <svg className="w-5 h-5 text-red-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-red-700">{error}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Doctor Selection */}
                  <div>
                    <label htmlFor="doctor" className="block text-sm font-medium text-gray-700 mb-2">
                      Select Doctor
                    </label>
                    <select
                      id="doctor"
                      name="doctor"
                      value={selectedDoctor || ''}
                      onChange={(e) => setSelectedDoctor(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-300"
                      required
                    >
                      <option value="" disabled>Choose a doctor...</option>
                      {doctors.map((doctor) => (
                        <option key={doctor.id} value={doctor.id}>
                          Dr. {doctor.user.firstName} {doctor.user.lastName} - {doctor.specialization}
                        </option>
                      ))}
                    </select>
                    {selectedDoctor && (
                      <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                        {(() => {
                          const doctor = doctors.find(d => d.id === selectedDoctor);
                          return doctor ? (
                            <div>
                              <p className="text-sm font-medium text-blue-900">
                                Dr. {doctor.user.firstName} {doctor.user.lastName}
                              </p>
                              <p className="text-sm text-blue-700">
                                {doctor.specialization} • {doctor.experienceYears} years experience
                              </p>
                              <p className="text-xs text-blue-600 mt-1">
                                {doctor.qualifications}
                              </p>
                            </div>
                          ) : null;
                        })()}
                      </div>
                    )}
                  </div>

                  {/* Appointment Time */}
                  <div>
                    <label htmlFor="appointmentTime" className="block text-sm font-medium text-gray-700 mb-2">
                      Appointment Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      id="appointmentTime"
                      name="appointmentTime"
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                      min={getMinDateTime()}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-300"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Appointments must be scheduled at least 30 minutes in advance
                    </p>
                  </div>

                  {/* Symptoms */}
                  <div>
                    <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 mb-2">
                      Describe Your Symptoms
                    </label>
                    <textarea
                      id="symptoms"
                      name="symptoms"
                      rows={4}
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-300 resize-none"
                      placeholder="Please describe your symptoms in detail. This helps the doctor prepare for your consultation..."
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Be as specific as possible about your symptoms, duration, and any concerns
                    </p>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium py-3 px-6 rounded-lg transition duration-300 flex items-center justify-center"
                    >
                      {submitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Booking Appointment...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Book Appointment
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Available Doctors */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Available Doctors</h3>
              <div className="space-y-3">
                {doctors.slice(0, 3).map((doctor) => (
                  <div key={doctor.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition duration-300">
                    <div className="flex items-center">
                      <div className="bg-indigo-100 p-2 rounded-full mr-3">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          Dr. {doctor.user.firstName} {doctor.user.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{doctor.specialization}</p>
                        <p className="text-xs text-gray-500">{doctor.experienceYears} years experience</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-blue-900 mb-3">Booking Tips</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Be specific about your symptoms
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Choose a convenient time slot
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Arrive 5 minutes early
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Have your ID ready
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
