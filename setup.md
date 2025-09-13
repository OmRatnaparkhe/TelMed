# TelMed Setup Instructions

## Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn package manager

## Environment Setup

### 1. Server Environment Variables
Create a `.env` file in the `TelMed/server/` directory with the following content:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/telemedicine_db"
JWT_SECRET="your_super_secret_jwt_key_here_change_in_production"
PORT=4000
```

### 2. Client Environment Variables (Optional)
Create a `.env` file in the `TelMed/client/` directory with the following content:

```env
VITE_API_BASE_URL=http://localhost:4000
```

## Database Setup

1. Create a PostgreSQL database named `telemedicine_db`
2. Update the `DATABASE_URL` in your server `.env` file with your actual database credentials

## Installation and Running

### 1. Install Dependencies

#### Server
```bash
cd TelMed/server
npm install
```

#### Client
```bash
cd TelMed/client
npm install
```

### 2. Database Migration
```bash
cd TelMed/server
npx prisma generate
npx prisma db push
```

### 3. Start the Application

#### Start Server (Terminal 1)
```bash
cd TelMed/server
npm run dev
```

#### Start Client (Terminal 2)
```bash
cd TelMed/client
npm run dev
```

## Access the Application

- Client: http://localhost:5173
- Server API: http://localhost:4000

## Default Routes

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user info

### Appointments
- GET `/api/appointments/my-appointments` - Get user's appointments
- POST `/api/appointments` - Create new appointment
- GET `/api/appointments/pending` - Get pending appointments (Doctor)
- PUT `/api/appointments/:id/approve` - Approve appointment (Doctor)
- PUT `/api/appointments/:id/reject` - Reject appointment (Doctor)
- PUT `/api/appointments/:id/complete` - Complete appointment (Doctor)

### Doctors
- GET `/api/doctors` - Get available doctors
- PUT `/api/doctors/me/status` - Update availability status (Doctor)

### Medical Records
- GET `/api/medical-records/me` - Get user's medical records
- POST `/api/medical-records` - Create medical record (Doctor)

### Symptoms
- POST `/api/symptoms/check` - Check symptoms with AI

### Pharmacy
- GET `/api/pharmacies` - Get all pharmacies
- GET `/api/pharmacy/stock` - Get pharmacy stock (Pharmacist)
- PUT `/api/pharmacy/stock/:stockId` - Update stock status (Pharmacist)

## User Roles
- PATIENT: Can book appointments, view medical history, use symptom checker
- DOCTOR: Can manage appointments, create medical records, conduct consultations
- PHARMACIST: Can manage pharmacy stock
- ADMIN: Full system access

## Troubleshooting

1. **Database Connection Issues**: Ensure PostgreSQL is running and the connection string is correct
2. **CORS Issues**: The server is configured to accept requests from http://localhost:5173
3. **Authentication Issues**: Ensure JWT_SECRET is set in the server environment
4. **Port Conflicts**: Make sure ports 4000 (server) and 5173 (client) are available
