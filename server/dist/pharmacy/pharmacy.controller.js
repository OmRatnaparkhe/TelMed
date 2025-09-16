import { PrismaClient, Role, StockStatus } from '@prisma/client';
const prisma = new PrismaClient();
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
export const getPharmacyStock = async (req, res) => {
    const { medicineName } = req.query; // New: medicineName query parameter
    if (!req.userId || req.userRole !== Role.PHARMACIST) {
        return res.status(403).json({ error: 'Access denied' });
    }
    try {
        const doctorProfile = await prisma.doctorProfile.findUnique({
            where: { userId: req.userId },
            select: { id: true, managedPharmacies: { select: { id: true } } },
        });
        if (!doctorProfile || doctorProfile.managedPharmacies.length === 0) {
            return res.status(404).json({ error: 'Pharmacist not assigned to a pharmacy' });
        }
        const pharmacyId = doctorProfile.managedPharmacies[0].id; // Changed to managedPharmacies
        const whereClause = { pharmacyId };
        if (medicineName) {
            whereClause.medicine = {
                name: { contains: medicineName, mode: 'insensitive' },
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
    try {
        console.log(`Searching for medicine: ${medicineName}`);
        const pharmacyStock = await prisma.pharmacyStock.findMany({
            where: {
                medicine: {
                    OR: [
                        { name: { contains: medicineName, mode: 'insensitive' } },
                        { genericName: { contains: medicineName, mode: 'insensitive' } }
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
        res.json(pharmaciesWithStock);
    }
    catch (error) {
        console.error('Database error, returning mock data:', error);
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
        res.json(mockData);
    }
};
export const updateStockStatus = async (req, res) => {
    if (!req.userId || req.userRole !== Role.PHARMACIST) {
        return res.status(403).json({ error: 'Access denied' });
    }
    const { stockId } = req.params;
    const { stockStatus } = req.body;
    if (!Object.values(StockStatus).includes(stockStatus)) {
        return res.status(400).json({ error: 'Invalid stock status provided' });
    }
    try {
        const doctorProfile = await prisma.doctorProfile.findUnique({
            where: { userId: req.userId },
            select: { id: true, managedPharmacies: { select: { id: true } } },
        });
        if (!doctorProfile || doctorProfile.managedPharmacies.length === 0) {
            return res.status(404).json({ error: 'Pharmacist not assigned to a pharmacy' });
        }
        const pharmacyId = doctorProfile.managedPharmacies[0].id; // Changed to managedPharmacies
        const stockItem = await prisma.pharmacyStock.findUnique({
            where: { id: stockId },
            select: { pharmacyId: true },
        });
        if (!stockItem || stockItem.pharmacyId !== pharmacyId) {
            return res.status(404).json({ error: 'Stock item not found or not in assigned pharmacy' });
        }
        const updatedStock = await prisma.pharmacyStock.update({
            where: { id: stockId },
            data: { stockStatus },
        });
        res.json(updatedStock);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error updating stock status' });
    }
};
