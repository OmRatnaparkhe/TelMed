import React, { useState, useEffect } from 'react';
import LeafletMap from './LeafletMap';

interface PharmacyLocation {
  id: string | null;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  operatingHours: {
    [key: string]: { open: string; close: string; isOpen: boolean };
  };
  services: string[];
  isActive: boolean;
}

const PharmacyProfile: React.FC = () => {
  const [pharmacyData, setPharmacyData] = useState<PharmacyLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const daysOfWeek = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ];

  useEffect(() => {
    loadPharmacyData();
  }, []);

  const loadPharmacyData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await fetch('http://localhost:4000/api/pharmacy/location', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPharmacyData(data);
      } else {
        setError('Failed to load pharmacy data');
      }
    } catch (error) {
      console.error('Error loading pharmacy data:', error);
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditLocation = () => {
    setIsEditing(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!pharmacyData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No pharmacy data found</p>
      </div>
    );
  }

  if (isEditing) {
    // Redirect to LocationSetup component for editing
    window.location.href = '/pharmacist/location-setup';
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pharmacy Profile</h2>
          <p className="text-gray-600">Your pharmacy location and details</p>
        </div>
        <button
          onClick={handleEditLocation}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Edit Location
        </button>
      </div>

      {/* Pharmacy Information Card */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-xl font-bold text-white">{pharmacyData.name || 'Unnamed Pharmacy'}</h3>
              <p className="text-indigo-100">
                {pharmacyData.isActive ? '🟢 Active' : '🔴 Inactive'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">Contact Information</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-gray-700">{pharmacyData.phone || 'Not provided'}</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-700">{pharmacyData.email || 'Not provided'}</span>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">Address</h4>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-gray-400 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div className="text-gray-700">
                  <p>{pharmacyData.address}</p>
                  {pharmacyData.city && (
                    <p>{pharmacyData.city}, {pharmacyData.state} {pharmacyData.pincode}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    📍 {pharmacyData.latitude.toFixed(6)}, {pharmacyData.longitude.toFixed(6)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Operating Hours */}
          <div className="mt-6">
            <h4 className="text-lg font-medium text-gray-900 mb-3">Operating Hours</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {daysOfWeek.map(({ key, label }) => {
                  const hours = pharmacyData.operatingHours[key];
                  return (
                    <div key={key} className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">{label}:</span>
                      <span className="text-gray-600">
                        {hours?.isOpen ? `${hours.open} - ${hours.close}` : 'Closed'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Services */}
          {pharmacyData.services && pharmacyData.services.length > 0 && (
            <div className="mt-6">
              <h4 className="text-lg font-medium text-gray-900 mb-3">Services Offered</h4>
              <div className="flex flex-wrap gap-2">
                {pharmacyData.services.map((service, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Location Map */}
      {pharmacyData.latitude !== 0 && pharmacyData.longitude !== 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium text-gray-900">Pharmacy Location</h4>
            <button
              onClick={handleEditLocation}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              Edit Location →
            </button>
          </div>
          <LeafletMap
            latitude={pharmacyData.latitude}
            longitude={pharmacyData.longitude}
            pharmacyName={pharmacyData.name}
            address={`${pharmacyData.address}, ${pharmacyData.city}, ${pharmacyData.state} ${pharmacyData.pincode}`}
            height="400px"
          />
        </div>
      )}

      {/* No Location Set */}
      {(pharmacyData.latitude === 0 && pharmacyData.longitude === 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Location Not Set</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Please set your pharmacy location to help patients find you easily.
              </p>
              <button
                onClick={handleEditLocation}
                className="mt-2 text-sm font-medium text-yellow-800 underline hover:text-yellow-900"
              >
                Set Location Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacyProfile;
