import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';

interface MedicalRecord {
  id: string;
  diagnosis: string;
  prescription: string;
  createdAt: string;
  doctor: { user: { firstName: string; lastName: string } };
  appointment: { appointmentTime: string };
}

const MedicalHistory: React.FC = () => {
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMedicalRecords = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Try to load from localStorage first for offline access
        const cachedRecords = localStorage.getItem('medicalRecords');
        if (cachedRecords) {
          setMedicalRecords(JSON.parse(cachedRecords));
          setLoading(false);
        }

        const response = await api.get('http://localhost:4000/api/medical-records/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMedicalRecords(response.data);
        localStorage.setItem('medicalRecords', JSON.stringify(response.data));
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch medical records');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMedicalRecords();
  }, [navigate]);

  const downloadPdf = (record: MedicalRecord) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Medical Record', 14, 22);
    doc.setFontSize(12);
    doc.text(`Record ID: ${record.id}`, 14, 30);
    doc.text(`Date: ${new Date(record.createdAt).toLocaleDateString()}`, 14, 37);
    doc.text(`Doctor: Dr. ${record.doctor.user.firstName} ${record.doctor.user.lastName}`, 14, 44);
    doc.text(`Appointment: ${new Date(record.appointment.appointmentTime).toLocaleString()}`, 14, 51);
    doc.text(`Diagnosis:`, 14, 58);
    doc.setFontSize(10);
    doc.text(record.diagnosis, 14, 65, { maxWidth: 180 });
    doc.setFontSize(12);
    doc.text(`Prescription:`, 14, 75);
    doc.setFontSize(10);
    doc.text(record.prescription, 14, 82, { maxWidth: 180 });
    doc.save(`medical_record_${record.id}.pdf`);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Loading medical records...</p></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600"><p>{error}</p></div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">My Medical History</h1>

        {medicalRecords.length === 0 ? (
          <p className="text-gray-600">No medical records found.</p>
        ) : (
          <ul className="space-y-6">
            {medicalRecords.map((record) => (
              <li key={record.id} className="bg-green-50 p-4 rounded-lg shadow-sm border border-green-200">
                <p className="text-lg font-medium text-green-800">Diagnosis: {record.diagnosis}</p>
                <p className="text-gray-700">Doctor: Dr. {record.doctor.user.firstName} {record.doctor.user.lastName}</p>
                <p className="text-gray-700">Date: {new Date(record.createdAt).toLocaleDateString()}</p>
                <button
                  onClick={() => downloadPdf(record)}
                  className="mt-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300"
                >
                  Download as PDF
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MedicalHistory;
