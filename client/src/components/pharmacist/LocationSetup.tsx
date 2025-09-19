import React, { useState, useEffect } from 'react';
import LeafletMap from './LeafletMap';

interface PharmacyLocation {
  id: string;
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

interface FormErrors {
  [key: string]: string;
}

const LocationSetup: React.FC = () => {
  const [pharmacyData, setPharmacyData] = useState<PharmacyLocation>({
    id: 'PHARM001',
    name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    latitude: 0,
    longitude: 0,
    phone: '',
    email: '',
    operatingHours: {
      monday: { open: '09:00', close: '21:00', isOpen: true },
      tuesday: { open: '09:00', close: '21:00', isOpen: true },
      wednesday: { open: '09:00', close: '21:00', isOpen: true },
      thursday: { open: '09:00', close: '21:00', isOpen: true },
      friday: { open: '09:00', close: '21:00', isOpen: true },
      saturday: { open: '09:00', close: '21:00', isOpen: true },
      sunday: { open: '10:00', close: '20:00', isOpen: true },
    },
    services: [],
    isActive: true,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const availableServices = [
    'Home Delivery',
    '24/7 Emergency',
    'Online Consultation',
    'Medicine Refill Reminders',
    'Health Checkups',
    'Vaccination Services',
    'Blood Pressure Monitoring',
    'Diabetes Care',
    'Prescription Verification',
    'Insurance Claims',
  ];

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
    // Load existing pharmacy data from API
    const loadPharmacyData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('https://telmed-3.onrender.com/api/pharmacy/location', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setPharmacyData(data);
        }
      } catch (error) {
        console.error('Error loading pharmacy data:', error);
      }
    };

    loadPharmacyData();

    // Get current location if no location is set
    if (navigator.geolocation && (!pharmacyData.latitude || !pharmacyData.longitude)) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPharmacyData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPharmacyData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleServiceToggle = (service: string) => {
    setPharmacyData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const handleOperatingHoursChange = (day: string, field: 'open' | 'close' | 'isOpen', value: string | boolean) => {
    setPharmacyData(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day],
          [field]: value,
        },
      },
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!pharmacyData.name.trim()) newErrors.name = 'Pharmacy name is required';
    if (!pharmacyData.address.trim()) newErrors.address = 'Address is required';
    if (!pharmacyData.city.trim()) newErrors.city = 'City is required';
    if (!pharmacyData.state.trim()) newErrors.state = 'State is required';
    if (!pharmacyData.pincode.trim()) newErrors.pincode = 'Pincode is required';
    if (!/^\d{6}$/.test(pharmacyData.pincode)) newErrors.pincode = 'Pincode must be 6 digits';
    if (!pharmacyData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!/^[+]?[\d\s\-\(\)]{10,}$/.test(pharmacyData.phone)) newErrors.phone = 'Invalid phone number';
    if (!pharmacyData.email.trim()) newErrors.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pharmacyData.email)) newErrors.email = 'Invalid email format';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLocationChange = (lat: number, lng: number) => {
    setPharmacyData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrors({ address: 'Geolocation is not supported by this browser.' });
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPharmacyData(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
        setIsLoading(false);
        setSuccessMessage('Current location detected successfully!');
        setTimeout(() => setSuccessMessage(null), 1000);
      },
      (error) => {
        setIsLoading(false);
        let errorMessage = 'Failed to get current location. ';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Location access denied by user.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out.';
            break;
          default:
            errorMessage += 'Unknown error occurred.';
            break;
        }
        setErrors({ address: errorMessage });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const handleGeocodeAddress = async () => {
    // Simulate geocoding (in real implementation, use Google Maps Geocoding API)
    try {
      setIsLoading(true);
      // Mock geocoding response based on address
      const mockLat = 28.6139 + (Math.random() - 0.5) * 0.1;
      const mockLng = 77.2090 + (Math.random() - 0.5) * 0.1;
      
      setTimeout(() => {
        setPharmacyData(prev => ({
          ...prev,
          latitude: mockLat,
          longitude: mockLng,
        }));
        setIsLoading(false);
        setSuccessMessage('Location coordinates updated successfully!');
        setTimeout(() => setSuccessMessage(null), 1000);
      }, 1000);
    } catch (error) {
      setIsLoading(false);
      setErrors({ address: 'Failed to geocode address. Please check the address.' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setErrors({ general: 'Authentication required. Please log in again.' });
        setIsLoading(false);
        return;
      }

      const response = await fetch('https://telmed-3.onrender.com/api/pharmacy/location', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pharmacyData),
      });

      if (response.ok) {
        const result = await response.json();
        setSuccessMessage('Pharmacy location updated successfully!');
        // Update the pharmacy data with the response (in case ID was generated)
        if (result.pharmacy) {
          setPharmacyData(prev => ({ ...prev, id: result.pharmacy.id }));
        }
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        const errorData = await response.json();
        setErrors({ general: errorData.error || 'Failed to update pharmacy location' });
      }
    } catch (error) {
      console.error('Error updating pharmacy location:', error);
      setErrors({ general: 'Network error. Please check your connection and try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Pharmacy Location Setup</h2>
        <p className="text-gray-600">Configure your pharmacy location and services for patient discovery</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
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

      {/* Error Message */}
      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
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
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Pharmacy Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={pharmacyData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border ${errors.name ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="Enter pharmacy name"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={pharmacyData.phone}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border ${errors.phone ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="Enter phone number"
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>
          </div>
          <div className="mt-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={pharmacyData.email}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500`}
              placeholder="Enter email address"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Address Information</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Street Address <span className="text-red-500">*</span>
              </label>
              <textarea
                id="address"
                name="address"
                value={pharmacyData.address}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-3 py-2 border ${errors.address ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="Enter complete address"
              />
              {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={pharmacyData.city}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${errors.city ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500`}
                  placeholder="Enter city"
                />
                {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
              </div>
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={pharmacyData.state}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${errors.state ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500`}
                  placeholder="Enter state"
                />
                {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
              </div>
              <div>
                <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">
                  Pincode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="pincode"
                  name="pincode"
                  value={pharmacyData.pincode}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${errors.pincode ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500`}
                  placeholder="Enter pincode"
                />
                {errors.pincode && <p className="mt-1 text-sm text-red-600">{errors.pincode}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Location Coordinates */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Location Coordinates</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
                Latitude
              </label>
              <input
                type="number"
                id="latitude"
                name="latitude"
                value={pharmacyData.latitude}
                onChange={handleInputChange}
                step="any"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Latitude"
              />
            </div>
            <div>
              <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
                Longitude
              </label>
              <input
                type="number"
                id="longitude"
                name="longitude"
                value={pharmacyData.longitude}
                onChange={handleInputChange}
                step="any"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Longitude"
              />
            </div>
            <div>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
              >
                {isLoading ? 'Getting Location...' : 'Use Current Location'}
              </button>
            </div>
            <div>
              <button
                type="button"
                onClick={handleGeocodeAddress}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 transition-colors"
              >
                {isLoading ? 'Getting Location...' : 'Get from Address'}
              </button>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <p className="text-sm text-gray-600">
              📍 <strong>Use Current Location:</strong> Automatically detect your current GPS position
            </p>
            <p className="text-sm text-gray-600">
              🏠 <strong>Get from Address:</strong> Convert your entered address to coordinates
            </p>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Operating Hours</h3>
          <div className="space-y-3">
            {daysOfWeek.map(({ key, label }) => (
              <div key={key} className="flex items-center space-x-4">
                <div className="w-20">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={pharmacyData.operatingHours[key].isOpen}
                      onChange={(e) => handleOperatingHoursChange(key, 'isOpen', e.target.checked)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">{label}</span>
                  </label>
                </div>
                {pharmacyData.operatingHours[key].isOpen && (
                  <>
                    <div>
                      <input
                        type="time"
                        value={pharmacyData.operatingHours[key].open}
                        onChange={(e) => handleOperatingHoursChange(key, 'open', e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <span className="text-gray-500">to</span>
                    <div>
                      <input
                        type="time"
                        value={pharmacyData.operatingHours[key].close}
                        onChange={(e) => handleOperatingHoursChange(key, 'close', e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </>
                )}
                {!pharmacyData.operatingHours[key].isOpen && (
                  <span className="text-gray-500 text-sm">Closed</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Services */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Available Services</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {availableServices.map((service) => (
              <label key={service} className="flex items-center">
                <input
                  type="checkbox"
                  checked={pharmacyData.services.includes(service)}
                  onChange={() => handleServiceToggle(service)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">{service}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Interactive Map */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Interactive Location Map</h3>
          <LeafletMap
            latitude={pharmacyData.latitude || 28.6139}
            longitude={pharmacyData.longitude || 77.2090}
            pharmacyName={pharmacyData.name || 'Your Pharmacy'}
            address={`${pharmacyData.address}, ${pharmacyData.city}, ${pharmacyData.state} ${pharmacyData.pincode}`}
            onLocationChange={handleLocationChange}
            height="400px"
          />
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-800">
                  <strong>Instructions:</strong> Drag the marker on the map to adjust your pharmacy's exact location. 
                  This helps patients find you more accurately.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 transition-colors"
          >
            {isLoading ? 'Saving...' : 'Save Location Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LocationSetup;
