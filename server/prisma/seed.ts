import { PrismaClient, Role, StockStatus } from '@prisma/client';
import { exit } from 'process';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Helper to ensure a pharmacist user and linked PharmacistProfile exist
  async function ensurePharmacistUser(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone: string
  ) {
    // Upsert user by unique email
    const user = await prisma.user.upsert({
      where: { email },
      update: { password, role: Role.PHARMACIST, firstName, lastName, phone },
      create: {
        email,
        password,
        role: Role.PHARMACIST,
        firstName,
        lastName,
        phone,
        pharmacistProfile: { create: {} },
      },
      include: { pharmacistProfile: true },
    });

    // Ensure PharmacistProfile exists for updated users
    let pharmacistProfile = user.pharmacistProfile;
    if (!pharmacistProfile) {
      pharmacistProfile = await prisma.pharmacistProfile.create({ data: { userId: user.id } });
    }

    return { user, pharmacistProfile };
  }

  // Create or update pharmacists
  const p1 = await ensurePharmacistUser('pharmacist1@example.com', 'hashedpassword1', 'John', 'Smith', '+1234567890');
  const p2 = await ensurePharmacistUser('pharmacist2@example.com', 'hashedpassword2', 'Jane', 'Doe', '+1234567891');
  const p3 = await ensurePharmacistUser('pharmacist3@example.com', 'hashedpassword3', 'Mike', 'Johnson', '+1234567892');
  const p4 = await ensurePharmacistUser('pharmacist4@example.com', 'hashedpassword4', 'Sarah', 'Wilson', '+1234567893');

  // Create or update pharmacies linked to PharmacistProfile
  async function ensurePharmacy(name: string, address: string, latitude: number, longitude: number, pharmacistProfileId: string) {
    // One pharmacy per pharmacist (pharmacistId is unique)
    return prisma.pharmacy.upsert({
      where: { pharmacistId: pharmacistProfileId },
      update: { name, address, latitude, longitude },
      create: { name, address, latitude, longitude, pharmacistId: pharmacistProfileId },
    });
  }

  const pharmacy1 = await ensurePharmacy('City Center Pharmacy', '123 Main St, Los Angeles, CA 90210', 34.0522, -118.2437, p1.pharmacistProfile.id);
  const pharmacy2 = await ensurePharmacy('Health Plus Pharmacy', '456 Oak Ave, Los Angeles, CA 90211', 34.0622, -118.2537, p2.pharmacistProfile.id);
  const pharmacy3 = await ensurePharmacy('MediCare Pharmacy', '789 Pine St, Los Angeles, CA 90212', 34.0422, -118.2337, p3.pharmacistProfile.id);
  const pharmacy4 = await ensurePharmacy('Quick Relief Pharmacy', '321 Elm St, Los Angeles, CA 90213', 34.0722, -118.2637, p4.pharmacistProfile.id);

  // Create medicines
  async function findOrCreateMedicine(name: string, genericName: string) {
    const existing = await prisma.medicine.findFirst({ where: { name } });
    if (existing) return existing;
    return prisma.medicine.create({ data: { name, genericName } });
  }

  const paracetamol = await findOrCreateMedicine('Paracetamol', 'Acetaminophen');
  const ibuprofen = await findOrCreateMedicine('Ibuprofen', 'Ibuprofen');
  const aspirin = await findOrCreateMedicine('Aspirin', 'Acetylsalicylic acid');
  const amoxicillin = await findOrCreateMedicine('Amoxicillin', 'Amoxicillin');
  const cetirizine = await findOrCreateMedicine('Cetirizine', 'Cetirizine Hydrochloride');

  // Create pharmacy stock
  const stockEntries = [
    // City Center Pharmacy
    { pharmacyId: pharmacy1.id, medicineId: paracetamol.id, stockStatus: StockStatus.IN_STOCK },
    { pharmacyId: pharmacy1.id, medicineId: ibuprofen.id, stockStatus: StockStatus.IN_STOCK },
    { pharmacyId: pharmacy1.id, medicineId: aspirin.id, stockStatus: StockStatus.LOW_STOCK },
    { pharmacyId: pharmacy1.id, medicineId: amoxicillin.id, stockStatus: StockStatus.IN_STOCK },
    
    // Health Plus Pharmacy
    { pharmacyId: pharmacy2.id, medicineId: paracetamol.id, stockStatus: StockStatus.IN_STOCK },
    { pharmacyId: pharmacy2.id, medicineId: cetirizine.id, stockStatus: StockStatus.IN_STOCK },
    { pharmacyId: pharmacy2.id, medicineId: amoxicillin.id, stockStatus: StockStatus.OUT_OF_STOCK },
    
    // MediCare Pharmacy
    { pharmacyId: pharmacy3.id, medicineId: ibuprofen.id, stockStatus: StockStatus.IN_STOCK },
    { pharmacyId: pharmacy3.id, medicineId: aspirin.id, stockStatus: StockStatus.IN_STOCK },
    { pharmacyId: pharmacy3.id, medicineId: cetirizine.id, stockStatus: StockStatus.LOW_STOCK },
    
    // Quick Relief Pharmacy
    { pharmacyId: pharmacy4.id, medicineId: paracetamol.id, stockStatus: StockStatus.IN_STOCK },
    { pharmacyId: pharmacy4.id, medicineId: ibuprofen.id, stockStatus: StockStatus.IN_STOCK },
    { pharmacyId: pharmacy4.id, medicineId: aspirin.id, stockStatus: StockStatus.IN_STOCK },
    { pharmacyId: pharmacy4.id, medicineId: amoxicillin.id, stockStatus: StockStatus.IN_STOCK },
    { pharmacyId: pharmacy4.id, medicineId: cetirizine.id, stockStatus: StockStatus.IN_STOCK },
  ];

  for (const stock of stockEntries) {
    await prisma.pharmacyStock.upsert({
      where: { pharmacyId_medicineId: { pharmacyId: stock.pharmacyId, medicineId: stock.medicineId } },
      update: { stockStatus: stock.stockStatus },
      create: stock,
    });
  }

  console.log('Seed completed successfully!');
  console.log(`Created ${stockEntries.length} stock entries across 4 pharmacies with 5 medicines.`);
}

main()
  .catch((e) => {
    console.error(e);
    exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
