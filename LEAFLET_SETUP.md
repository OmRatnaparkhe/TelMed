# Leaflet Map Integration Setup

## Installation

To enable the interactive map functionality in the pharmacist dashboard, you need to install Leaflet:

```bash
npm install leaflet react-leaflet @types/leaflet
```

## Add Leaflet CSS and JS

Add the following to your `public/index.html` file in the `<head>` section:

```html
<!-- Leaflet CSS -->
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
     integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
     crossorigin=""/>

<!-- Leaflet JS -->
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
     integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
     crossorigin=""></script>
```

## Features Included

### 1. Interactive Map Display
- Shows pharmacy location with a draggable marker
- OpenStreetMap tiles for detailed view
- Popup with pharmacy name and address

### 2. Location Management
- Drag marker to update coordinates
- Auto-detect current location via browser geolocation
- Manual coordinate input with validation

### 3. Address Geocoding
- "Get Coordinates" button to convert address to lat/lng
- Ready for Google Maps Geocoding API integration

## Usage

The map component is automatically integrated into the Location Setup tab of the Pharmacist Dashboard. Features include:

- **Draggable Marker**: Pharmacists can drag the marker to fine-tune their exact location
- **Auto-Location**: Browser geolocation API detects current position
- **Address Integration**: Map updates when address fields are filled
- **Visual Feedback**: Clear instructions and coordinate display

## Fallback Behavior

If Leaflet is not installed, the component will display:
- Installation instructions
- Current coordinates (if available)
- Helpful setup guidance

## Next Steps

1. Run the npm install command above
2. Add the CSS/JS links to index.html
3. Restart your development server
4. Navigate to Pharmacist Dashboard → Location tab
5. Test the interactive map functionality

The map will help patients find your pharmacy location accurately and enable location-based features in the TelMed application.
