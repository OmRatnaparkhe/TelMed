import { PrismaClient, Role, StockStatus } from "@prisma/client";

const prisma = new PrismaClient()

export async function getPharmacyIdForPharmacist(userId: string): Promise<string> {
    // Resolve the pharmacist's assigned pharmacy. If missing, auto-create a default pharmacy
    // and link it, to prevent repeated 500s across pharmacist endpoints.
    let profile = await prisma.pharmacistProfile.findUnique({
      where: { userId },
      include: { user: { select: { firstName: true, lastName: true } } },
    });

    if (!profile) {
      // If there's no pharmacist profile yet, create one for a valid pharmacist user
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, role: true, firstName: true, lastName: true },
      });
      if (!user || user.role !== Role.PHARMACIST) {
        throw new Error('PHARMACIST_PROFILE_NOT_FOUND');
      }
      profile = await prisma.pharmacistProfile.create({
        data: { userId: user.id },
        include: { user: { select: { firstName: true, lastName: true } } },
      });
    }

    if (profile.pharmacyId) {
      return profile.pharmacyId;
    }

    // Try to find an existing pharmacy linked via pharmacistId
    const existing = await prisma.pharmacy.findFirst({
      where: { pharmacistId: profile.id },
      select: { id: true },
    });
    if (existing?.id) {
      // Backfill the pharmacistProfile.pharmacyId if not set
      await prisma.pharmacistProfile.update({
        where: { userId },
        data: { pharmacyId: existing.id },
      });
      return existing.id;
    }

    // Create a new default pharmacy for this pharmacist
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

    // Link back to PharmacistProfile
    await prisma.pharmacistProfile.update({
      where: { userId },
      data: { pharmacyId: created.id },
    });

    return created.id;
}

export async function updatePharmacyStockStatus(pharmacyId: string, medicineId: string): Promise<void> {
  try {
    const totalQuantity = await prisma.medicineBatch.aggregate({
      _sum: {
        quantity: true,
      },
      where: {
        pharmacyId,
        medicineId,
      },
    });

    const sumQuantity = totalQuantity._sum.quantity || 0;

    let newStockStatus: StockStatus;
    if (sumQuantity > 10) { // Example threshold for IN_STOCK
      newStockStatus = StockStatus.IN_STOCK;
    } else if (sumQuantity > 0) { // Example threshold for LOW_STOCK
      newStockStatus = StockStatus.LOW_STOCK;
    } else {
      newStockStatus = StockStatus.OUT_OF_STOCK;
    }

    await prisma.pharmacyStock.upsert({
      where: { pharmacyId_medicineId: { pharmacyId, medicineId } },
      update: { stockStatus: newStockStatus },
      create: {
        pharmacyId,
        medicineId,
        stockStatus: newStockStatus,
      },
    });
  } catch (error) {
    console.error(`Error updating stock status for pharmacy ${pharmacyId}, medicine ${medicineId}:`, error);
    throw error;
  }
}