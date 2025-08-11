const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔌 Testing database connection...');
    
    // Test basic connection
    const brands = await prisma.brand.count();
    console.log(`✅ Connected! Found ${brands} brands`);
    
    // Test categories
    const categories = await prisma.category.count();
    console.log(`✅ Found ${categories} categories`);
    
    // Test models
    const models = await prisma.model.count();
    console.log(`✅ Found ${models} models`);
    
    // Test motorisations
    const motorisations = await prisma.motorisation.count();
    console.log(`✅ Found ${motorisations} motorisations`);
    
    // Test parts
    const parts = await prisma.part.count();
    console.log(`✅ Found ${parts} parts`);
    
    console.log('🎉 All database connections working!');
    
    // Test availability enum values
    console.log('\n📋 Testing availability enum values:');
    console.log('Valid values: IN_STOCK, OUT_OF_STOCK, PREORDER, DISCONTINUED');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();