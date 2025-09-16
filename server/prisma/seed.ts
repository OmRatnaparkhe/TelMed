import { PrismaClient, Role, StockStatus } from '@prisma/client';
import { exit } from 'process';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create users (pharmacists)
  const pharmacist1 = await prisma.user.create({
    data: {
      email: 'pharmacist1@example.com',
      password: 'hashedpassword1',
      role: Role.PHARMACIST,
      firstName: 'John',
      lastName: 'Smith',
      phone: '+1234567890',
      doctorProfile: {
        create: {
          specialization: 'Pharmacy',
          qualifications: 'PharmD',
          experienceYears: 5,
          isAvailable: true,
        },
      },
    },
    include: {
      doctorProfile: true,
    },
  });

  const pharmacist2 = await prisma.user.create({
    data: {
      email: 'pharmacist2@example.com',
      password: 'hashedpassword2',
      role: Role.PHARMACIST,
      firstName: 'Jane',
      lastName: 'Doe',
      phone: '+1234567891',
      doctorProfile: {
        create: {
          specialization: 'Pharmacy',
          qualifications: 'PharmD',
          experienceYears: 8,
          isAvailable: true,
        },
      },
    },
    include: {
      doctorProfile: true,
    },
  });

  const pharmacist3 = await prisma.user.create({
    data: {
      email: 'pharmacist3@example.com',
      password: 'hashedpassword3',
      role: Role.PHARMACIST,
      firstName: 'Mike',
      lastName: 'Johnson',
      phone: '+1234567892',
      doctorProfile: {
        create: {
          specialization: 'Pharmacy',
          qualifications: 'PharmD',
          experienceYears: 3,
          isAvailable: true,
        },
      },
    },
    include: {
      doctorProfile: true,
    },
  });

  const pharmacist4 = await prisma.user.create({
    data: {
      email: 'pharmacist4@example.com',
      password: 'hashedpassword4',
      role: Role.PHARMACIST,
      firstName: 'Sarah',
      lastName: 'Wilson',
      phone: '+1234567893',
      doctorProfile: {
        create: {
          specialization: 'Pharmacy',
          qualifications: 'PharmD',
          experienceYears: 10,
          isAvailable: true,
        },
      },
    },
    include: {
      doctorProfile: true,
    },
  });

  // Create pharmacies
  const pharmacy1 = await prisma.pharmacy.create({
    data: {
      name: 'City Center Pharmacy',
      address: '123 Main St, Los Angeles, CA 90210',
      latitude: 34.0522,
      longitude: -118.2437,
      pharmacistId: pharmacist1.doctorProfile!.id,
    },
  });

  const pharmacy2 = await prisma.pharmacy.create({
    data: {
      name: 'Health Plus Pharmacy',
      address: '456 Oak Ave, Los Angeles, CA 90211',
      latitude: 34.0622,
      longitude: -118.2537,
      pharmacistId: pharmacist2.doctorProfile!.id,
    },
  });

  const pharmacy3 = await prisma.pharmacy.create({
    data: {
      name: 'MediCare Pharmacy',
      address: '789 Pine St, Los Angeles, CA 90212',
      latitude: 34.0422,
      longitude: -118.2337,
      pharmacistId: pharmacist3.doctorProfile!.id,
    },
  });

  const pharmacy4 = await prisma.pharmacy.create({
    data: {
      name: 'Quick Relief Pharmacy',
      address: '321 Elm St, Los Angeles, CA 90213',
      latitude: 34.0722,
      longitude: -118.2637,
      pharmacistId: pharmacist4.doctorProfile!.id,
    },
  });

  // Create medicines
  const paracetamol = await prisma.medicine.create({
    data: {
      name: 'Paracetamol',
      genericName: 'Acetaminophen',
    },
  });

  const ibuprofen = await prisma.medicine.create({
    data: {
      name: 'Ibuprofen',
      genericName: 'Ibuprofen',
    },
  });

  const aspirin = await prisma.medicine.create({
    data: {
      name: 'Aspirin',
      genericName: 'Acetylsalicylic acid',
    },
  });

  const amoxicillin = await prisma.medicine.create({
    data: {
      name: 'Amoxicillin',
      genericName: 'Amoxicillin',
    },
  });

  const cetirizine = await prisma.medicine.create({
    data: {
      name: 'Cetirizine',
      genericName: 'Cetirizine Hydrochloride',
    },
  });

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
    await prisma.pharmacyStock.create({
      data: stock,
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
