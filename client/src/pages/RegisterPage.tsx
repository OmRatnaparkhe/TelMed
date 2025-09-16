import React, { useState } from 'react';
import api from '../lib/api';
import { useNavigate, Link } from 'react-router-dom';
<<<<<<< HEAD
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Mail, Lock, User, Phone, Calendar, MapPin, ArrowLeft } from 'lucide-react';
=======

interface FormErrors {
  [key: string]: string;
}

interface InputFieldProps {
  label: string;
  name: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  formData: any;
  errors: FormErrors;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const InputField: React.FC<InputFieldProps> = ({ 
  label, 
  name, 
  type, 
  placeholder, 
  required = false, 
  options, 
  formData, 
  errors, 
  onChange 
}) => {
  const isSelect = type === 'select';
  const inputClasses = `mt-1 block w-full px-3 py-2 border ${
    errors[name] ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
  } rounded-md shadow-sm focus:outline-none focus:ring-1 sm:text-sm transition-colors`;

  const getValue = () => {
    const value = formData[name as keyof typeof formData];
    return typeof value === 'string' ? value : String(value || '');
  };

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {isSelect ? (
        <select
          id={name}
          name={name}
          value={getValue()}
          onChange={onChange}
          className={inputClasses}
          required={required}
        >
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={getValue()}
          onChange={onChange}
          className={inputClasses}
          required={required}
        />
      )}
      {errors[name] && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {errors[name]}
        </p>
      )}
    </div>
  );
};
>>>>>>> c3e3419378a6f0adb991f5e7117639f4ed97f144

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
<<<<<<< HEAD
    experienceYears: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
=======
    licenseNumber: '',
    experienceYears: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
