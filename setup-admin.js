require('dotenv').config();
const bcrypt = require('bcryptjs');
const prisma = require('./src/config/db');

async function setupAdminUser() {
  try {
    console.log('🔧 Setting up admin user...\n');

    const adminEmail = 'admin@ordercard.com';
    const adminPassword = 'admin@123456';
    const adminName = 'Admin User';

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists!');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
      
      // Update role to admin if it wasn't
      if (existingAdmin.role !== 'admin') {
        await prisma.user.update({
          where: { id: existingAdmin.id },
          data: { role: 'admin' }
        });
        console.log('   ✨ Updated role to admin');
      }
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const adminUser = await prisma.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: 'admin'
      }
    });

    console.log('✅ Admin user created successfully!\n');
    console.log('📊 Admin Credentials:');
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Password: ${adminPassword}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log('\n🔐 Store these credentials securely!');
    console.log('💡 You can now login to the admin panel at /admin');

  } catch (error) {
    console.error('❌ Error setting up admin user:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setupAdminUser();
