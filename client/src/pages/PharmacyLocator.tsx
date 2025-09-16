import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../lib/api';

// Fix for default marker icon issues with Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Create icon instances
const defaultIcon = new L.Icon.Default();
const highlightedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface Pharmacy {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}


const PharmacyLocator: React.FC = () => {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedPharmacies, setHighlightedPharmacies] = useState<string[]>([]); // Array of pharmacy IDs
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        const response = await api.get<Pharmacy[]>('/api/pharmacies');
        setPharmacies(response.data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch pharmacies');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPharmacies();
  }, []);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setHighlightedPharmacies([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Use the new public endpoint that doesn't require authentication
      const response = await api.get(`/api/pharmacies/search?medicineName=${searchTerm}`);
      const pharmaciesWithStock = response.data.map((item: any) => item.pharmacyId);
      setHighlightedPharmacies(pharmaciesWithStock);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to search for medicine stock');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Loading pharmacies...</p></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600"><p>{error}</p></div>;

  const defaultCenter: [number, number] = [34.0522, -118.2437]; // Default to Los Angeles, or a more relevant default

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex flex-col">
      <div className="max-w-4xl mx-auto w-full bg-white p-6 rounded-lg shadow-md mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Pharmacy Locator</h1>

        <div className="flex space-x-2 mb-4">
          <input
            type="text"
            placeholder="Search for medicine..."
            className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
          <button
            onClick={handleSearch}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300"
          >
            Search
          </button>
        </div>
      </div>

      <div className="flex-grow max-w-4xl mx-auto w-full rounded-lg shadow-md overflow-hidden">
        <MapContainer center={defaultCenter} zoom={10} scrollWheelZoom={false} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {pharmacies.map((pharmacy) => (
            <Marker
              key={pharmacy.id}
              position={[pharmacy.latitude, pharmacy.longitude]}
              icon={highlightedPharmacies.includes(pharmacy.id) ? highlightedIcon : defaultIcon}
            >
              <Popup>
                <h3 className="font-bold">{pharmacy.name}</h3>
                <p>{pharmacy.address}</p>
                {highlightedPharmacies.includes(pharmacy.id) && (
                  <p className="text-green-600 font-semibold">Medicine in stock!</p>
                )}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default PharmacyLocator;
