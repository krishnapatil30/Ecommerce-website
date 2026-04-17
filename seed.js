const prisma = require('./src/config/db');

async function seed() {
  try {
    console.log('🌱 Starting database seeding...');

    // Create categories
    const categories = [
      { name: 'Electronics' },
      { name: 'Clothing' },
      { name: 'Books' },
      { name: 'Home & Garden' },
      { name: 'Sports' },
      { name: 'Beauty' }
    ];

    for (const cat of categories) {
      const existing = await prisma.category.findUnique({
        where: { name: cat.name }
      });

      if (!existing) {
        await prisma.category.create({ data: cat });
        console.log(`✅ Created category: ${cat.name}`);
      } else {
        console.log(`⏭️  Category already exists: ${cat.name}`);
      }
    }

    console.log('✅ Seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