>>>>>>> c3e3419378a6f0adb991f5e7117639f4ed97f144
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Required fields validation
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';

    // Phone validation
    const phoneRegex = /^[+]?[\d\s\-\(\)]{10,}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Role-specific validation
    if (formData.role === 'DOCTOR') {
      if (!formData.specialization.trim()) newErrors.specialization = 'Specialization is required for doctors';
      if (!formData.qualifications.trim()) newErrors.qualifications = 'Qualifications are required for doctors';
      if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required for doctors';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
<<<<<<< HEAD
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
=======
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});
    setSuccessMessage(null);

    try {
      await api.post('/api/auth/register', formData);
      setSuccessMessage('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setErrors({ 
        general: err.response?.data?.error || 'Registration failed. Please try again.' 
      });
    } finally {
      setIsLoading(false);
>>>>>>> c3e3419378a6f0adb991f5e7117639f4ed97f144
    }
  };


  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-50/30 to-green-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Link>
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <Heart className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-muted-foreground">Join TelMed and start your healthcare journey</p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Sign up</CardTitle>
            <CardDescription className="text-center">
              Fill in your information to create your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="Enter your first name"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium">Last Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      placeholder="Enter your last name"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="role" className="text-sm font-medium">Role</label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="PATIENT">Patient</option>
                    <option value="DOCTOR">Doctor</option>
                    <option value="PHARMACIST">Pharmacist</option>
                  </select>
                </div>
              </div>

              {/* Role-specific fields */}
              {formData.role === 'PATIENT' && (
                <div className="space-y-4 border-t pt-4">
                  <h3 className="text-lg font-semibold">Patient Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="dob" className="text-sm font-medium">Date of Birth</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="dob"
                          name="dob"
                          type="date"
                          value={formData.dob}
                          onChange={handleChange}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="gender" className="text-sm font-medium">Gender</label>
                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="bloodGroup" className="text-sm font-medium">Blood Group</label>
                      <Input
                        id="bloodGroup"
                        name="bloodGroup"
                        type="text"
                        placeholder="e.g., A+, B-, O+"
                        value={formData.bloodGroup}
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="emergencyContact" className="text-sm font-medium">Emergency Contact</label>
                      <Input
                        id="emergencyContact"
                        name="emergencyContact"
                        type="tel"
                        placeholder="Emergency contact number"
                        value={formData.emergencyContact}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="address" className="text-sm font-medium">Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="address"
                        name="address"
                        type="text"
                        placeholder="Enter your address"
                        value={formData.address}
                        onChange={handleChange}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              )}

              {formData.role === 'DOCTOR' && (
                <div className="space-y-4 border-t pt-4">
                  <h3 className="text-lg font-semibold">Doctor Information</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="specialization" className="text-sm font-medium">Specialization</label>
                      <Input
                        id="specialization"
                        name="specialization"
                        type="text"
                        placeholder="e.g., Cardiology, Dermatology"
                        value={formData.specialization}
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="qualifications" className="text-sm font-medium">Qualifications</label>
                      <Input
                        id="qualifications"
                        name="qualifications"
                        type="text"
                        placeholder="e.g., MBBS, MD"
                        value={formData.qualifications}
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="experienceYears" className="text-sm font-medium">Years of Experience</label>
                      <Input
                        id="experienceYears"
                        name="experienceYears"
                        type="number"
                        placeholder="Years of experience"
                        value={formData.experienceYears}
                        onChange={handleChange}
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-md bg-destructive/15 p-3">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating account...' : 'Create account'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link to="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
=======
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg px-8 py-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</h2>
            <p className="text-gray-600">Join TelMed to access healthcare services</p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">{successMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* General Error */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{errors.general}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="First Name"
                name="firstName"
                type="text"
                placeholder="Enter your first name"
                required
                formData={formData}
                errors={errors}
                onChange={handleChange}
              />
              <InputField
                label="Last Name"
                name="lastName"
                type="text"
                placeholder="Enter your last name"
                required
                formData={formData}
                errors={errors}
                onChange={handleChange}
              />
            </div>
<div>
  <select name="role" className="auth-input p-1" value={formData.role} onChange={handleChange}>
    <option value="PATIENT">Patient</option>
    <option value="DOCTOR">Doctor</option>
    <option value="PHARMACIST">Pharmacist</option>
  </select>
</div>

<InputField
  label="Email Address"
  name="email"
  type="email"
  placeholder="Enter your email address"
  required
  formData={formData}
  errors={errors}
  onChange={handleChange}
/>

<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <InputField
    label="Password"
    name="password"
    type="password"
    placeholder="Create a strong password"
    required
    formData={formData}
    errors={errors}
    onChange={handleChange}
  />
  <InputField
    label="Confirm Password"
    name="confirmPassword"
    type="password"
    placeholder="Confirm your password"
    required
    formData={formData}
    errors={errors}
    onChange={handleChange}
  />
</div>

            <InputField
              label="Phone Number"
              name="phone"
              type="tel"
              placeholder="Enter your phone number"
              required
              formData={formData}
              errors={errors}
              onChange={handleChange}
            />

            <InputField
              label="Role"
              name="role"
              type="select"
              required
              formData={formData}
              errors={errors}
              onChange={handleChange}
              options={[
                { value: 'PATIENT', label: 'Patient' },
                { value: 'DOCTOR', label: 'Doctor' },
                { value: 'PHARMACIST', label: 'Pharmacist' },
                { value: 'ADMIN', label: 'Admin' },
              ]}
            />

            {/* Patient Specific Fields */}
            {formData.role === 'PATIENT' && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Patient Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Date of Birth"
                    name="dob"
                    type="date"
                    formData={formData}
                    errors={errors}
                    onChange={handleChange}
                  />
                  <InputField
                    label="Gender"
                    name="gender"
                    type="select"
                    formData={formData}
                    errors={errors}
                    onChange={handleChange}
                    options={[
                      { value: '', label: 'Select Gender' },
                      { value: 'MALE', label: 'Male' },
                      { value: 'FEMALE', label: 'Female' },
                      { value: 'OTHER', label: 'Other' },
                    ]}
                  />
                </div>
                <InputField
                  label="Address"
                  name="address"
                  type="text"
                  placeholder="Enter your address"
                  formData={formData}
                  errors={errors}
                  onChange={handleChange}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Blood Group"
                    name="bloodGroup"
                    type="select"
                    formData={formData}
                    errors={errors}
                    onChange={handleChange}
                    options={[
                      { value: '', label: 'Select Blood Group' },
                      { value: 'A+', label: 'A+' },
                      { value: 'A-', label: 'A-' },
                      { value: 'B+', label: 'B+' },
                      { value: 'B-', label: 'B-' },
                      { value: 'AB+', label: 'AB+' },
                      { value: 'AB-', label: 'AB-' },
                      { value: 'O+', label: 'O+' },
                      { value: 'O-', label: 'O-' },
                    ]}
                  />
                  <InputField
                    label="Emergency Contact"
                    name="emergencyContact"
                    type="tel"
                    placeholder="Emergency contact number"
                    formData={formData}
                    errors={errors}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            {/* Doctor Specific Fields */}
            {formData.role === 'DOCTOR' && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Doctor Information</h3>
                <InputField
                  label="Specialization"
                  name="specialization"
                  type="text"
                  placeholder="e.g., Cardiology, Pediatrics"
                  required
                  formData={formData}
                  errors={errors}
                  onChange={handleChange}
                />
                <InputField
                  label="Qualifications"
                  name="qualifications"
                  type="text"
                  placeholder="e.g., MBBS, MD"
                  required
                  formData={formData}
                  errors={errors}
                  onChange={handleChange}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="License Number"
                    name="licenseNumber"
                    type="text"
                    placeholder="Medical license number"
                    required
                    formData={formData}
                    errors={errors}
                    onChange={handleChange}
                  />
                  <InputField
                    label="Years of Experience"
                    name="experienceYears"
                    type="number"
                    placeholder="Years of practice"
                    formData={formData}
                    errors={errors}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                } transition-colors`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>
>>>>>>> c3e3419378a6f0adb991f5e7117639f4ed97f144
      </div>
    </div>
  );
};

export default RegisterPage;
