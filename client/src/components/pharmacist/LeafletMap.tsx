import React, { useEffect, useRef } from 'react';

// Note: This component requires Leaflet library to be installed
// Run: npm install leaflet react-leaflet @types/leaflet

interface LeafletMapProps {
  latitude: number;
  longitude: number;
  pharmacyName: string;
  address: string;
  onLocationChange?: (lat: number, lng: number) => void;
  height?: string;
}

const LeafletMap: React.FC<LeafletMapProps> = ({
  latitude,
  longitude,
  pharmacyName,
  address,
  onLocationChange,
  height = '400px'
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    // Check if Leaflet is available
    if (typeof window !== 'undefined' && (window as any).L) {
      const L = (window as any).L;
      
      // Initialize map if not already created
      if (!mapInstanceRef.current && mapRef.current) {
        mapInstanceRef.current = L.map(mapRef.current).setView([latitude, longitude], 15);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(mapInstanceRef.current);

        // Add marker
        markerRef.current = L.marker([latitude, longitude], {
          draggable: !!onLocationChange
        }).addTo(mapInstanceRef.current);

        // Add popup
        markerRef.current.bindPopup(`
          <div>
            <h3 style="margin: 0 0 8px 0; font-weight: bold;">${pharmacyName}</h3>
            <p style="margin: 0; font-size: 12px; color: #666;">${address}</p>
          </div>
        `).openPopup();

        // Handle marker drag if callback provided
        if (onLocationChange) {
          markerRef.current.on('dragend', (e: any) => {
            const position = e.target.getLatLng();
            onLocationChange(position.lat, position.lng);
          });
        }
      }
    }

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // Update marker position when coordinates change
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current && latitude && longitude) {
      const L = (window as any).L;
      const newLatLng = L.latLng(latitude, longitude);
      markerRef.current.setLatLng(newLatLng);
      mapInstanceRef.current.setView(newLatLng, 15);
      
      // Update popup content
      markerRef.current.setPopupContent(`
        <div>
          <h3 style="margin: 0 0 8px 0; font-weight: bold;">${pharmacyName}</h3>
          <p style="margin: 0; font-size: 12px; color: #666;">${address}</p>
        </div>
      `);
    }
  }, [latitude, longitude, pharmacyName, address]);

  // Check if Leaflet is loaded
  const isLeafletLoaded = typeof window !== 'undefined' && (window as any).L;

  if (!isLeafletLoaded) {
    return (
      <div 
        className="bg-gray-100 rounded-lg flex flex-col items-center justify-center p-8"
        style={{ height }}
      >
        <div className="text-center">
          <div className="text-4xl mb-4">🗺️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Leaflet Library Required</h3>
          <p className="text-gray-600 mb-4">To display the interactive map, please install Leaflet:</p>
          <div className="bg-gray-800 text-green-400 p-3 rounded-md font-mono text-sm">
            npm install leaflet react-leaflet @types/leaflet
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Then add Leaflet CSS to your index.html:
          </p>
          <div className="bg-gray-800 text-blue-400 p-3 rounded-md font-mono text-xs mt-2">
            {'<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />'}
            <br />
            {'<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>'}
          </div>
          {latitude && longitude && (
            <p className="text-xs text-indigo-600 mt-4">
              📍 Current coordinates: {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        style={{ height, width: '100%' }}
        className="rounded-lg border border-gray-300"
      />
      {onLocationChange && (
        <div className="absolute top-2 right-2 bg-white p-2 rounded-md shadow-md text-xs text-gray-600">
          💡 Drag marker to update location
        </div>
      )}
    </div>
  );
};

export default LeafletMap;
