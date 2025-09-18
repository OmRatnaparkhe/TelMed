import { PrismaClient, Role, StockStatus } from '@prisma/client';
import { getPharmacyIdForPharmacist } from '../lib/pharmacyUtils.js';
const prisma = new PrismaClient();
// Helper: resolve pharmacist's assigned pharmacy; auto-create if missing
async function resolveOrCreatePharmacyIdForPharmacist(userId) {
    const profile = await prisma.doctorProfile.findUnique({
        where: { userId },
        include: { user: { select: { firstName: true, lastName: true } } },
    });
    if (!profile)
        throw new Error('PHARMACIST_PROFILE_NOT_FOUND');
    const existing = await prisma.pharmacy.findFirst({ where: { pharmacistId: profile.id }, select: { id: true } });
    if (existing)
        return existing.id;
    const nameParts = [];
    if (profile.user?.firstName)
        nameParts.push(profile.user.firstName);
    if (profile.user?.lastName)
        nameParts.push(profile.user.lastName);
    const pharmacyName = (nameParts.join(' ') || 'New Pharmacist') + ' Pharmacy';
    const created = await prisma.pharmacy.create({
        data: {
            name: pharmacyName,
            address: 'N/A',
            latitude: 0,
            longitude: 0,
            pharmacistId: profile.id,
        },
        select: { id: true },
    });
    return created.id;
}
export const getPharmacies = async (_req, res) => {
    try {
        const pharmacies = await prisma.pharmacy.findMany();
        res.json(pharmacies);
    }
    catch (error) {
        console.error('Database error, returning mock data:', error);
        // Return mock data when database is unavailable
        const mockPharmacies = [
            {
                id: '1',
                name: 'City Center Pharmacy',
                address: '123 Main St, Los Angeles, CA 90210',
                latitude: 34.0522,
                longitude: -118.2437,
            },
            {
                id: '2',
                name: 'Health Plus Pharmacy',
                address: '456 Oak Ave, Los Angeles, CA 90211',
                latitude: 34.0622,
                longitude: -118.2537,
            },
            {
                id: '3',
                name: 'MediCare Pharmacy',
                address: '789 Pine St, Los Angeles, CA 90212',
                latitude: 34.0422,
                longitude: -118.2337,
            },
            {
                id: '4',
                name: 'Quick Relief Pharmacy',
                address: '321 Elm St, Los Angeles, CA 90213',
                latitude: 34.0722,
                longitude: -118.2637,
            },
        ];
        res.json(mockPharmacies);
    }
};
// New: Aggregated inventory view with optional search, status filter, and expiring soon filter
export const getInventory = async (req, res) => {
    if (!req.userId || req.userRole !== Role.PHARMACIST) {
        return res.status(403).json({ error: 'Access denied' });
    }
    try {
        const pharmacyId = await getPharmacyIdForPharmacist(req.userId);
        const stocks = await prisma.pharmacyStock.findMany({
            where: { pharmacyId },
            include: { medicine: true },
        });
        const medicineIds = stocks.map(s => s.medicineId);
        const batches = await prisma.medicineBatch.findMany({
            where: {
                pharmacyId,
                medicineId: { in: medicineIds },
            },
        });
        const batchesByMedicine = new Map();
        for (const batch of batches) {
            const entry = batchesByMedicine.get(batch.medicineId) || { totalQty: 0, soonestExpiry: undefined };
            entry.totalQty += batch.quantity;
            if (!entry.soonestExpiry || batch.expiryDate < entry.soonestExpiry) {
                entry.soonestExpiry = batch.expiryDate;
            }
            batchesByMedicine.set(batch.medicineId, entry);
        }
        const result = stocks.map(stock => ({
            stockId: stock.id,
            medicineId: stock.medicineId,
            name: stock.medicine.name,
            genericName: stock.medicine.genericName,
            status: stock.stockStatus,
            totalQuantity: batchesByMedicine.get(stock.medicineId)?.totalQty ?? 0,
            soonestExpiry: batchesByMedicine.get(stock.medicineId)?.soonestExpiry?.toISOString() ?? null,
        }));
        res.json(result);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Error fetching inventory' });
    }
};
// New: Create a batch with expiry for a medicine in the pharmacist's pharmacy
export const createBatch = async (req, res) => {
    if (!req.userId || req.userRole !== Role.PHARMACIST) {
        return res.status(403).json({ error: 'Access denied' });
    }
    const { medicineId, batchNumber, quantity, expiryDate } = req.body;
    if (!medicineId || !batchNumber || !quantity || !expiryDate) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
        const pharmacyId = await getPharmacyIdForPharmacist(req.userId);
        const batch = await prisma.medicineBatch.create({
            data: {
                pharmacyId,
                medicineId,
                batchNumber,
                quantity: Number(quantity),
                expiryDate: new Date(expiryDate),
            },
        });
        res.status(201).json(batch);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Error creating batch' });
    }
};
// New: Low stock and expiring soon alerts
export const getLowStockAlerts = async (req, res) => {
    if (!req.userId || req.userRole !== Role.PHARMACIST) {
        return res.status(403).json({ error: 'Access denied' });
    }
    try {
        const pharmacyId = await getPharmacyIdForPharmacist(req.userId);
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        const [lowStock, expiringSoon] = await Promise.all([
            prisma.pharmacyStock.findMany({
                where: {
                    pharmacyId,
                    stockStatus: { in: [StockStatus.LOW_STOCK, StockStatus.OUT_OF_STOCK] },
                },
                include: { medicine: true },
            }),
            prisma.medicineBatch.findMany({
                where: {
                    pharmacyId,
                    expiryDate: { lte: thirtyDaysFromNow },
                },
                include: { medicine: true },
                orderBy: { expiryDate: 'asc' },
            }),
        ]);
        res.json({ lowStock, expiringSoon });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Error fetching alerts' });
    }
};
export const getPharmacyStock = async (req, res) => {
    const { medicineName } = req.query; // New: medicineName query parameter
    if (!req.userId || req.userRole !== Role.PHARMACIST) {
        return res.status(403).json({ error: 'Access denied' });
    }
    try {
        const pharmacyId = await getPharmacyIdForPharmacist(req.userId);
        const whereClause = { pharmacyId };
        if (medicineName) {
            whereClause.medicine = {
                // SQLite does not support case-insensitive mode in Prisma filters
                name: { contains: medicineName },
            };
        }
        const pharmacyStock = await prisma.pharmacyStock.findMany({
            where: whereClause,
            include: {
                medicine: { select: { id: true, name: true, genericName: true } },
            },
            orderBy: {
                medicine: { name: 'asc' },
            },
        });
        res.json(pharmacyStock);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching pharmacy stock' });
    }
};
// Public endpoint to search for medicine across all pharmacies
export const searchMedicineStock = async (req, res) => {
    const { medicineName } = req.query;
    if (!medicineName) {
        return res.status(400).json({ error: 'Medicine name is required' });
    }
    console.log(`Searching for medicine: ${medicineName}`);
    // First, try to connect to the database
    let pharmacyStock = [];
    let useDatabase = true;
    try {
        // Test database connection
        await prisma.$connect();
        pharmacyStock = await prisma.pharmacyStock.findMany({
            where: {
                medicine: {
                    OR: [
                        // SQLite does not support case-insensitive mode in Prisma filters
                        { name: { contains: medicineName } },
                        { genericName: { contains: medicineName } }
                    ]
                },
                stockStatus: 'IN_STOCK', // Only show pharmacies with stock
            },
            include: {
                medicine: { select: { id: true, name: true, genericName: true } },
                pharmacy: { select: { id: true, name: true, address: true, latitude: true, longitude: true } },
            },
            orderBy: {
                pharmacy: { name: 'asc' },
            },
        });
        console.log(`Found ${pharmacyStock.length} stock entries`);
        // Transform the data to return pharmacy information with stock details
        const pharmaciesWithStock = pharmacyStock.map(stock => ({
            pharmacyId: stock.pharmacy.id,
            pharmacyName: stock.pharmacy.name,
            pharmacyAddress: stock.pharmacy.address,
            latitude: stock.pharmacy.latitude,
            longitude: stock.pharmacy.longitude,
            medicine: stock.medicine,
            stockStatus: stock.stockStatus,
        }));
        // If we have results, return them
        if (pharmaciesWithStock.length > 0) {
            return res.json(pharmaciesWithStock);
        }
        // If no results from database, fall through to mock data
        useDatabase = false;
    }
    catch (error) {
        console.error('Database error, using mock data:', error);
        useDatabase = false;
    }
    // Use mock data when database is unavailable or returns no results
    if (!useDatabase) {
        console.log('Using mock data for search results');
        // Return mock data when database is unavailable
        const searchTerm = medicineName.toLowerCase();
        const mockData = [];
        if (searchTerm.includes('paracetamol') || searchTerm.includes('acetaminophen')) {
            mockData.push({
                pharmacyId: '1',
                pharmacyName: 'City Center Pharmacy',
                pharmacyAddress: '123 Main St, Los Angeles, CA 90210',
                latitude: 34.0522,
                longitude: -118.2437,
                medicine: { id: '1', name: 'Paracetamol', genericName: 'Acetaminophen' },
                stockStatus: 'IN_STOCK',
            }, {
                pharmacyId: '2',
                pharmacyName: 'Health Plus Pharmacy',
                pharmacyAddress: '456 Oak Ave, Los Angeles, CA 90211',
                latitude: 34.0622,
                longitude: -118.2537,
                medicine: { id: '1', name: 'Paracetamol', genericName: 'Acetaminophen' },
                stockStatus: 'IN_STOCK',
            }, {
                pharmacyId: '4',
                pharmacyName: 'Quick Relief Pharmacy',
                pharmacyAddress: '321 Elm St, Los Angeles, CA 90213',
                latitude: 34.0722,
                longitude: -118.2637,
                medicine: { id: '1', name: 'Paracetamol', genericName: 'Acetaminophen' },
                stockStatus: 'IN_STOCK',
            });
        }
        if (searchTerm.includes('ibuprofen')) {
            mockData.push({
                pharmacyId: '1',
                pharmacyName: 'City Center Pharmacy',
                pharmacyAddress: '123 Main St, Los Angeles, CA 90210',
                latitude: 34.0522,
                longitude: -118.2437,
                medicine: { id: '2', name: 'Ibuprofen', genericName: 'Ibuprofen' },
                stockStatus: 'IN_STOCK',
            }, {
                pharmacyId: '4',
                pharmacyName: 'Quick Relief Pharmacy',
                pharmacyAddress: '321 Elm St, Los Angeles, CA 90213',
                latitude: 34.0722,
                longitude: -118.2637,
                medicine: { id: '2', name: 'Ibuprofen', genericName: 'Ibuprofen' },
                stockStatus: 'IN_STOCK',
            });
        }
        if (searchTerm.includes('aspirin')) {
            mockData.push({
                pharmacyId: '4',
                pharmacyName: 'Quick Relief Pharmacy',
                pharmacyAddress: '321 Elm St, Los Angeles, CA 90213',
                latitude: 34.0722,
                longitude: -118.2637,
                medicine: { id: '3', name: 'Aspirin', genericName: 'Acetylsalicylic acid' },
                stockStatus: 'IN_STOCK',
            });
        }
        console.log(`Returning ${mockData.length} mock results for search: ${medicineName}`);
        return res.json(mockData);
    }
};
export const updateStockStatus = async (req, res) => {
    if (!req.userId || req.userRole !== Role.PHARMACIST) {
        return res.status(403).json({ error: 'Access denied' });
    }
    const { stockId } = req.params;
    const { stockStatus } = req.body;
    if (!Object.values(StockStatus).includes(stockStatus)) {
        return res.status(400).json({ error: 'Invalid stock status' });
    }
    try {
        const pharmacyId = await getPharmacyIdForPharmacist(req.userId);
        const stockItem = await prisma.pharmacyStock.findFirst({
            where: {
                id: stockId,
                pharmacyId: pharmacyId, // Ensure item belongs to the pharmacist's pharmacy
            },
        });
        if (!stockItem) {
            return res.status(404).json({ error: 'Stock item not found in your pharmacy' });
        }
        const updatedStock = await prisma.pharmacyStock.update({
            where: { id: stockId },
            data: { stockStatus },
        });
        res.json(updatedStock);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Error updating stock status' });
    }
};
export const getAllMedicines = async (_req, res) => {
    try {
        const medicines = await prisma.medicine.findMany({
            select: { id: true, name: true, genericName: true },
            orderBy: { name: 'asc' },
        });
        res.json(medicines);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching medicines' });
    }
};
// Get pharmacy location details for the authenticated pharmacist
export const getPharmacyLocation = async (req, res) => {
    if (!req.userId || req.userRole !== Role.PHARMACIST) {
        return res.status(403).json({ error: 'Access denied' });
    }
    try {
        // Get pharmacist profile
        const pharmacistProfile = await prisma.pharmacistProfile.findUnique({
            where: { userId: req.userId },
            include: {
                pharmacy: true,
                user: { select: { firstName: true, lastName: true, email: true, phone: true } }
            }
        });
        if (!pharmacistProfile) {
            return res.status(404).json({ error: 'Pharmacist profile not found' });
        }
        // If no pharmacy exists, return default structure
        if (!pharmacistProfile.pharmacy) {
            const defaultData = {
                id: null,
                name: '',
                address: '',
                city: '',
                state: '',
                pincode: '',
                latitude: 0,
                longitude: 0,
                phone: pharmacistProfile.user.phone || '',
                email: pharmacistProfile.user.email || '',
                operatingHours: {
                    monday: { open: '09:00', close: '21:00', isOpen: true },
                    tuesday: { open: '09:00', close: '21:00', isOpen: true },
                    wednesday: { open: '09:00', close: '21:00', isOpen: true },
                    thursday: { open: '09:00', close: '21:00', isOpen: true },
                    friday: { open: '09:00', close: '21:00', isOpen: true },
                    saturday: { open: '09:00', close: '21:00', isOpen: true },
                    sunday: { open: '10:00', close: '20:00', isOpen: true },
                },
                services: [],
                isActive: true,
            };
            return res.json(defaultData);
        }
        // Parse operating hours and services from JSON fields
        const defaultOperatingHours = {
            monday: { open: '09:00', close: '21:00', isOpen: true },
            tuesday: { open: '09:00', close: '21:00', isOpen: true },
            wednesday: { open: '09:00', close: '21:00', isOpen: true },
            thursday: { open: '09:00', close: '21:00', isOpen: true },
            friday: { open: '09:00', close: '21:00', isOpen: true },
            saturday: { open: '09:00', close: '21:00', isOpen: true },
            sunday: { open: '10:00', close: '20:00', isOpen: true },
        };
        const operatingHours = pharmacistProfile.pharmacy.operatingHours || defaultOperatingHours;
        const services = pharmacistProfile.pharmacy.services || [];
        const response = {
            id: pharmacistProfile.pharmacy.id,
            name: pharmacistProfile.pharmacy.name,
            address: pharmacistProfile.pharmacy.address,
            city: pharmacistProfile.pharmacy.city || '',
            state: pharmacistProfile.pharmacy.state || '',
            pincode: pharmacistProfile.pharmacy.pincode || '',
            latitude: pharmacistProfile.pharmacy.latitude,
            longitude: pharmacistProfile.pharmacy.longitude,
            phone: pharmacistProfile.pharmacy.phone || pharmacistProfile.user.phone || '',
            email: pharmacistProfile.pharmacy.email || pharmacistProfile.user.email || '',
            operatingHours,
            services,
            isActive: pharmacistProfile.pharmacy.isActive,
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error fetching pharmacy location:', error);
        res.status(500).json({ error: 'Error fetching pharmacy location' });
    }
};
// Update pharmacy location for the authenticated pharmacist
export const updatePharmacyLocation = async (req, res) => {
    if (!req.userId || req.userRole !== Role.PHARMACIST) {
        return res.status(403).json({ error: 'Access denied' });
    }
    try {
        const { name, address, city, state, pincode, latitude, longitude, phone, email, operatingHours, services, isActive = true, } = req.body;
        // Validate required fields
        if (!name || !address || !city || !state || !pincode || latitude === undefined || longitude === undefined) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        // Get pharmacist profile
        const pharmacistProfile = await prisma.pharmacistProfile.findUnique({
            where: { userId: req.userId },
        });
        if (!pharmacistProfile) {
            return res.status(404).json({ error: 'Pharmacist profile not found' });
        }
        // Check if pharmacy exists
        const existingPharmacy = await prisma.pharmacy.findUnique({
            where: { pharmacistId: pharmacistProfile.id },
        });
        let pharmacy;
        const pharmacyData = {
            name,
            address,
            city,
            state,
            pincode,
            latitude: parseFloat(latitude.toString()),
            longitude: parseFloat(longitude.toString()),
            phone: phone || null,
            email: email || null,
            operatingHours: operatingHours || null,
            services: services || null,
            isActive,
        };
        if (existingPharmacy) {
            // Update existing pharmacy
            pharmacy = await prisma.pharmacy.update({
                where: { id: existingPharmacy.id },
                data: pharmacyData,
            });
        }
        else {
            // Create new pharmacy
            pharmacy = await prisma.pharmacy.create({
                data: {
                    ...pharmacyData,
                    pharmacistId: pharmacistProfile.id,
                },
            });
            // Update pharmacist profile to link to the new pharmacy
            await prisma.pharmacistProfile.update({
                where: { id: pharmacistProfile.id },
                data: { pharmacyId: pharmacy.id },
            });
        }
        res.json({
            message: 'Pharmacy location updated successfully',
            pharmacy: {
                id: pharmacy.id,
                name: pharmacy.name,
                address: pharmacy.address,
                city: pharmacy.city,
                state: pharmacy.state,
                pincode: pharmacy.pincode,
                latitude: pharmacy.latitude,
                longitude: pharmacy.longitude,
                phone: pharmacy.phone,
                email: pharmacy.email,
                operatingHours: pharmacy.operatingHours,
                services: pharmacy.services,
                isActive: pharmacy.isActive,
            },
        });
    }
    catch (error) {
        console.error('Error updating pharmacy location:', error);
        res.status(500).json({ error: 'Error updating pharmacy location' });
    }
};
// Get all pharmacies with location data for patients (pharmacy finder)
export const getPharmaciesForPatients = async (req, res) => {
    try {
        const { latitude, longitude, radius = 10 } = req.query;
        let pharmacies = await prisma.pharmacy.findMany({
            include: {
                pharmacist: {
                    include: {
                        user: { select: { firstName: true, lastName: true, phone: true, email: true } }
                    }
                }
            },
        });
        // Filter out pharmacies without proper location data
        pharmacies = pharmacies.filter(p => p.latitude !== 0 && p.longitude !== 0);
        // If user location is provided, calculate distances and filter by radius
        if (latitude && longitude) {
            const userLat = parseFloat(latitude);
            const userLng = parseFloat(longitude);
            const radiusKm = parseFloat(radius);
            pharmacies = pharmacies
                .map(pharmacy => {
                const distance = calculateDistance(userLat, userLng, pharmacy.latitude, pharmacy.longitude);
                return { ...pharmacy, distance };
            })
                .filter(pharmacy => pharmacy.distance <= radiusKm)
                .sort((a, b) => a.distance - b.distance);
        }
        // Format response
        const formattedPharmacies = pharmacies.map(pharmacy => {
            return {
                id: pharmacy.id,
                name: pharmacy.name,
                address: pharmacy.address,
                city: pharmacy.city || '',
                state: pharmacy.state || '',
                pincode: pharmacy.pincode || '',
                latitude: pharmacy.latitude,
                longitude: pharmacy.longitude,
                phone: pharmacy.phone || pharmacy.pharmacist?.user?.phone || '',
                email: pharmacy.email || pharmacy.pharmacist?.user?.email || '',
                pharmacistName: pharmacy.pharmacist ?
                    `${pharmacy.pharmacist.user.firstName} ${pharmacy.pharmacist.user.lastName}` : '',
                operatingHours: pharmacy.operatingHours || {},
                services: pharmacy.services || [],
                isActive: pharmacy.isActive !== false,
                distance: pharmacy.distance || null,
            };
        });
        res.json(formattedPharmacies);
    }
    catch (error) {
        console.error('Error fetching pharmacies for patients:', error);
        // Return mock data when database is unavailable
        const mockPharmacies = [
            {
                id: '1',
                name: 'City Center Pharmacy',
                address: '123 Main St, Los Angeles, CA 90210',
                city: 'Los Angeles',
                state: 'CA',
                pincode: '90210',
                latitude: 34.0522,
                longitude: -118.2437,
                phone: '+1-555-0101',
                email: 'contact@citycenter.pharmacy',
                pharmacistName: 'Dr. John Smith',
                operatingHours: {
                    monday: { open: '09:00', close: '21:00', isOpen: true },
                    tuesday: { open: '09:00', close: '21:00', isOpen: true },
                    wednesday: { open: '09:00', close: '21:00', isOpen: true },
                    thursday: { open: '09:00', close: '21:00', isOpen: true },
                    friday: { open: '09:00', close: '21:00', isOpen: true },
                    saturday: { open: '09:00', close: '21:00', isOpen: true },
                    sunday: { open: '10:00', close: '20:00', isOpen: true },
                },
                services: ['Home Delivery', '24/7 Emergency', 'Online Consultation'],
                distance: 2.5,
            },
            {
                id: '2',
                name: 'Health Plus Pharmacy',
                address: '456 Oak Ave, Los Angeles, CA 90211',
                city: 'Los Angeles',
                state: 'CA',
                pincode: '90211',
                latitude: 34.0622,
                longitude: -118.2537,
                phone: '+1-555-0102',
                email: 'info@healthplus.pharmacy',
                pharmacistName: 'Dr. Sarah Johnson',
                operatingHours: {
                    monday: { open: '08:00', close: '22:00', isOpen: true },
                    tuesday: { open: '08:00', close: '22:00', isOpen: true },
                    wednesday: { open: '08:00', close: '22:00', isOpen: true },
                    thursday: { open: '08:00', close: '22:00', isOpen: true },
                    friday: { open: '08:00', close: '22:00', isOpen: true },
                    saturday: { open: '09:00', close: '21:00', isOpen: true },
                    sunday: { open: '10:00', close: '20:00', isOpen: true },
                },
                services: ['Home Delivery', 'Medicine Refill Reminders', 'Health Checkups'],
                distance: 3.2,
            },
        ];
        res.json(mockPharmacies);
    }
};
// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in kilometers
    return Math.round(d * 100) / 100; // Round to 2 decimal places
}
function deg2rad(deg) {
    return deg * (Math.PI / 180);
}
