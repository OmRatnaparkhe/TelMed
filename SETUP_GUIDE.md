# TelMed Pharmacy Location System - Setup Guide

## Quick Setup Steps

### 1. Database Setup
```bash
cd server
npx prisma db push
npx prisma generate
```

### 2. Start the Server
```bash
npm run dev
```

### 3. Start the Client
```bash
cd ../client
npm run dev
```

## Testing the System

### For Pharmacists:
1. **Login as Pharmacist**
   - Navigate to `/pharmacist/login`
   - Use pharmacist credentials

2. **Set Up Pharmacy Location**
   - Go to Location Setup from dashboard
   - Fill in pharmacy details
   - Use "Use Current Location" or "Get from Address"
   - Configure operating hours and services
   - Save location settings

3. **View Pharmacy Profile**
   - Navigate to Pharmacy Profile
   - Verify location is displayed correctly
   - Test "Edit Location" functionality

### For Patients:
1. **Access Pharmacy Finder**
   - Login as patient
   - Navigate to `/patient/pharmacy-finder`
   - Allow location access when prompted

2. **Test Search Features**
   - Search by pharmacy name
   - Search by area/city
   - Filter by services
   - Adjust distance radius
   - Verify real-time operating hours

## API Endpoints Testing

### Test Pharmacy Location APIs
```bash
# Get pharmacy location (requires auth token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:4000/api/pharmacy/location

# Update pharmacy location (requires auth token)
curl -X PUT \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test Pharmacy",
       "address": "123 Main St",
       "city": "New York",
       "state": "NY",
       "pincode": "10001",
       "latitude": 40.7128,
       "longitude": -74.0060,
       "phone": "+1-555-0123",
       "email": "test@pharmacy.com",
       "operatingHours": {
         "monday": {"open": "09:00", "close": "21:00", "isOpen": true}
       },
       "services": ["Home Delivery", "24/7 Emergency"]
     }' \
     http://localhost:4000/api/pharmacy/location

# Get pharmacies for patients (public endpoint)
curl "http://localhost:4000/api/pharmacies/for-patients?latitude=40.7128&longitude=-74.0060&radius=10"
```

## Troubleshooting

### Common Issues and Solutions

1. **TypeScript Errors in pharmacy.controller.ts**
   - Run `npx prisma generate` to update Prisma client types
   - The errors are expected until Prisma client is regenerated

2. **Map Not Loading**
   - Verify Leaflet CSS and JS are included in index.html
   - Check browser console for JavaScript errors

3. **Location Not Working**
   - Ensure HTTPS is used for geolocation (or localhost)
   - Check browser permissions for location access

4. **Database Connection Issues**
   - Verify DATABASE_URL in .env file
   - Ensure PostgreSQL is running
   - Run `npx prisma db push` to sync schema

## Component Integration

### Adding to Existing Routes
Add these routes to your router configuration:

```tsx
// For Pharmacist Routes
<Route path="/pharmacist/pharmacy-profile" element={<PharmacyProfile />} />
<Route path="/pharmacist/location-setup" element={<LocationSetup />} />

// For Patient Routes
<Route path="/patient/pharmacy-finder" element={<PharmacyFinder />} />
<Route path="/patient/dashboard" element={<PatientDashboard />} />
```

### Navigation Integration
Add navigation links to your existing dashboards:

```tsx
// In Pharmacist Dashboard
<Link to="/pharmacist/pharmacy-profile">Pharmacy Profile</Link>
<Link to="/pharmacist/location-setup">Location Setup</Link>

// In Patient Dashboard
<Link to="/patient/pharmacy-finder">Find Pharmacy</Link>
```

## Environment Variables
Ensure your `.env` file contains:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/telmed"
JWT_SECRET="your-jwt-secret"
PORT=4000
```

## Production Deployment

### Database Migration
```bash
npx prisma migrate deploy
```

### Build Commands
```bash
# Server
npm run build

# Client
npm run build
```

## Features Verification Checklist

### ✅ Pharmacist Features
- [ ] Location setup with GPS coordinates
- [ ] Interactive map with draggable markers
- [ ] Operating hours configuration
- [ ] Services selection
- [ ] Profile display with edit option
- [ ] Real-time status indicators

### ✅ Patient Features
- [ ] Location-based pharmacy search
- [ ] Distance calculation and sorting
- [ ] Multi-criteria filtering
- [ ] Real-time operating hours
- [ ] Service-based filtering
- [ ] Responsive mobile interface

### ✅ Technical Features
- [ ] Database integration
- [ ] API endpoints working
- [ ] Error handling
- [ ] TypeScript type safety
- [ ] Responsive design
- [ ] Map integration

## Next Steps

1. **Test the complete flow**:
   - Pharmacist sets up location
   - Patient searches for pharmacies
   - Verify distance calculations

2. **Add additional features**:
   - Medicine availability integration
   - Route planning
   - Push notifications

3. **Performance optimization**:
   - Implement caching
   - Add pagination
   - Optimize map rendering

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify API responses in Network tab
3. Ensure all dependencies are installed
4. Check database connection and schema

The system is now fully implemented and ready for testing!
