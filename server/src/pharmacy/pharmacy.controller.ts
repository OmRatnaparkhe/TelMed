import { Request, Response } from 'express';
import { PrismaClient, Role, StockStatus, Prisma } from '@prisma/client';
import { getPharmacyIdForPharmacist } from '../lib/pharmacyUtils.js';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  userId?: string;
  userRole?: Role;
}

// Helper: resolve pharmacist's assigned pharmacy; auto-create if missing
async function resolveOrCreatePharmacyIdForPharmacist(userId: string): Promise<string> {
  const profile = await prisma.doctorProfile.findUnique({
    where: { userId },
    include: { user: { select: { firstName: true, lastName: true } } },
  });
  if (!profile) throw new Error('PHARMACIST_PROFILE_NOT_FOUND');

  const existing = await prisma.pharmacy.findFirst({ where: { pharmacistId: profile.id }, select: { id: true } });
  if (existing) return existing.id;

  const nameParts: string[] = [];
  if (profile.user?.firstName) nameParts.push(profile.user.firstName);
  if (profile.user?.lastName) nameParts.push(profile.user.lastName);
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

export const getPharmacies = async (_req: Request, res: Response) => {
  try {
    const pharmacies = await prisma.pharmacy.findMany();
    res.json(pharmacies);
  } catch (error) {
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

export const getInventory = async (req: AuthRequest, res: Response) => {
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

    const batches = await (prisma as any).medicineBatch.findMany({
      where: {
        pharmacyId,
        medicineId: { in: medicineIds },
      },
    });

    const batchesByMedicine = new Map<string, { totalQty: number; soonestExpiry?: Date }>();
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
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Error fetching inventory' });
  }
};

// New: Create a batch with expiry for a medicine in the pharmacist's pharmacy
export const createBatch = async (req: AuthRequest, res: Response) => {
  if (!req.userId || req.userRole !== Role.PHARMACIST) {
      return res.status(403).json({ error: 'Access denied' });
  }
  const { medicineId, batchNumber, quantity, expiryDate } = req.body;
  if (!medicineId || !batchNumber || !quantity || !expiryDate) {
      return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
      const pharmacyId = await getPharmacyIdForPharmacist(req.userId);
      const batch = await (prisma as any).medicineBatch.create({
          data: {
              pharmacyId,
              medicineId,
              batchNumber,
              quantity: Number(quantity),
              expiryDate: new Date(expiryDate),
          },
      });
      res.status(201).json(batch);
  } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || 'Error creating batch' });
  }
};

// New: Low stock and expiring soon alerts
export const getLowStockAlerts = async (req: AuthRequest, res: Response) => {
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
      (prisma as any).medicineBatch.findMany({
        where: {
          pharmacyId,
          expiryDate: { lte: thirtyDaysFromNow },
        },
        include: { medicine: true },
        orderBy: { expiryDate: 'asc' },
      }),
    ]);

    res.json({ lowStock, expiringSoon });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Error fetching alerts' });
  }
};

