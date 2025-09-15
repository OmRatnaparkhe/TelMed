# TelMed Database Structure for Pharmacist Data

## Overview
This document outlines the complete database structure needed to store all pharmacist-related data from the TelMed application.

## Database Tables

### 1. Users Table (Extended for Pharmacists)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('PATIENT', 'DOCTOR', 'PHARMACIST') NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  date_of_birth DATE,
  gender ENUM('male', 'female', 'other'),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  emergency_contact VARCHAR(20),
  profile_image TEXT, -- Base64 or URL
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 2. Pharmacist Profiles Table
```sql
CREATE TABLE pharmacist_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  license_number VARCHAR(50) UNIQUE NOT NULL,
  pharmacy_name VARCHAR(200) NOT NULL,
  specialization VARCHAR(200),
  experience_years INTEGER,
  qualifications TEXT,
  is_verified BOOLEAN DEFAULT false,
  verification_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 3. Pharmacy Locations Table
```sql
CREATE TABLE pharmacy_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacist_id UUID REFERENCES pharmacist_profiles(id) ON DELETE CASCADE,
  pharmacy_name VARCHAR(200) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(10) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone VARCHAR(20),
  email VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 4. Operating Hours Table
```sql
CREATE TABLE operating_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_location_id UUID REFERENCES pharmacy_locations(id) ON DELETE CASCADE,
  day_of_week ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday') NOT NULL,
  is_open BOOLEAN DEFAULT true,
  opening_time TIME,
  closing_time TIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE(pharmacy_location_id, day_of_week)
);
```

### 5. Pharmacy Services Table
```sql
CREATE TABLE pharmacy_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_location_id UUID REFERENCES pharmacy_locations(id) ON DELETE CASCADE,
  service_name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 6. Medicine Inventory Table
```sql
CREATE TABLE medicine_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacist_id UUID REFERENCES pharmacist_profiles(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(100),
  manufacturer VARCHAR(200),
  batch_number VARCHAR(50),
  expiry_date DATE,
  quantity INTEGER NOT NULL DEFAULT 0,
  min_stock_level INTEGER DEFAULT 10,
  unit_price DECIMAL(10, 2),
  mrp DECIMAL(10, 2),
  description TEXT,
  status ENUM('in_stock', 'low_stock', 'out_of_stock', 'expired') DEFAULT 'in_stock',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 7. Orders Table
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  patient_id UUID REFERENCES users(id),
  pharmacist_id UUID REFERENCES pharmacist_profiles(id),
  pharmacy_location_id UUID REFERENCES pharmacy_locations(id),
  status ENUM('pending', 'processing', 'ready', 'delivered', 'cancelled') DEFAULT 'pending',
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
  delivery_type ENUM('pickup', 'home_delivery') DEFAULT 'pickup',
  delivery_address TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 8. Order Items Table
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  medicine_id UUID REFERENCES medicine_inventory(id),
  medicine_name VARCHAR(200) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints Structure

### Authentication Endpoints
```javascript
// Login Response Structure
{
  "token": "jwt_token_here",
  "role": "PHARMACIST",
  "user": {
    "id": "uuid",
    "email": "pharmacist@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "role": "PHARMACIST"
  }
}
```

### Pharmacist Profile Endpoints
```javascript
// GET /api/pharmacist/profile
// PUT /api/pharmacist/profile
{
  "personalInfo": {
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "phone": "string",
    "dateOfBirth": "YYYY-MM-DD",
    "gender": "male|female|other",
    "emergencyContact": "string",
    "profileImage": "base64_string_or_url"
  },
  "professionalInfo": {
    "licenseNumber": "string",
    "pharmacyName": "string",
    "specialization": "string",
    "experienceYears": "number",
    "qualifications": "string"
  },
  "addressInfo": {
    "address": "string",
    "city": "string",
    "state": "string",
    "pincode": "string"
  }
}
```

### Pharmacy Location Endpoints
```javascript
// GET /api/pharmacist/location
// PUT /api/pharmacist/location
{
  "basicInfo": {
    "name": "string",
    "phone": "string",
    "email": "string"
  },
  "address": {
    "address": "string",
    "city": "string",
    "state": "string",
    "pincode": "string",
    "latitude": "number",
    "longitude": "number"
  },
  "operatingHours": {
    "monday": { "isOpen": true, "open": "09:00", "close": "21:00" },
    "tuesday": { "isOpen": true, "open": "09:00", "close": "21:00" },
    // ... other days
  },
  "services": ["Home Delivery", "24/7 Emergency", "Online Consultation"],
  "isActive": true
}
```

### Inventory Endpoints
```javascript
// GET /api/pharmacist/inventory
// POST /api/pharmacist/inventory
// PUT /api/pharmacist/inventory/:id
// DELETE /api/pharmacist/inventory/:id
{
  "id": "uuid",
  "name": "string",
  "category": "string",
  "manufacturer": "string",
  "batchNumber": "string",
  "expiryDate": "YYYY-MM-DD",
  "quantity": "number",
  "minStockLevel": "number",
  "unitPrice": "number",
  "mrp": "number",
  "description": "string",
  "status": "in_stock|low_stock|out_of_stock|expired"
}
```

## Data Validation Rules

### Required Fields
- **User Registration**: email, password, firstName, lastName, role
- **Pharmacist Profile**: licenseNumber, pharmacyName
- **Pharmacy Location**: name, address, city, state, pincode
- **Medicine Inventory**: name, quantity

### Validation Patterns
```javascript
const validationRules = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[+]?[\d\s\-\(\)]{10,}$/,
  pincode: /^\d{6}$/,
  licenseNumber: /^[A-Z0-9]{5,20}$/
};
```

## Migration Steps

1. **Create Tables**: Execute the SQL statements above
2. **Add Indexes**: 
   ```sql
   CREATE INDEX idx_users_email ON users(email);
   CREATE INDEX idx_users_role ON users(role);
   CREATE INDEX idx_pharmacist_license ON pharmacist_profiles(license_number);
   CREATE INDEX idx_pharmacy_location ON pharmacy_locations(latitude, longitude);
   CREATE INDEX idx_inventory_pharmacist ON medicine_inventory(pharmacist_id);
   CREATE INDEX idx_orders_pharmacist ON orders(pharmacist_id);
   ```
3. **Seed Data**: Insert default services and categories
4. **Update API**: Implement the endpoints structure above
5. **Test Integration**: Verify all CRUD operations work correctly

## Frontend Data Flow

1. **Registration**: Store user data in `users` and `pharmacist_profiles` tables
2. **Profile Management**: Update across `users`, `pharmacist_profiles` tables
3. **Location Setup**: Store in `pharmacy_locations`, `operating_hours`, `pharmacy_services`
4. **Inventory Management**: CRUD operations on `medicine_inventory`
5. **Order Processing**: Create records in `orders` and `order_items`

This structure supports all current pharmacist features and is extensible for future enhancements.
