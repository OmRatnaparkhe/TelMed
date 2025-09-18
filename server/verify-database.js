// Database verification script
// Run with: node verify-database.js (from server directory)

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyDatabase() {
  console.log('🔍 Verifying Database Structure and Data...\n');

  try {
    // Test 1: Check if we can connect to database
    console.log('1. Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Test 2: Check users table
    console.log('\n2. Checking users...');
    const users = await prisma.user.findMany({
      where: { role: 'PHARMACIST' },
      select: { id: true, email: true, firstName: true, lastName: true, role: true }
    });
    console.log(`Found ${users.length} pharmacist users:`);
    users.forEach(user => {
      console.log(`  - ${user.firstName} ${user.lastName} (${user.email})`);
    });

    // Test 3: Check pharmacist profiles
    console.log('\n3. Checking pharmacist profiles...');
    const pharmacistProfiles = await prisma.pharmacistProfile.findMany({
      include: {
        user: { select: { email: true, firstName: true, lastName: true } }
      }
    });
    console.log(`Found ${pharmacistProfiles.length} pharmacist profiles:`);
    pharmacistProfiles.forEach(profile => {
      console.log(`  - Profile ID: ${profile.id}, User: ${profile.user.firstName} ${profile.user.lastName}`);
      console.log(`    Pharmacy ID: ${profile.pharmacyId || 'Not linked'}`);
    });

    // Test 4: Check pharmacies
    console.log('\n4. Checking pharmacies...');
    const pharmacies = await prisma.pharmacy.findMany({
      include: {
        pharmacist: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } }
          }
        }
      }
    });
    console.log(`Found ${pharmacies.length} pharmacies:`);
    pharmacies.forEach(pharmacy => {
      console.log(`  - ${pharmacy.name}`);
      console.log(`    Address: ${pharmacy.address}`);
      console.log(`    Location: ${pharmacy.latitude}, ${pharmacy.longitude}`);
      console.log(`    Pharmacist: ${pharmacy.pharmacist?.user?.firstName || 'Unknown'} ${pharmacy.pharmacist?.user?.lastName || ''}`);
      console.log(`    Pharmacist ID: ${pharmacy.pharmacistId}`);
      console.log('');
    });

    // Test 5: Check for orphaned records
    console.log('5. Checking for data consistency...');
    const orphanedPharmacies = await prisma.pharmacy.findMany({
      where: { pharmacistId: null }
    });
    if (orphanedPharmacies.length > 0) {
      console.log(`⚠️  Found ${orphanedPharmacies.length} pharmacies without pharmacist links`);
    }

    const profilesWithoutPharmacy = await prisma.pharmacistProfile.findMany({
      where: { pharmacyId: null }
    });
    console.log(`Found ${profilesWithoutPharmacy.length} pharmacist profiles without pharmacy links`);

    // Test 6: Test the actual query used by the API
    console.log('\n6. Testing API query...');
    const apiResult = await prisma.pharmacy.findMany({
      include: {
        pharmacist: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });
    console.log(`API query returned ${apiResult.length} pharmacies`);

    if (apiResult.length === 0) {
      console.log('\n❌ No pharmacies found! This explains why patient side is empty.');
      console.log('\n🔧 To fix this:');
      console.log('1. Login as a pharmacist in the frontend');
      console.log('2. Go to Location Setup page');
      console.log('3. Fill in pharmacy details and save');
      console.log('4. Check that the pharmacy gets created in database');
    } else {
      console.log('\n✅ Pharmacies found in database');
      console.log('Patient pharmacy finder should show these pharmacies');
    }

    console.log('\n📊 Summary:');
    console.log(`- Users (Pharmacists): ${users.length}`);
    console.log(`- Pharmacist Profiles: ${pharmacistProfiles.length}`);
    console.log(`- Pharmacies: ${pharmacies.length}`);
    console.log(`- API Query Result: ${apiResult.length}`);

  } catch (error) {
    console.error('❌ Database verification failed:', error);
    console.log('\nPossible issues:');
    console.log('- Database is not running');
    console.log('- Wrong DATABASE_URL in .env');
    console.log('- Prisma client needs regeneration');
    console.log('- Database schema is not up to date');
  } finally {
    await prisma.$disconnect();
  }
}

// Run verification
verifyDatabase();
