import React from 'react';
import { useNavigate } from 'react-router-dom';

const PatientDashboard: React.FC = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'Find Pharmacy',
      description: 'Search for nearby pharmacies and check medicine availability',
      icon: '🏥',
      color: 'from-blue-500 to-blue-600',
      action: () => navigate('/patient/pharmacy-finder'),
    },
    {
      title: 'Book Appointment',
      description: 'Schedule a consultation with available doctors',
      icon: '📅',
      color: 'from-green-500 to-green-600',
      action: () => navigate('/patient/appointments'),
    },
    {
      title: 'AI Symptom Checker',
      description: 'Get preliminary health insights using AI',
      icon: '🤖',
      color: 'from-purple-500 to-purple-600',
      action: () => navigate('/patient/symptom-checker'),
    },
    {
      title: 'Medical Records',
      description: 'View your medical history and reports',
      icon: '📋',
      color: 'from-indigo-500 to-indigo-600',
      action: () => navigate('/patient/medical-records'),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to TelMed
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your comprehensive healthcare platform for consultations, pharmacy services, and health management
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {quickActions.map((action, index) => (
            <div
              key={index}
              onClick={action.action}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
            >
              <div className={`h-32 bg-gradient-to-r ${action.color} rounded-t-xl flex items-center justify-center`}>
                <span className="text-4xl">{action.icon}</span>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {action.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {action.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Featured Services */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Location-Based Pharmacy Search</h3>
              <p className="text-gray-600 text-sm">
                Find pharmacies near you with real-time distance calculation and availability status
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-Time Operating Hours</h3>
              <p className="text-gray-600 text-sm">
                Check if pharmacies are currently open and view their operating schedules
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Service Filtering</h3>
              <p className="text-gray-600 text-sm">
                Filter pharmacies by services like home delivery, 24/7 emergency, and online consultation
              </p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-gray-900 font-medium">Welcome to TelMed!</p>
                <p className="text-gray-600 text-sm">Start by exploring our pharmacy finder to locate nearby pharmacies</p>
              </div>
              <span className="text-gray-500 text-sm">Just now</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
