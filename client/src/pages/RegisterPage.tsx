import React, { useState } from 'react';
import api from '../lib/api';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Mail, Lock, User, Phone, Calendar, MapPin, ArrowLeft } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'PATIENT',
    // Patient specific fields
    dob: '',
    gender: '',
    address: '',
    bloodGroup: '',
    emergencyContact: '',
    // Doctor specific fields
    specialization: '',
    qualifications: '',
    experienceYears: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      await api.post('/api/auth/register', formData);
      navigate('/login', { 
        state: { message: 'Registration successful! Please sign in with your credentials.' }
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-6 sm:pb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-600 p-3 rounded-full">
                <Heart className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900">Join TelMed</CardTitle>
            <CardDescription className="text-base sm:text-lg text-gray-600">
              Create your account to access healthcare services
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}

              {/* Role Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Account Type</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PATIENT">Patient</option>
                  <option value="DOCTOR">Doctor</option>
                  <option value="PHARMACIST">Pharmacist</option>
                </select>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="Enter your first name"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Last Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="Enter your last name"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="pl-10"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="Create a password"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="Confirm your password"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Patient-specific fields */}
              {formData.role === 'PATIENT' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Date of Birth</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          type="date"
                          name="dob"
                          value={formData.dob}
                          onChange={handleChange}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Gender</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Gender</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange as any}
                        className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your address"
                        rows={3}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Blood Group</label>
                      <select
                        name="bloodGroup"
                        value={formData.bloodGroup}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Blood Group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Emergency Contact</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          type="tel"
                          name="emergencyContact"
                          value={formData.emergencyContact}
                          onChange={handleChange}
                          className="pl-10"
                          placeholder="Emergency contact number"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Doctor-specific fields */}
              {formData.role === 'DOCTOR' && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Specialization</label>
                    <Input
                      type="text"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      placeholder="Enter your specialization"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Qualifications</label>
                    <textarea
                      name="qualifications"
                      value={formData.qualifications}
                      onChange={handleChange as any}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your qualifications"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Years of Experience</label>
                    <Input
                      type="number"
                      name="experienceYears"
                      value={formData.experienceYears}
                      onChange={handleChange}
                      placeholder="Enter years of experience"
                      min="0"
                      required
                    />
                  </div>
                </>
              )}

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <div className="text-center pt-4 border-t">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                  Sign in here
                </Link>
              </p>
            </div>

            <div className="text-center">
              <Link
                to="/"
                className="inline-flex items-center text-gray-600 hover:text-gray-700 font-medium"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
