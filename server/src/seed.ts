const { PrismaClient, Role, StockStatus } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Create a pharmacist user first
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const pharmacistUser = await prisma.user.create({
    data: {
      email: 'pharmacist@example.com',
      password: hashedPassword,
      role: Role.PHARMACIST,
      firstName: 'John',
      lastName: 'Pharmacist',
      phone: '+1234567890',
    },
  });

  // Create doctor profile for the pharmacist
  const doctorProfile = await prisma.doctorProfile.create({
    data: {
      userId: pharmacistUser.id,
      specialization: 'Pharmacy',
      qualifications: 'PharmD',
      experienceYears: 5,
      isAvailable: true,
    },
  });

  // Create sample medicines
  const medicines = await Promise.all([
    prisma.medicine.create({
      data: {
        name: 'Paracetamol',
        genericName: 'Acetaminophen',
      },
    }),
    prisma.medicine.create({
      data: {
        name: 'Ibuprofen',
        genericName: 'Ibuprofen',
      },
    }),
    prisma.medicine.create({
      data: {
        name: 'Aspirin',
        genericName: 'Acetylsalicylic acid',
      },
    }),
    prisma.medicine.create({
      data: {
        name: 'Amoxicillin',
        genericName: 'Amoxicillin',
      },
    }),
  ]);

  // Create sample pharmacies
  const pharmacies = await Promise.all([
    prisma.pharmacy.create({
      data: {
        name: 'City Center Pharmacy',
        address: '123 Main St, Los Angeles, CA 90210',
        latitude: 34.0522,
        longitude: -118.2437,
        pharmacistId: doctorProfile.id,
      },
    }),
    prisma.pharmacy.create({
      data: {
        name: 'Health Plus Pharmacy',
        address: '456 Oak Ave, Los Angeles, CA 90211',
        latitude: 34.0622,
        longitude: -118.2537,
        pharmacistId: doctorProfile.id,
      },
    }),
    prisma.pharmacy.create({
      data: {
        name: 'MediCare Pharmacy',
        address: '789 Pine St, Los Angeles, CA 90212',
        latitude: 34.0422,
        longitude: -118.2337,
        pharmacistId: doctorProfile.id,
      },
    }),
    prisma.pharmacy.create({
      data: {
        name: 'Quick Relief Pharmacy',
        address: '321 Elm St, Los Angeles, CA 90213',
        latitude: 34.0722,
        longitude: -118.2637,
        pharmacistId: doctorProfile.id,
      },
    }),
  ]);

  // Create pharmacy stock entries
  const stockEntries = [];
  
  // City Center Pharmacy - has Paracetamol and Ibuprofen
  stockEntries.push(
    prisma.pharmacyStock.create({
      data: {
        pharmacyId: pharmacies[0].id,
        medicineId: medicines[0].id, // Paracetamol
        stockStatus: StockStatus.IN_STOCK,
      },
    }),
    prisma.pharmacyStock.create({
      data: {
        pharmacyId: pharmacies[0].id,
        medicineId: medicines[1].id, // Ibuprofen
        stockStatus: StockStatus.IN_STOCK,
      },
    })
  );

  // Health Plus Pharmacy - has Paracetamol and Aspirin
  stockEntries.push(
    prisma.pharmacyStock.create({
      data: {
        pharmacyId: pharmacies[1].id,
        medicineId: medicines[0].id, // Paracetamol
        stockStatus: StockStatus.IN_STOCK,
      },
    }),
    prisma.pharmacyStock.create({
      data: {
        pharmacyId: pharmacies[1].id,
        medicineId: medicines[2].id, // Aspirin
        stockStatus: StockStatus.LOW_STOCK,
      },
    })
  );

  // MediCare Pharmacy - has Amoxicillin and Ibuprofen
  stockEntries.push(
    prisma.pharmacyStock.create({
      data: {
        pharmacyId: pharmacies[2].id,
        medicineId: medicines[3].id, // Amoxicillin
        stockStatus: StockStatus.IN_STOCK,
      },
    }),
    prisma.pharmacyStock.create({
      data: {
        pharmacyId: pharmacies[2].id,
        medicineId: medicines[1].id, // Ibuprofen
        stockStatus: StockStatus.OUT_OF_STOCK,
      },
    })
  );

  // Quick Relief Pharmacy - has all medicines
  stockEntries.push(
    prisma.pharmacyStock.create({
      data: {
        pharmacyId: pharmacies[3].id,
        medicineId: medicines[0].id, // Paracetamol
        stockStatus: StockStatus.IN_STOCK,
      },
    }),
    prisma.pharmacyStock.create({
      data: {
        pharmacyId: pharmacies[3].id,
        medicineId: medicines[1].id, // Ibuprofen
        stockStatus: StockStatus.IN_STOCK,
      },
    }),
    prisma.pharmacyStock.create({
      data: {
        pharmacyId: pharmacies[3].id,
        medicineId: medicines[2].id, // Aspirin
        stockStatus: StockStatus.IN_STOCK,
      },
    }),
    prisma.pharmacyStock.create({
      data: {
        pharmacyId: pharmacies[3].id,
        medicineId: medicines[3].id, // Amoxicillin
        stockStatus: StockStatus.LOW_STOCK,
      },
    })
  );

  await Promise.all(stockEntries);

  console.log('Database seeding completed successfully!');
  console.log(`Created ${medicines.length} medicines`);
  console.log(`Created ${pharmacies.length} pharmacies`);
  console.log(`Created ${stockEntries.length} stock entries`);
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
