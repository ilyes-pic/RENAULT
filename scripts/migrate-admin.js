const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateAdminFeatures() {
  console.log('🚀 Starting enhanced admin migration...');
  
  try {
    // Update existing brands to include photo paths and additional info
    const brands = await prisma.brand.findMany();
    
    console.log(`📦 Found ${brands.length} brands to update...`);
    
    const brandDataMap = {
      'Peugeot': {
        photo: '/brands/peugeot.png',
        logo: '/brands/peugeot.png',
        country: 'France',
        founded: 1810,
        description: 'Constructeur automobile français fondé en 1810'
      },
      'Renault': {
        photo: '/brands/renault.png',
        logo: '/brands/renault.png',
        country: 'France',
        founded: 1899,
        description: 'Constructeur automobile français'
      },
      'Citroën': {
        photo: '/brands/citroen.png',
        logo: '/brands/citroen.png',
        country: 'France',
        founded: 1919,
        description: 'Marque française d\'automobile'
      },
      'Dacia': {
        photo: '/brands/dacia.png',
        logo: '/brands/dacia.png',
        country: 'Romania',
        founded: 1966,
        description: 'Constructeur automobile roumain, filiale de Renault'
      },
      'Suzuki': {
        photo: '/brands/suzuki.png',
        logo: '/brands/suzuki.png',
        country: 'Japan',
        founded: 1909,
        description: 'Constructeur automobile japonais'
      },
      'Kia': {
        photo: '/brands/kia.png',
        logo: '/brands/kia.png',
        country: 'South Korea',
        founded: 1944,
        description: 'Constructeur automobile sud-coréen'
      }
    };
    
    for (const brand of brands) {
      const brandData = brandDataMap[brand.name];
      if (brandData) {
        await prisma.brand.update({
          where: { id: brand.id },
          data: brandData
        });
        console.log(`✅ Updated ${brand.name} with complete data`);
      }
    }
    
    // Create sample models if database is empty
    const modelCount = await prisma.model.count();
    
    if (modelCount === 0) {
      console.log('📊 Creating sample models for demo...');
      
      // Find brands
      const peugeot = await prisma.brand.findFirst({ where: { name: 'Peugeot' } });
      const renault = await prisma.brand.findFirst({ where: { name: 'Renault' } });
      const citroen = await prisma.brand.findFirst({ where: { name: 'Citroën' } });
      
      const sampleModels = [];
      
      if (peugeot) {
        sampleModels.push({
          name: '308 GTi',
          brandId: peugeot.id,
          generation: 'T9',
          startYear: 2015,
          endYear: 2021,
          bodyType: 'HATCHBACK',
          fuelType: 'GASOLINE',
          transmission: 'MANUAL',
          driveType: 'FWD',
          description: 'Version sportive de la 308, équipée d\'un moteur 1.6 THP.'
        });
      }
      
      if (renault) {
        sampleModels.push({
          name: 'Megane RS',
          brandId: renault.id,
          generation: 'IV',
          startYear: 2017,
          endYear: null,
          bodyType: 'HATCHBACK',
          fuelType: 'GASOLINE',
          transmission: 'MANUAL',
          driveType: 'FWD',
          description: 'Megane Renault Sport - Version haute performance.'
        });
      }
      
      if (citroen) {
        sampleModels.push({
          name: 'PEUGEOT 2008 (CU_)',
          brandId: peugeot.id,
          generation: 'I',
          startYear: 2013,
          endYear: 2019,
          bodyType: 'SUV',
          description: 'Crossover compact urbain.'
        });
      }
      
      for (const modelData of sampleModels) {
        try {
          const createdModel = await prisma.model.create({ data: modelData });
          console.log(`✅ Created sample model: ${modelData.name}`);
          
          // Add sample motorisations for PEUGEOT 2008
          if (modelData.name === 'PEUGEOT 2008 (CU_)') {
            const sampleMotorisations = [
              {
                name: 'PEUGEOT 2008 (CU_) 1.2 VTi',
                engine: '1.2 VTi',
                power: 82,
                torque: 118,
                displacement: 1.2,
                cylinders: 3,
                fuelType: 'GASOLINE',
                transmission: 'MANUAL',
                driveType: 'FWD',
                modelId: createdModel.id
              },
              {
                name: 'PEUGEOT 2008 (CU_) 1.6 BlueHDi 120',
                engine: '1.6 BlueHDi',
                power: 120,
                torque: 300,
                displacement: 1.6,
                cylinders: 4,
                fuelType: 'DIESEL',
                transmission: 'AUTOMATIC',
                driveType: 'FWD',
                modelId: createdModel.id
              }
            ];
            
            for (const motorisation of sampleMotorisations) {
              try {
                await prisma.motorisation.create({ data: motorisation });
                console.log(`  ✅ Created motorisation: ${motorisation.engine}`);
              } catch (error) {
                console.log(`  ⚠️  Motorisation ${motorisation.engine} may already exist`);
              }
            }
          }
        } catch (error) {
          console.log(`⚠️  Model ${modelData.name} may already exist`);
        }
      }
    }
    
    console.log('🎉 Admin migration completed successfully!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Run: npm run dev');
    console.log('2. Navigate to: http://localhost:3000/admin');
    console.log('3. Start managing your car models!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateAdminFeatures()
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateAdminFeatures };