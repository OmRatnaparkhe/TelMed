# Component Integration Guide

## Overview
This guide shows how to integrate the new pharmacy location components into your existing TelMed application.

## Components Created

### Pharmacist Components
1. **PharmacyProfile.tsx** - Shows current pharmacy location with edit option
2. **LocationSetup.tsx** - Enhanced existing component for location management
3. **LeafletMap.tsx** - Interactive map component (already existed)

### Patient Components
1. **PharmacyFinder.tsx** - Complete pharmacy search interface
2. **PatientDashboard.tsx** - Enhanced dashboard with pharmacy finder access

## Router Integration

### Add Routes to Your App Router

```tsx
// App.tsx or your main router file
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import new components
import PharmacyProfile from './components/pharmacist/PharmacyProfile';
import LocationSetup from './components/pharmacist/LocationSetup';
import PharmacyFinder from './components/patient/PharmacyFinder';
import PatientDashboard from './components/patient/PatientDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Existing routes */}
        
        {/* New Pharmacist Routes */}
        <Route 
          path="/pharmacist/pharmacy-profile" 
          element={<PharmacyProfile />} 
        />
        <Route 
          path="/pharmacist/location-setup" 
          element={<LocationSetup />} 
        />
        
        {/* New Patient Routes */}
        <Route 
          path="/patient/pharmacy-finder" 
          element={<PharmacyFinder />} 
        />
        <Route 
          path="/patient/dashboard" 
          element={<PatientDashboard />} 
        />
        
        {/* Existing routes */}
      </Routes>
    </Router>
  );
}
```

## Navigation Integration

### Pharmacist Dashboard Navigation

```tsx
// In your existing PharmacistDashboard.tsx
import { Link } from 'react-router-dom';

const PharmacistDashboard = () => {
  return (
    <div>
      {/* Existing dashboard content */}
      
      {/* Add these navigation cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Existing cards */}
        
        {/* New Pharmacy Location Cards */}
        <Link 
          to="/pharmacist/pharmacy-profile"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🏥</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 ml-3">
              Pharmacy Profile
            </h3>
          </div>
          <p className="text-gray-600">
            View and manage your pharmacy location and details
          </p>
        </Link>
        
        <Link 
          to="/pharmacist/location-setup"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📍</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 ml-3">
              Location Setup
            </h3>
          </div>
          <p className="text-gray-600">
            Set up or update your pharmacy location and services
          </p>
        </Link>
      </div>
    </div>
  );
};
```

### Patient Dashboard Navigation

```tsx
// In your existing PatientDashboard.tsx or use the new one
import { Link } from 'react-router-dom';

const PatientDashboard = () => {
  return (
    <div>
      {/* Existing dashboard content */}
      
      {/* Add pharmacy finder card */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Existing cards */}
        
        {/* New Pharmacy Finder Card */}
        <Link 
          to="/patient/pharmacy-finder"
          className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="h-32 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-lg flex items-center justify-center">
            <span className="text-4xl">🏥</span>
          </div>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Find Pharmacy
            </h3>
            <p className="text-gray-600 text-sm">
              Search for nearby pharmacies and check medicine availability
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
};
```

## Sidebar/Menu Integration

### Add to Pharmacist Sidebar

```tsx
// In your pharmacist sidebar component
const pharmacistMenuItems = [
  // Existing menu items
  {
    name: 'Pharmacy Profile',
    href: '/pharmacist/pharmacy-profile',
    icon: '🏥',
  },
  {
    name: 'Location Setup',
    href: '/pharmacist/location-setup',
    icon: '📍',
  },
  // Other existing items
];
```

### Add to Patient Sidebar

```tsx
// In your patient sidebar component
const patientMenuItems = [
  // Existing menu items
  {
    name: 'Find Pharmacy',
    href: '/patient/pharmacy-finder',
    icon: '🏥',
  },
  // Other existing items
];
```

## Authentication Integration

### Protected Routes

```tsx
// Add authentication wrapper if needed
import { ProtectedRoute } from './components/auth/ProtectedRoute';

<Route 
  path="/pharmacist/pharmacy-profile" 
  element={
    <ProtectedRoute role="PHARMACIST">
      <PharmacyProfile />
    </ProtectedRoute>
  } 
/>

<Route 
  path="/patient/pharmacy-finder" 
  element={
    <ProtectedRoute role="PATIENT">
      <PharmacyFinder />
    </ProtectedRoute>
  } 
/>
```

## Styling Integration

### Ensure Consistent Styling

The components use Tailwind CSS classes that match your existing design system:
- Gradient backgrounds: `bg-gradient-to-br from-blue-50 via-white to-purple-50`
- Card styling: `bg-white rounded-lg shadow-md`
- Button styling: `bg-indigo-600 text-white rounded-md hover:bg-indigo-700`

### Custom CSS (if needed)

```css
/* Add to your global CSS if you need custom styles */
.pharmacy-card {
  transition: transform 0.2s ease-in-out;
}

.pharmacy-card:hover {
  transform: translateY(-2px);
}

.map-container {
  border-radius: 0.5rem;
  overflow: hidden;
}
```

## State Management Integration

### If using Redux/Context

```tsx
// Example context integration
import { usePharmacyContext } from '../context/PharmacyContext';

const PharmacyProfile = () => {
  const { pharmacyData, updatePharmacyData } = usePharmacyContext();
  
  // Component logic
};
```

## API Integration

### Ensure API Base URL is Configured

```tsx
// In your API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

// The components use these endpoints:
// GET /api/pharmacy/location
// PUT /api/pharmacy/location
// GET /api/pharmacies/for-patients
```

## Testing Integration

### Component Tests

```tsx
// Example test file: PharmacyFinder.test.tsx
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PharmacyFinder from './PharmacyFinder';

test('renders pharmacy finder', () => {
  render(
    <BrowserRouter>
      <PharmacyFinder />
    </BrowserRouter>
  );
  
  expect(screen.getByText('Find Nearby Pharmacies')).toBeInTheDocument();
});
```

## Mobile Responsiveness

The components are fully responsive and work well on:
- Desktop (lg: classes)
- Tablet (md: classes)
- Mobile (default classes)

## Accessibility Features

All components include:
- Proper ARIA labels
- Keyboard navigation
- Screen reader support
- Focus management
- Color contrast compliance

## Performance Considerations

- Components use lazy loading where appropriate
- Map rendering is optimized for mobile
- API calls include proper error handling
- Loading states are implemented

## Next Steps

1. **Integrate the routes** into your existing router
2. **Add navigation links** to your dashboards
3. **Test the complete flow** from pharmacist setup to patient search
4. **Customize styling** to match your brand if needed
5. **Add any additional features** specific to your requirements

The components are designed to integrate seamlessly with your existing TelMed application architecture!
