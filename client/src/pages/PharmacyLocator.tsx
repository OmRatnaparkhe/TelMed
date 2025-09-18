import React, { useState, useEffect } from 'react';
import api from '../lib/api';

interface Pharmacy {
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
  pharmacistName: string;
  operatingHours: {
    [key: string]: { open: string; close: string; isOpen: boolean };
  };
  services: string[];
  distance?: number;
}


const PharmacyLocator: React.FC = () => {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [filteredPharmacies, setFilteredPharmacies] = useState<Pharmacy[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [showPharmacyDetails, setShowPharmacyDetails] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      // Request high accuracy location
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          console.log('Real-time location obtained:', location);
          console.log('Location accuracy:', position.coords.accuracy, 'meters');
        },
        (error) => {
          console.error('Error getting user location:', error);
          // Try to get location with lower accuracy requirements
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const location = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              };
              setUserLocation(location);
              console.log('Fallback location obtained:', location);
            },
            (fallbackError) => {
              console.error('Fallback location also failed:', fallbackError);
              // Set default location if all attempts fail
              setUserLocation({ lat: 18.5245, lng: 73.8527 }); // Pune coordinates
            },
            {
              enableHighAccuracy: false,
              timeout: 10000,
              maximumAge: 300000 // 5 minutes
            }
          );
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000 // 1 minute
        }
      );
    } else {
      console.log('Geolocation is not supported by this browser');
      // Set default location if geolocation is not supported
      setUserLocation({ lat: 18.5245, lng: 73.8527 }); // Pune coordinates
    }
  };

  useEffect(() => {
    if (userLocation) {
      fetchPharmacies();
    }
  }, [userLocation]);

  useEffect(() => {
    filterPharmacies();
  }, [pharmacies, searchTerm]);

  const fetchPharmacies = async () => {
    if (!userLocation) return;
    
    try {
      setLoading(true);
      console.log('Fetching pharmacies for location:', userLocation);
      
      // Use the new endpoint that includes location data and distance calculation
      const params = new URLSearchParams();
      params.append('latitude', userLocation.lat.toString());
      params.append('longitude', userLocation.lng.toString());
      params.append('radius', '50'); // 50km radius
      
      const url = `/api/pharmacies/for-patients?${params.toString()}`;
      console.log('Fetching from URL:', url);
      
      const response = await api.get<Pharmacy[]>(url);
      console.log('Received pharmacies:', response.data);
      setPharmacies(response.data);
      setError(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to fetch pharmacies';
      setError(errorMessage);
      console.error('Error fetching pharmacies:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterPharmacies = () => {
    let filtered = [...pharmacies];
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(pharmacy =>
        pharmacy.name.toLowerCase().includes(term) ||
        pharmacy.address.toLowerCase().includes(term) ||
        pharmacy.city.toLowerCase().includes(term) ||
        pharmacy.state.toLowerCase().includes(term) ||
        pharmacy.pincode.includes(term) ||
        (pharmacy.pharmacistName && pharmacy.pharmacistName.toLowerCase().includes(term))
      );
    }
    
    setFilteredPharmacies(filtered);
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      return;
    }
    // For simplified UI, we just filter the existing pharmacies
    filterPharmacies();
  };

  const handlePharmacyClick = (pharmacy: Pharmacy) => {
    setSelectedPharmacy(pharmacy);
    setShowPharmacyDetails(true);
  };

  const handleStartNavigation = (pharmacy: Pharmacy) => {
    // Create a comprehensive Google Maps URL with origin and destination
    let googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude},${pharmacy.longitude}&travelmode=driving`;
    
    // Add origin if user location is available
    if (userLocation) {
      googleMapsUrl += `&origin=${userLocation.lat},${userLocation.lng}`;
    }
    
    // Add destination name for better context
    googleMapsUrl += `&destination_place_id=${encodeURIComponent(pharmacy.name)}`;
    
    // Open in new tab
    window.open(googleMapsUrl, '_blank');
    
    // Also provide alternative navigation options
    const confirmNavigation = window.confirm(
      `Navigate to ${pharmacy.name}?\n\n` +
      `📍 Distance: ${pharmacy.distance ? pharmacy.distance.toFixed(1) + ' km' : 'Unknown'}\n` +
      `📞 Phone: ${pharmacy.phone || 'Not available'}\n` +
      `🏠 Address: ${pharmacy.address}\n\n` +
      `Click OK to open Google Maps, or Cancel to copy address to clipboard.`
    );
    
    if (!confirmNavigation) {
      // Copy address to clipboard as alternative
      navigator.clipboard.writeText(pharmacy.address).then(() => {
        alert(`Address copied to clipboard:\n${pharmacy.address}`);
      }).catch(() => {
        // Fallback if clipboard API is not available
        prompt('Copy this address:', pharmacy.address);
      });
    }
  };

  const getCurrentDay = () => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date().getDay()];
  };

  const isPharmacyOpen = (pharmacy: Pharmacy) => {
    const today = getCurrentDay();
    const todayHours = pharmacy.operatingHours[today];
    if (!todayHours || !todayHours.isOpen) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [openHour, openMin] = todayHours.open.split(':').map(Number);
    const [closeHour, closeMin] = todayHours.close.split(':').map(Number);
    const openTime = openHour * 60 + openMin;
    const closeTime = closeHour * 60 + closeMin;

    return currentTime >= openTime && currentTime <= closeTime;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p>Loading pharmacies...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen flex items-center justify-center text-red-600">
      <div className="text-center">
        <p className="mb-4">{error}</p>
        <button 
          onClick={fetchPharmacies}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    </div>
  );


  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Simple Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Find Nearby Pharmacies</h1>
          <p className="text-gray-600">Discover pharmacies around you with real-time availability</p>
        </div>

        {/* Simple Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search for medicine or pharmacy..."
              className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Simple Results Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Nearby Pharmacies</h2>
            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
              {(searchTerm ? filteredPharmacies : pharmacies).length}
            </span>
          </div>
          <button 
            onClick={getCurrentLocation}
            disabled={loading}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            📍 Update Location
          </button>
        </div>

        {/* Simple Pharmacy Cards */}
        <div className="space-y-4">
          {(searchTerm ? filteredPharmacies : pharmacies).map((pharmacy) => (
            <div key={pharmacy.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              {/* Card Header with Gradient */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">{pharmacy.name}</h3>
                    <p className="text-blue-100 text-sm">{pharmacy.pharmacistName || 'Licensed Pharmacist'}</p>
                  </div>
                  <div className="ml-3">
                    {isPharmacyOpen(pharmacy) ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500 text-white">
                        Open
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500 text-white">
                        Closed
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4">
                {/* Address */}
                <div className="flex items-start space-x-2 mb-3">
                  <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-sm text-gray-600">{pharmacy.address}</p>
                </div>

                {/* Phone */}
                {pharmacy.phone && (
                  <div className="flex items-center space-x-2 mb-4">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-sm text-gray-600">{pharmacy.phone}</span>
                  </div>
                )}

                {/* Services */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Available Services:</p>
                  <div className="flex flex-wrap gap-2">
                    {pharmacy.services?.slice(0, 2).map((service, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800">
                        {service}
                      </span>
                    ))}
                    {pharmacy.services && pharmacy.services.length > 2 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                        +{pharmacy.services.length - 2} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleStartNavigation(pharmacy)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                  >
                    <span>🧭</span>
                    <span>Navigate</span>
                  </button>
                  <button
                    onClick={() => handlePharmacyClick(pharmacy)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                  >
                    <span>ℹ️</span>
                    <span>Details</span>
                  </button>
                  {pharmacy.phone && (
                    <a
                      href={`tel:${pharmacy.phone}`}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                    >
                      <span>📞</span>
                      <span>Call</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results Message */}
        {searchTerm && filteredPharmacies.length === 0 && pharmacies.length > 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No pharmacies found</h3>
            <p className="text-gray-600 mb-4">
              No pharmacies match your search for "{searchTerm}". Try a different search term.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* No Pharmacies Available */}
        {pharmacies.length === 0 && !loading && (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg">
            <div className="text-6xl mb-4">🏥</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No pharmacies available</h3>
            <p className="text-gray-600 mb-4">
              No pharmacies found in your area. Please try refreshing or check back later.
            </p>
            <button
              onClick={fetchPharmacies}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Refresh
            </button>
          </div>
        )}
      </div>

      {/* Pharmacy Details Modal */}
      {showPharmacyDetails && selectedPharmacy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{selectedPharmacy.name}</h2>
                <button
                  onClick={() => setShowPharmacyDetails(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                  <div className="space-y-2">
                    <p className="flex items-center text-sm">
                      <span className="font-medium w-20">Address:</span>
                      <span>{selectedPharmacy.address}</span>
                    </p>
                    {selectedPharmacy.phone && (
                      <p className="flex items-center text-sm">
                        <span className="font-medium w-20">Phone:</span>
                        <a href={`tel:${selectedPharmacy.phone}`} className="text-blue-600 hover:underline">
                          {selectedPharmacy.phone}
                        </a>
                      </p>
                    )}
                    {selectedPharmacy.email && (
                      <p className="flex items-center text-sm">
                        <span className="font-medium w-20">Email:</span>
                        <a href={`mailto:${selectedPharmacy.email}`} className="text-blue-600 hover:underline">
                          {selectedPharmacy.email}
                        </a>
                      </p>
                    )}
                    {selectedPharmacy.pharmacistName && (
                      <p className="flex items-center text-sm">
                        <span className="font-medium w-20">Pharmacist:</span>
                        <span>{selectedPharmacy.pharmacistName}</span>
                      </p>
                    )}
                    {selectedPharmacy.distance && (
                      <p className="flex items-center text-sm">
                        <span className="font-medium w-20">Distance:</span>
                        <span className="text-blue-600">{selectedPharmacy.distance} km away</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Operating Hours */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Operating Hours</h3>
                  <div className="space-y-1">
                    {Object.entries(selectedPharmacy.operatingHours).map(([day, hours]) => (
                      <div key={day} className="flex justify-between text-sm">
                        <span className="capitalize font-medium">{day}:</span>
                        <span className={day === getCurrentDay() ? 'font-semibold text-blue-600' : ''}>
                          {hours.isOpen ? `${hours.open} - ${hours.close}` : 'Closed'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Services */}
              {selectedPharmacy.services.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Available Services</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPharmacy.services.map((service, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6 pt-4 border-t">
                <button
                  onClick={() => handleStartNavigation(selectedPharmacy)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors"
                >
                  🧭 Start Navigation
                </button>
                <button
                  onClick={() => window.open(`tel:${selectedPharmacy.phone}`, '_self')}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md transition-colors"
                  disabled={!selectedPharmacy.phone}
                >
                  📞 Call Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacyLocator;