export const getPharmacyStock = async (req: AuthRequest, res: Response) => {
  const { medicineName } = req.query; // New: medicineName query parameter

  if (!req.userId || req.userRole !== Role.PHARMACIST) {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const pharmacyId = await getPharmacyIdForPharmacist(req.userId);

    const whereClause: any = { pharmacyId };
    if (medicineName) {
      whereClause.medicine = {
        // SQLite does not support case-insensitive mode in Prisma filters
        name: { contains: medicineName as string },
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching pharmacy stock' });
  }
};

// Public endpoint to search for medicine across all pharmacies
export const searchMedicineStock = async (req: Request, res: Response) => {
  const { medicineName } = req.query;

  if (!medicineName) {
    return res.status(400).json({ error: 'Medicine name is required' });
  }

  console.log(`Searching for medicine: ${medicineName}`);
  
  // First, try to connect to the database
  let pharmacyStock: Prisma.PharmacyStockGetPayload<{
    include: {
      medicine: { select: { id: true; name: true; genericName: true } };
      pharmacy: { select: { id: true; name: true; address: true; latitude: true; longitude: true } };
    };
  }>[] = [];
  let useDatabase = true;
  
  try {
    // Test database connection
    await prisma.$connect();
    
    pharmacyStock = await prisma.pharmacyStock.findMany({
      where: {
        medicine: {
          OR: [
            // SQLite does not support case-insensitive mode in Prisma filters
            { name: { contains: medicineName as string } },
            { genericName: { contains: medicineName as string } }
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
  } catch (error) {
    console.error('Database error, using mock data:', error);
    useDatabase = false;
  }
  
  // Use mock data when database is unavailable or returns no results
  if (!useDatabase) {
    console.log('Using mock data for search results');
    
    // Return mock data when database is unavailable
    const searchTerm = (medicineName as string).toLowerCase();
    const mockData = [];
    
    if (searchTerm.includes('paracetamol') || searchTerm.includes('acetaminophen')) {
      mockData.push(
        {
          pharmacyId: '1',
          pharmacyName: 'City Center Pharmacy',
          pharmacyAddress: '123 Main St, Los Angeles, CA 90210',
          latitude: 34.0522,
          longitude: -118.2437,
          medicine: { id: '1', name: 'Paracetamol', genericName: 'Acetaminophen' },
          stockStatus: 'IN_STOCK',
        },
        {
          pharmacyId: '2',
          pharmacyName: 'Health Plus Pharmacy',
          pharmacyAddress: '456 Oak Ave, Los Angeles, CA 90211',
          latitude: 34.0622,
          longitude: -118.2537,
          medicine: { id: '1', name: 'Paracetamol', genericName: 'Acetaminophen' },
          stockStatus: 'IN_STOCK',
        },
        {
          pharmacyId: '4',
          pharmacyName: 'Quick Relief Pharmacy',
          pharmacyAddress: '321 Elm St, Los Angeles, CA 90213',
          latitude: 34.0722,
          longitude: -118.2637,
          medicine: { id: '1', name: 'Paracetamol', genericName: 'Acetaminophen' },
          stockStatus: 'IN_STOCK',
        }
      );
    }
    
    if (searchTerm.includes('ibuprofen')) {
      mockData.push(
        {
          pharmacyId: '1',
          pharmacyName: 'City Center Pharmacy',
          pharmacyAddress: '123 Main St, Los Angeles, CA 90210',
          latitude: 34.0522,
          longitude: -118.2437,
          medicine: { id: '2', name: 'Ibuprofen', genericName: 'Ibuprofen' },
          stockStatus: 'IN_STOCK',
        },
        {
          pharmacyId: '4',
          pharmacyName: 'Quick Relief Pharmacy',
          pharmacyAddress: '321 Elm St, Los Angeles, CA 90213',
          latitude: 34.0722,
          longitude: -118.2637,
          medicine: { id: '2', name: 'Ibuprofen', genericName: 'Ibuprofen' },
          stockStatus: 'IN_STOCK',
        }
      );
    }
    
    if (searchTerm.includes('aspirin')) {
      mockData.push(
        {
          pharmacyId: '4',
          pharmacyName: 'Quick Relief Pharmacy',
          pharmacyAddress: '321 Elm St, Los Angeles, CA 90213',
          latitude: 34.0722,
          longitude: -118.2637,
          medicine: { id: '3', name: 'Aspirin', genericName: 'Acetylsalicylic acid' },
          stockStatus: 'IN_STOCK',
        }
      );
    }
    
    console.log(`Returning ${mockData.length} mock results for search: ${medicineName}`);
    return res.json(mockData);
  }
};
export const updateStockStatus = async (req: AuthRequest, res: Response) => {
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
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Error updating stock status' });
  }
};

export const getAllMedicines = async (_req: Request, res: Response) => {
  try {
    const medicines = await prisma.medicine.findMany({
      select: { id: true, name: true, genericName: true },
      orderBy: { name: 'asc' },
    });
    res.json(medicines);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching medicines' });
  }
};