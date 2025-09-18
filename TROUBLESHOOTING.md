# Troubleshooting Guide - Pharmacy Location API

## Error: 500 Internal Server Error on /api/pharmacy/location

### Possible Causes and Solutions

### 1. **Prisma Client Not Generated**
**Symptoms:** TypeScript errors, 500 errors on API calls
**Solution:**
```bash
cd server
npx prisma generate
npm run build  # or restart the server
```

### 2. **Database Schema Mismatch**
**Symptoms:** Database field errors, Prisma validation errors
**Solutions:**

**Option A: Update Database Schema**
```bash
cd server
npx prisma db push
npx prisma generate
```

**Option B: Manual Database Update (if db push fails)**
```sql
-- Run this in your PostgreSQL database
ALTER TABLE "Pharmacy" ADD COLUMN IF NOT EXISTS "city" TEXT;
ALTER TABLE "Pharmacy" ADD COLUMN IF NOT EXISTS "state" TEXT;
ALTER TABLE "Pharmacy" ADD COLUMN IF NOT EXISTS "pincode" TEXT;
ALTER TABLE "Pharmacy" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "Pharmacy" ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE "Pharmacy" ADD COLUMN IF NOT EXISTS "operatingHours" JSONB;
ALTER TABLE "Pharmacy" ADD COLUMN IF NOT EXISTS "services" JSONB;
ALTER TABLE "Pharmacy" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;
```

### 3. **Authentication Issues**
**Symptoms:** 403 Forbidden, "Access denied"
**Solutions:**
- Ensure you're logged in as a pharmacist
- Check JWT token is valid and not expired
- Verify the Authorization header: `Bearer YOUR_TOKEN`

### 4. **Missing Pharmacist Profile**
**Symptoms:** "Pharmacist profile not found"
**Solutions:**
- Ensure the user has a pharmacist profile in the database
- Check the user role is set to 'PHARMACIST'
- Verify the pharmacistProfile table has an entry for the user

### 5. **Database Connection Issues**
**Symptoms:** Database connection errors, timeout errors
**Solutions:**
- Check DATABASE_URL in .env file
- Verify PostgreSQL is running
- Test database connection:
```bash
npx prisma db pull
```

## Debug Steps

### Step 1: Check Server Status
```bash
# In server directory
npm run dev
```
Server should start on port 4000

### Step 2: Test Basic Connectivity
```bash
curl http://localhost:4000/api/health
```
Should return: `{"status":"ok","timestamp":"..."}`

### Step 3: Test Public Endpoints
```bash
curl http://localhost:4000/api/pharmacies/for-patients
```
Should return array of pharmacies (or empty array)

### Step 4: Test Protected Endpoint (should fail without auth)
```bash
curl http://localhost:4000/api/pharmacy/location
```
Should return: `{"error":"Access denied"}`

### Step 5: Test with Authentication
```bash
# Replace YOUR_TOKEN with actual JWT token
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:4000/api/pharmacy/location
```

### Step 6: Check Server Logs
Look for console.log messages in your server terminal:
- "Getting pharmacy location for user: [userId]"
- "Pharmacist profile found: true/false"
- "No pharmacy found, returning default data" or "Pharmacy found: [name]"

## Common Error Messages and Solutions

### "Pharmacist profile not found"
**Cause:** User doesn't have a pharmacist profile
**Solution:** Create pharmacist profile in database or ensure user is logged in correctly

### "Access denied"
**Cause:** Missing or invalid JWT token
**Solution:** Login as pharmacist and use the returned JWT token

### "Missing required fields"
**Cause:** Required fields not provided in PUT request
**Solution:** Ensure name, address, latitude, longitude are provided

### Database connection errors
**Cause:** PostgreSQL not running or wrong connection string
**Solution:** 
1. Start PostgreSQL service
2. Verify DATABASE_URL in .env
3. Test connection with `npx prisma db pull`

## Testing Script

Run the debug script to test your setup:
```bash
node debug-pharmacy-api.js
```

## Manual Database Verification

Check if your database has the required tables:
```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('User', 'PharmacistProfile', 'Pharmacy');

-- Check pharmacy table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'Pharmacy';

-- Check if you have pharmacist profiles
SELECT u.email, u.role, pp.id as profile_id 
FROM "User" u 
LEFT JOIN "PharmacistProfile" pp ON u.id = pp."userId" 
WHERE u.role = 'PHARMACIST';
```

## Frontend Integration Issues

### Map not loading
- Verify Leaflet CSS/JS in index.html
- Check browser console for errors
- Ensure HTTPS or localhost for geolocation

### Location not detected
- Check browser permissions for location
- Verify geolocation API is available
- Test with manual coordinates

### API calls failing from frontend
- Check CORS settings in server
- Verify API base URL configuration
- Check network tab in browser dev tools

## Production Deployment Issues

### Environment Variables
Ensure these are set:
```env
DATABASE_URL=your_postgres_connection_string
JWT_SECRET=your_secure_jwt_secret
PORT=4000
```

### Build Issues
```bash
# Server
npm run build
npm start

# Client
npm run build
```

## Getting Help

If you're still experiencing issues:

1. **Check the server console** for detailed error messages
2. **Enable debug logging** by adding more console.log statements
3. **Test with a REST client** like Postman or Insomnia
4. **Verify database state** using a database client
5. **Check network connectivity** and firewall settings

## Quick Fix Checklist

- [ ] Server is running on port 4000
- [ ] Database is connected and accessible
- [ ] Prisma client is generated (`npx prisma generate`)
- [ ] User is authenticated as pharmacist
- [ ] Pharmacist profile exists in database
- [ ] Required environment variables are set
- [ ] CORS is configured for your frontend domain

The updated controller now includes better error handling and fallback mechanisms to work with both old and new database schemas.
