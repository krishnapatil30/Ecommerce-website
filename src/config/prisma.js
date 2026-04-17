// const { PrismaClient } = require('@prisma/client');
// require('dotenv').config();

// const prisma = new PrismaClient({
//   // In Prisma 7, if 'url' isn't in schema, 
//   // we pass the string here.
//   accelerateUrl: process.env.DATABASE_URL
// });

// module.exports = prisma;
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

// 1. Setup the connection pool using your .env variable
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// 2. Initialize the adapter
const adapter = new PrismaPg(pool);

// 3. Pass the adapter to Prisma (This is the Prisma 7 way)
const prisma = new PrismaClient({ adapter });

module.exports = prisma;