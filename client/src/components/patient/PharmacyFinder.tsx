import React, { useState, useEffect } from 'react';

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
  isActive: boolean;
  distance?: number;
}

interface SearchFilters {
  searchTerm: string;
  area: string;
  maxDistance: number;
  services: string[];
}

const PharmacyFinder: React.FC = () => {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [filteredPharmacies, setFilteredPharmacies] = useState<Pharmacy[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    searchTerm: '',
    area: '',
    maxDistance: 10,
    services: [],
  });

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

  useEffect(() => {
    getCurrentLocation();
    loadPharmacies();
  }, []);

  useEffect(() => {
    filterPharmacies();
  }, [pharmacies, searchFilters, userLocation]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const loadPharmacies = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const url = new URL('http://localhost:4000/api/pharmacies/for-patients');
      if (userLocation) {
        url.searchParams.append('latitude', userLocation.lat.toString());
        url.searchParams.append('longitude', userLocation.lng.toString());
        url.searchParams.append('radius', searchFilters.maxDistance.toString());
      }

      console.log('Loading pharmacies from:', url.toString());

      const response = await fetch(url.toString());
      
      if (response.ok) {
        const data = await response.json();
        console.log('Received pharmacy data:', data);
        console.log('Data is array:', Array.isArray(data));
        console.log('Data length:', data.length);
        
        if (Array.isArray(data) && data.length > 0) {
          console.log('Sample pharmacy:', data[0]);
        }
        
        setPharmacies(Array.isArray(data) ? data : []);
      } else {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        setError(`Failed to load pharmacies: ${errorData.error || 'Unknown error'}`);
        setPharmacies([]);
      }
    } catch (error) {
      console.error('Error loading pharmacies:', error);
      setError('Network error occurred. Please check if the server is running.');
      setPharmacies([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterPharmacies = () => {
    console.log('Filtering pharmacies. Total pharmacies:', pharmacies.length);
    console.log('Search filters:', searchFilters);
    
    let filtered = [...pharmacies];

    // Filter by search term (name or area)
    if (searchFilters.searchTerm) {
      const term = searchFilters.searchTerm.toLowerCase();
      const beforeCount = filtered.length;
      filtered = filtered.filter(pharmacy =>
        pharmacy.name.toLowerCase().includes(term) ||
        pharmacy.address.toLowerCase().includes(term) ||
        pharmacy.city.toLowerCase().includes(term) ||
        pharmacy.state.toLowerCase().includes(term) ||
        pharmacy.pincode.includes(term)
      );
      console.log(`After search term filter: ${filtered.length} (was ${beforeCount})`);
    }

    // Filter by area
    if (searchFilters.area) {
      const area = searchFilters.area.toLowerCase();
      const beforeCount = filtered.length;
      filtered = filtered.filter(pharmacy =>
        pharmacy.city.toLowerCase().includes(area) ||
        pharmacy.address.toLowerCase().includes(area) ||
        pharmacy.pincode.includes(area)
      );
      console.log(`After area filter: ${filtered.length} (was ${beforeCount})`);
    }

    // Filter by distance
    if (userLocation && searchFilters.maxDistance > 0) {
      const beforeCount = filtered.length;
      filtered = filtered.filter(pharmacy => 
        !pharmacy.distance || pharmacy.distance <= searchFilters.maxDistance
      );
      console.log(`After distance filter: ${filtered.length} (was ${beforeCount})`);
    }

    // Filter by services
    if (searchFilters.services.length > 0) {
      const beforeCount = filtered.length;
      filtered = filtered.filter(pharmacy =>
        searchFilters.services.some(service => 
          pharmacy.services && pharmacy.services.includes(service)
        )
      );
      console.log(`After services filter: ${filtered.length} (was ${beforeCount})`);
    }

    // Sort by distance if available
    filtered.sort((a, b) => {
      if (a.distance && b.distance) {
        return a.distance - b.distance;
      }
      return a.name.localeCompare(b.name);
    });

    console.log('Final filtered pharmacies:', filtered.length);
    console.log('Filtered pharmacies data:', filtered);
    setFilteredPharmacies(filtered);
  };

  const handleSearchChange = (field: keyof SearchFilters, value: any) => {
    setSearchFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleServiceToggle = (service: string) => {
    setSearchFilters(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const getCurrentDayHours = (operatingHours: any) => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[new Date().getDay()];
    const hours = operatingHours[today];
    
    if (!hours || !hours.isOpen) {
      return 'Closed today';
    }
    
    return `${hours.open} - ${hours.close}`;
  };

  const isCurrentlyOpen = (operatingHours: any) => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[new Date().getDay()];
    const hours = operatingHours[today];
    
    if (!hours || !hours.isOpen) {
      return false;
    }
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [openHour, openMin] = hours.open.split(':').map(Number);
    const [closeHour, closeMin] = hours.close.split(':').map(Number);
    const openTime = openHour * 60 + openMin;
    const closeTime = closeHour * 60 + closeMin;
    
    return currentTime >= openTime && currentTime <= closeTime;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Nearby Pharmacies</h1>
          <p className="text-gray-600">Locate pharmacies in your area and check medicine availability</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search by Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search by Name
              </label>
              <input
                type="text"
                value={searchFilters.searchTerm}
                onChange={(e) => handleSearchChange('searchTerm', e.target.value)}
                placeholder="Pharmacy name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Search by Area */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search by Area
              </label>
              <input
                type="text"
                value={searchFilters.area}
                onChange={(e) => handleSearchChange('area', e.target.value)}
                placeholder="City, area, or pincode..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Distance Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Distance (km)
              </label>
              <select
                value={searchFilters.maxDistance}
                onChange={(e) => handleSearchChange('maxDistance', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={20}>20 km</option>
                <option value={50}>50 km</option>
                <option value={100}>100 km</option>
              </select>
            </div>

            {/* Refresh Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <button
                onClick={getCurrentLocation}
                className="w-full px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                📍 Update Location
              </button>
            </div>
          </div>

          {/* Services Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Services
            </label>
            <div className="flex flex-wrap gap-2">
              {availableServices.map((service) => (
                <button
                  key={service}
                  onClick={() => handleServiceToggle(service)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    searchFilters.services.includes(service)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {service}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-4 flex justify-between items-center">
          <div>
            <p className="text-gray-600">
              Found {filteredPharmacies.length} pharmacies
              {userLocation && ' near you'}
            </p>
            <p className="text-xs text-gray-500">
              Total in database: {pharmacies.length} | Filtered: {filteredPharmacies.length}
            </p>
          </div>
          <button
            onClick={loadPharmacies}
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 transition-colors"
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
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
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {/* Pharmacy Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPharmacies.map((pharmacy) => (
            <div key={pharmacy.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {/* Header */}
              <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-white">{pharmacy.name}</h3>
                    <p className="text-indigo-100 text-sm">{pharmacy.pharmacistName}</p>
                  </div>
                  <div className="text-right">
                    {pharmacy.distance && (
                      <span className="bg-white text-indigo-600 px-2 py-1 rounded-full text-xs font-medium">
                        {pharmacy.distance.toFixed(1)} km
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Address */}
                <div className="mb-3">
                  <div className="flex items-start">
                    <svg className="w-4 h-4 text-gray-400 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div className="text-sm text-gray-600">
                      <p>{pharmacy.address}</p>
                      <p>{pharmacy.city}, {pharmacy.state} {pharmacy.pincode}</p>
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div className="mb-3 space-y-1">
                  {pharmacy.phone && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-sm text-gray-600">{pharmacy.phone}</span>
                    </div>
                  )}
                </div>

                {/* Operating Hours */}
                <div className="mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Today:</span>
                    <div className="flex items-center">
                      <span className={`w-2 h-2 rounded-full mr-2 ${
                        isCurrentlyOpen(pharmacy.operatingHours) ? 'bg-green-500' : 'bg-red-500'
                      }`}></span>
                      <span className="text-sm text-gray-600">
                        {getCurrentDayHours(pharmacy.operatingHours)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Services */}
                {pharmacy.services && pharmacy.services.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Services:</p>
                    <div className="flex flex-wrap gap-1">
                      {pharmacy.services.slice(0, 3).map((service, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                        >
                          {service}
                        </span>
                      ))}
                      {pharmacy.services.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          +{pharmacy.services.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2">
                  <button className="flex-1 px-3 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors">
                    View Details
                  </button>
                  {pharmacy.phone && (
                    <a
                      href={`tel:${pharmacy.phone}`}
                      className="px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                    >
                      📞 Call
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Debug Info */}
        {true && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">Debug Info:</h4>
            <div className="text-xs text-yellow-700 space-y-1">
              <p>Total pharmacies loaded: {pharmacies.length}</p>
              <p>Filtered pharmacies: {filteredPharmacies.length}</p>
              <p>User location: {userLocation ? `${userLocation.lat}, ${userLocation.lng}` : 'Not set'}</p>
              <p>Max distance: {searchFilters.maxDistance}km</p>
              <p>Search term: "{searchFilters.searchTerm}"</p>
              <p>Area filter: "{searchFilters.area}"</p>
              <p>Service filters: {searchFilters.services.length}</p>
              <p>Is loading: {isLoading ? 'Yes' : 'No'}</p>
              <p>Error: {error || 'None'}</p>
            </div>
          </div>
        )}

        {/* No Results */}
        {!isLoading && filteredPharmacies.length === 0 && pharmacies.length > 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pharmacies found</h3>
            <p className="text-gray-600 mb-4">
              Found {pharmacies.length} pharmacies in database, but none match your current filters.
              Try adjusting your search criteria or increasing the search radius.
            </p>
            <button
              onClick={() => setSearchFilters({
                searchTerm: '',
                area: '',
                maxDistance: 50,
                services: [],
              })}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* No Data at All */}
        {!isLoading && pharmacies.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pharmacies available</h3>
            <p className="text-gray-600 mb-4">
              No pharmacies have been registered yet. Please check back later or contact support.
            </p>
            <button
              onClick={loadPharmacies}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PharmacyFinder;
