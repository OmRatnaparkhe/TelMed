# TelMed Pharmacy Location System

## Overview
This document outlines the complete pharmacy location system implementation for TelMed, including database schema updates, API endpoints, and user interfaces for both pharmacists and patients.

## Features Implemented

### 🏥 Pharmacist Features
1. **Location Setup & Management**
   - Complete pharmacy profile setup with location coordinates
   - Interactive map integration with draggable markers
   - Operating hours configuration for each day of the week
   - Services offered selection and management
   - Address validation and geocoding support

2. **Pharmacy Profile Display**
   - Current location display with edit options
   - Real-time operating status indicators
   - Contact information management
   - Services showcase

### 👨‍⚕️ Patient Features
1. **Pharmacy Finder**
   - Location-based pharmacy search with distance calculation
   - Search by pharmacy name, area, or pincode
   - Filter by services offered (home delivery, 24/7 emergency, etc.)
   - Real-time operating hours display
   - Distance-based sorting from user location

2. **Advanced Search & Filtering**
   - Dynamic search with multiple criteria
   - Service-based filtering
   - Distance radius selection (5km to 100km)
   - Real-time availability status

## Database Schema Updates

### Updated Pharmacy Model
```prisma
model Pharmacy {
  id            String  @id @default(uuid())
  name          String
  address       String
  city          String?
  state         String?
  pincode       String?
  latitude      Float
  longitude     Float
  phone         String?
  email         String?
  operatingHours Json?   // Store operating hours as JSON
  services      Json?    // Store services as JSON array
  isActive      Boolean @default(true)
  pharmacistId  String? @unique

  pharmacist    PharmacistProfile?
  stocks        PharmacyStock[]
  MedicineBatch MedicineBatch[]
  prescriptions Prescription[]
}
```

## API Endpoints

### Pharmacist Endpoints
- `GET /api/pharmacy/location` - Get pharmacy location details
- `PUT /api/pharmacy/location` - Update pharmacy location and details

### Patient Endpoints
- `GET /api/pharmacies/for-patients` - Get all pharmacies with location data
  - Query parameters: `latitude`, `longitude`, `radius`
  - Returns pharmacies sorted by distance with full details

## Components Created

### Pharmacist Components
1. **LocationSetup.tsx** - Enhanced with proper database integration
2. **PharmacyProfile.tsx** - New component showing current location with edit option
3. **LeafletMap.tsx** - Interactive map component (already existed)

### Patient Components
1. **PharmacyFinder.tsx** - Complete pharmacy search and discovery interface
2. **PatientDashboard.tsx** - Dashboard with pharmacy finder access

## Key Features

### 🗺️ Interactive Maps
- Leaflet.js integration for interactive maps
- Draggable markers for precise location setting
- Real-time coordinate display
- Automatic geocoding from address

### 📍 Location Services
- GPS-based current location detection
- Distance calculation using Haversine formula
- Radius-based pharmacy filtering
- Real-time location updates

### ⏰ Operating Hours Management
- Day-wise operating hours configuration
- Real-time open/closed status calculation
- Today's hours display for patients
- Visual indicators for current status

### 🔍 Advanced Search
- Multi-criteria search (name, area, pincode)
- Service-based filtering
- Distance-based sorting
- Real-time search results

### 📱 Responsive Design
- Mobile-first responsive design
- Touch-friendly interface
- Optimized for all screen sizes
- Modern gradient backgrounds and card layouts

## Installation & Setup

### Prerequisites
- Node.js and npm installed
- PostgreSQL database running
- Prisma CLI installed

### Database Setup
1. Update the Prisma schema with the new Pharmacy model
2. Run database migration:
   ```bash
   cd server
   npx prisma db push
   npx prisma generate
   ```

### Dependencies
The following dependencies are already included:
- `leaflet` - Interactive maps
- `react-leaflet` - React Leaflet components
- `@types/leaflet` - TypeScript definitions

### Frontend Setup
1. The Leaflet CSS and JS are already included in `index.html`
2. All components are ready to use
3. No additional installation required

## Usage Instructions

### For Pharmacists
1. **Initial Setup**:
   - Navigate to Location Setup from the pharmacist dashboard
   - Fill in pharmacy details (name, address, contact info)
   - Set location using current GPS or address geocoding
   - Configure operating hours for each day
   - Select services offered

2. **Managing Location**:
   - View current location in Pharmacy Profile
   - Click "Edit Location" to modify details
   - Drag map marker to adjust precise location
   - Update operating hours and services as needed

### For Patients
1. **Finding Pharmacies**:
   - Access Pharmacy Finder from patient dashboard
   - Allow location access for distance-based results
   - Use search filters to find specific pharmacies
   - View real-time operating status

2. **Search Options**:
   - Search by pharmacy name
   - Search by area/city/pincode
   - Filter by maximum distance
   - Filter by required services

## Technical Implementation

### Distance Calculation
Uses the Haversine formula for accurate distance calculation:
```javascript
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
```

### Real-time Status Calculation
Operating hours are calculated in real-time:
```javascript
const isCurrentlyOpen = (operatingHours) => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = days[new Date().getDay()];
  const hours = operatingHours[today];
  
  if (!hours || !hours.isOpen) return false;
  
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const [openHour, openMin] = hours.open.split(':').map(Number);
  const [closeHour, closeMin] = hours.close.split(':').map(Number);
  const openTime = openHour * 60 + openMin;
  const closeTime = closeHour * 60 + closeMin;
  
  return currentTime >= openTime && currentTime <= closeTime;
};
```

## Error Handling

### Database Errors
- Graceful fallback to mock data when database is unavailable
- Proper error messages for users
- Retry mechanisms for network failures

### Location Errors
- Handles GPS permission denied
- Fallback options when geolocation is unavailable
- Manual coordinate entry option

### Validation
- Required field validation
- Coordinate range validation
- Phone number and email format validation

## Future Enhancements

### Planned Features
1. **Medicine Availability Integration**
   - Real-time stock checking
   - Medicine search across pharmacies
   - Availability notifications

2. **Advanced Mapping**
   - Route planning to pharmacy
   - Traffic-aware directions
   - Multiple pharmacy route optimization

3. **Enhanced Filtering**
   - Price-based filtering
   - Rating and review system
   - Insurance acceptance filtering

4. **Notifications**
   - Push notifications for pharmacy status changes
   - Reminder notifications for medicine pickup
   - Emergency pharmacy alerts

## Troubleshooting

### Common Issues
1. **Map not loading**: Ensure Leaflet CSS and JS are properly included
2. **Location not working**: Check browser permissions for geolocation
3. **Database errors**: Verify Prisma client is generated after schema changes
4. **TypeScript errors**: Run `npx prisma generate` to update types

### Performance Optimization
- Implement caching for pharmacy data
- Use pagination for large result sets
- Optimize map rendering for mobile devices
- Implement lazy loading for pharmacy images

## Security Considerations
- Validate all location data on server side
- Sanitize user inputs for search queries
- Implement rate limiting for location APIs
- Secure pharmacy profile updates with proper authentication

## Conclusion
The TelMed Pharmacy Location System provides a comprehensive solution for pharmacy discovery and management. It offers both pharmacists and patients powerful tools for location-based services with real-time data and intuitive interfaces.
