import { Request, Response } from 'express';
import { PrismaClient, Role, StockStatus } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  userId?: string;
  userRole?: Role;
}

export const getPharmacies = async (_req: Request, res: Response) => {
  try {
    const pharmacies = await prisma.pharmacy.findMany();
    res.json(pharmacies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching pharmacies' });
  }
};

export const getPharmacyStock = async (req: AuthRequest, res: Response) => {
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

    const whereClause: any = { pharmacyId };
    if (medicineName) {
      whereClause.medicine = {
        name: { contains: medicineName as string, mode: 'insensitive' },
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

export const updateStockStatus = async (req: AuthRequest, res: Response) => {
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error updating stock status' });
  }
};
