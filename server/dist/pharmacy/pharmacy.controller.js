import { PrismaClient, Role, StockStatus } from '@prisma/client';
const prisma = new PrismaClient();
export const getPharmacies = async (_req, res) => {
    try {
        const pharmacies = await prisma.pharmacy.findMany();
        res.json(pharmacies);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching pharmacies' });
    }
};
// New: Aggregated inventory view with optional search, status filter, and expiring soon filter
export const getInventory = async (req, res) => {
    const { search, status, expiringInDays } = req.query;
    if (!req.userId || req.userRole !== Role.PHARMACIST) {
        return res.status(403).json({ error: 'Access denied' });
    }
    try {
        const profile = await prisma.doctorProfile.findUnique({
            where: { userId: req.userId },
            select: { id: true, managedPharmacies: { select: { id: true } } },
        });
        if (!profile || profile.managedPharmacies.length === 0) {
            return res.status(404).json({ error: 'Pharmacist not assigned to a pharmacy' });
        }
        const pharmacyId = profile.managedPharmacies[0].id;
        const whereMedicine = {};
        if (search && search.trim()) {
            whereMedicine.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { genericName: { contains: search, mode: 'insensitive' } },
            ];
        }
        // Fetch stock status and batches
        const [stocks, batches] = await Promise.all([
            prisma.pharmacyStock.findMany({
                where: { pharmacyId, ...(status ? { stockStatus: status } : {}) },
                include: { medicine: true },
            }),
            prisma.medicineBatch.findMany({
                where: {
                    pharmacyId,
                    medicine: whereMedicine,
                    ...(expiringInDays
                        ? { expiryDate: { lte: new Date(Date.now() + Number(expiringInDays) * 24 * 60 * 60 * 1000) } }
                        : {}),
                },
                include: { medicine: true },
                orderBy: { expiryDate: 'asc' },
            }),
        ]);
        // Aggregate quantities per medicine and attach soonest expiry
        const batchesByMedicine = new Map();
        for (const b of batches) {
            const entry = batchesByMedicine.get(b.medicineId) || { totalQty: 0, soonestExpiry: undefined };
            entry.totalQty += b.quantity;
            if (!entry.soonestExpiry || b.expiryDate < entry.soonestExpiry)
                entry.soonestExpiry = b.expiryDate;
            batchesByMedicine.set(b.medicineId, entry);
        }
        const result = stocks
            .filter((s) => {
            if (!search)
                return true;
            const med = s.medicine;
            const q = search.toLowerCase();
            return med.name.toLowerCase().includes(q) || (med.genericName?.toLowerCase().includes(q) ?? false);
        })
            .map((s) => ({
            stockId: s.id,
            medicineId: s.medicineId,
            name: s.medicine.name,
            genericName: s.medicine.genericName,
            status: s.stockStatus,
            totalQuantity: batchesByMedicine.get(s.medicineId)?.totalQty ?? 0,
            soonestExpiry: batchesByMedicine.get(s.medicineId)?.soonestExpiry ?? null,
        }));
        res.json(result);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching inventory' });
    }
};
// New: Create a batch with expiry for a medicine in the pharmacist's pharmacy
export const createBatch = async (req, res) => {
    if (!req.userId || req.userRole !== Role.PHARMACIST) {
        return res.status(403).json({ error: 'Access denied' });
    }
    const { medicineId, batchNumber, quantity, expiryDate } = req.body;
    if (!medicineId || !batchNumber || !quantity || !expiryDate) {
        return res.status(400).json({ error: 'medicineId, batchNumber, quantity, and expiryDate are required' });
    }
    try {
        const profile = await prisma.doctorProfile.findUnique({
            where: { userId: req.userId },
            select: { id: true, managedPharmacies: { select: { id: true } } },
        });
        if (!profile || profile.managedPharmacies.length === 0) {
            return res.status(404).json({ error: 'Pharmacist not assigned to a pharmacy' });
        }
        const pharmacyId = profile.managedPharmacies[0].id;
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
        res.status(500).json({ error: 'Error creating batch' });
    }
};
// New: Low stock and expiring soon alerts
export const getLowStockAlerts = async (req, res) => {
    if (!req.userId || req.userRole !== Role.PHARMACIST) {
        return res.status(403).json({ error: 'Access denied' });
    }
    try {
        const profile = await prisma.doctorProfile.findUnique({
            where: { userId: req.userId },
            select: { id: true, managedPharmacies: { select: { id: true } } },
        });
        if (!profile || profile.managedPharmacies.length === 0) {
            return res.status(404).json({ error: 'Pharmacist not assigned to a pharmacy' });
        }
        const pharmacyId = profile.managedPharmacies[0].id;
        const [lowStock, expiringSoon] = await Promise.all([
            prisma.pharmacyStock.findMany({
                where: { pharmacyId, stockStatus: { in: [StockStatus.LOW_STOCK, StockStatus.OUT_OF_STOCK] } },
                include: { medicine: true },
            }),
            prisma.medicineBatch.findMany({
                where: {
                    pharmacyId,
                    expiryDate: { lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }, // next 30 days
                },
                include: { medicine: true },
                orderBy: { expiryDate: 'asc' },
            }),
        ]);
        res.json({ lowStock, expiringSoon });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching alerts' });
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
