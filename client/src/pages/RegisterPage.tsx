import React, { useState } from 'react';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'PATIENT', // Default role
    // Patient specific fields
    dob: '',
    gender: '',
    address: '',
    bloodGroup: '',
    emergencyContact: '',
    // Doctor specific fields
    specialization: '',
    qualifications: '',
    resizeable: '',
    experienceYears: '',
  });
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post('http://localhost:4000/api/auth/register', formData);
      alert('Registration successful! Please log in.');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4 ml-28">
            {/* Basic User Fields */}
            <div>
              <input  name="email" type="email" required className="auth-input p-1" placeholder="Email address" value={formData.email} onChange={handleChange} />
            </div>
            <div>
              <input name="password" type="password" required className="auth-input p-1" placeholder="Password" value={formData.password} onChange={handleChange} />
            </div>
            <div>
              <input name="firstName" type="text" required className="auth-input p-1" placeholder="First Name" value={formData.firstName} onChange={handleChange} />
            </div>
            <div>
              <input name="lastName" type="text" required className="auth-input p-1" placeholder="Last Name" value={formData.lastName} onChange={handleChange} />
            </div>
            <div>
              <input name="phone" type="text" required className="auth-input p-1" placeholder="Phone Number" value={formData.phone} onChange={handleChange} />
            </div>
            <div>
              <select name="role" className="auth-input p-1" value={formData.role} onChange={handleChange}>
                <option value="PATIENT">Patient</option>
                <option value="DOCTOR">Doctor</option>
                <option value="PHARMACIST">Pharmacist</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            {/* Patient Specific Fields */}
            {formData.role === 'PATIENT' && (
              <>
                <div>
                  <input name="dob" type="date" className="auth-input p-1" placeholder="Date of Birth" value={formData.dob} onChange={handleChange} />
                </div>
                <div>
                  <input name="gender" type="text" className="auth-input p-1" placeholder="Gender" value={formData.gender} onChange={handleChange} />
                </div>
                <div>
                  <input name="address" type="text" className="auth-input p-1" placeholder="Address" value={formData.address} onChange={handleChange} />
                </div>
                <div>
                  <input name="bloodGroup" type="text" className="auth-input p-1" placeholder="Blood Group" value={formData.bloodGroup} onChange={handleChange} />
                </div>
                <div>
                  <input name="emergencyContact" type="text" className="auth-input p-1" placeholder="Emergency Contact" value={formData.emergencyContact} onChange={handleChange} />
                </div>
              </>
            )}

            {/* Doctor Specific Fields */}
            {formData.role === 'DOCTOR' && (
              <>
                <div>
                  <input name="specialization" type="text" className="auth-input p-1" placeholder="Specialization" value={formData.specialization} onChange={handleChange} />
                </div>
                <div>
                  <input name="qualifications" type="text" className="auth-input p-1" placeholder="Qualifications" value={formData.qualifications} onChange={handleChange} />
                </div>
                <div>
                  <input name="experienceYears" type="number" className="auth-input p-1" placeholder="Years of Experience" value={formData.experienceYears} onChange={handleChange} />
                </div>
              </>
            )}
          </div>

          {error && <p className="mt-2 text-center text-sm text-red-600">{error}</p>}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
