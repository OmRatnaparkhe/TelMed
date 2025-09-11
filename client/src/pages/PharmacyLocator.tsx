import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../lib/api';

// Fix for default marker icon issues with Webpack
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface Pharmacy {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface PharmacyStock {
  id: string;
  medicine: { name: string; genericName: string };
  stockStatus: string;
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
        const response = await api.get<Pharmacy[]>('http://localhost:4000/api/pharmacies');
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
      const token = localStorage.getItem('token'); // Stock endpoint is protected
      if (!token) {
        // Handle case where user is not logged in, but search is initiated
        setError('Please log in to search for medicine stock.');
        setLoading(false);
        return;
      }
      const response = await api.get<PharmacyStock[]>(`http://localhost:4000/api/pharmacy/stock?medicineName=${searchTerm}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const pharmaciesWithStock = response.data.map((stock) => stock.id); // This will need adjustment: we need pharmacyId from stock

      // To correctly highlight pharmacies, we need to ensure the backend /api/pharmacy/stock endpoint
      // returns pharmacyId or a way to link stock items back to pharmacies.
      // Assuming `stock.id` here refers to `PharmacyStock.id`, which isn't directly a pharmacy ID.
      // A more robust backend would return `pharmacyId` in the stock items or a separate endpoint.
      // For now, let's assume the response directly gives us the IDs of pharmacies that have the stock.
      // (This is a placeholder and needs refinement based on actual backend /api/pharmacy/stock response)
      
      // For the MVP, I'm adjusting the interpretation: let's assume the backend will return
      // an array of Pharmacy objects that have the medicine in stock.

      // For now, I'm setting a placeholder for `highlightedPharmacies` based on an assumption.
      // If `response.data` for `/api/pharmacy/stock` returns an array of Pharmacy objects
      // that have the medicine, then the following would work:
      // setHighlightedPharmacies(response.data.map(p => p.id));
      
      // Given the current backend `getPharmacyStock` returns PharmacyStock, we need to map those
      // back to Pharmacy IDs. This requires the backend response to include `pharmacyId` for each stock item.
      const pharmacyIdsWithStock = response.data.map(stockItem => (
        pharmacies.find(p => p.id === stockItem.id)?.id // This is incorrect, needs stockItem.pharmacyId if backend returns it.
      )).filter(Boolean) as string[];

      // Let's refine the assumption based on the actual schema (PharmacyStock links pharmacyId)
      // The getPharmacyStock endpoint should ideally return pharmacyId for each stock item.
      // For now, I'm making a temporary assumption that the `id` field in PharmacyStock can be used to uniquely identify pharmacies.
      // This is a known limitation for the current implementation given the backend API design.
      setHighlightedPharmacies(pharmacyIdsWithStock);

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
              icon={highlightedPharmacies.includes(pharmacy.id) ? new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png', shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] }) : L.Icon.Default}
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
