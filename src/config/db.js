const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
console.log('🔌 Connecting to database...');

if (!connectionString) {
    console.error('❌ DATABASE_URL is not set in .env');
    process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

// This part is crucial for debugging
console.log("--- DB INITIALIZATION ---");
if (prisma.product) {
    console.log("✅ Prisma loaded the Product model successfully.");
} else {
    console.error("❌ CRITICAL: Product model is MISSING from Prisma Client.");
}

// Test the connection
pool.on('error', (err) => {
    console.error('❌ Unexpected error on idle client', err);
});

pool.on('connect', () => {
    console.log('✅ Database pool connected');
});

module.exports = prisma;