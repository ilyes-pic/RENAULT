import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { extractEngineInfo } from '../lib/utils';

const prisma = new PrismaClient();

interface CarData {
  brand: string;
  models: {
    name: string;
    motorisations: string[];
  }[];
}

async function main() {
  console.log('🌱 Starting database seeding...');

  // Read all car data files
  const dataFiles = [
    'renault-data.json',
    'dacia-data.json',
  ];

  for (const file of dataFiles) {
    const filePath = path.join(process.cwd(), file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File ${file} not found, skipping...`);
      continue;
    }

    console.log(`📁 Processing ${file}...`);
    
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const carData: CarData = JSON.parse(rawData);

    // Create or update brand
    const brand = await prisma.brand.upsert({
      where: { name: carData.brand },
      update: {},
      create: {
        name: carData.brand,
        logo: getBrandLogo(carData.brand),
        description: `Pièces détachées pour véhicules ${carData.brand}`,
        country: getBrandCountry(carData.brand),
        founded: getBrandFounded(carData.brand),
      },
    });

    console.log(`✅ Brand ${brand.name} created/updated`);

    // Process models
    for (const modelData of carData.models) {
      // Extract model info from name
      const modelInfo = extractModelInfo(modelData.name);
      
      const model = await prisma.model.upsert({
        where: {
          name_brandId: {
            name: modelData.name,
            brandId: brand.id,
          },
        },
        update: {},
        create: {
          name: modelData.name,
          brandId: brand.id,
          generation: modelInfo.generation,
          startYear: modelInfo.startYear,
          endYear: modelInfo.endYear,
          bodyType: guessBodyType(modelData.name),
        },
      });

      // Process motorisations
      for (const motorisationName of modelData.motorisations) {
        if (!motorisationName || motorisationName.trim() === '') continue;

        const engineInfo = extractEngineInfo(motorisationName);
        
        await prisma.motorisation.upsert({
          where: {
            name_modelId: {
              name: motorisationName,
              modelId: model.id,
            },
          },
          update: {},
          create: {
            name: motorisationName,
            engine: extractEngine(motorisationName),
            power: engineInfo.power,
            displacement: engineInfo.displacement,
            cylinders: guessGylinders(engineInfo.displacement ?? undefined),
            fuelType: guessFuelType([motorisationName]),
            transmission: 'MANUAL',
            driveType: 'FWD',
            modelId: model.id,
          },
        });
      }

      console.log(`  📋 Model ${model.name} processed with ${modelData.motorisations.length} motorisations`);
    }
  }

  // Create some sample categories
  const categories = [
    { name: 'Moteur', description: 'Pièces moteur et mécaniques' },
    { name: 'Transmission', description: 'Boîtes de vitesses et transmission' },
    { name: 'Freinage', description: 'Disques, plaquettes et systèmes de freinage' },
    { name: 'Suspension', description: 'Amortisseurs et pièces de suspension' },
    { name: 'Électrique', description: 'Composants électriques et électroniques' },
    { name: 'Carrosserie', description: 'Pièces de carrosserie et accessoires' },
    { name: 'Intérieur', description: 'Garnitures et accessoires intérieurs' },
    { name: 'Éclairage', description: 'Phares, feux et éclairage' },
    { name: 'Climatisation', description: 'Système de climatisation et chauffage' },
    { name: 'Échappement', description: 'Silencieux et systèmes d\'échappement' },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }

  console.log('✅ Categories created');

  console.log('🎉 Database seeding completed!');
}

function getBrandLogo(brandName: string): string | undefined {
  const logos: Record<string, string> = {
    'Citroen': '/brands/citroen.png',
    'Citroën': '/brands/citroen.png',
    'Renault': '/brands/renault.png',
    'Dacia': '/brands/dacia.png',
    'Suzuki': '/brands/suzuki.png',
    'Peugeot': '/brands/peugeot.png',
    'Kia': '/brands/kia.png',
  };
  return logos[brandName];
}

function getBrandCountry(brandName: string): string {
  const countries: Record<string, string> = {
    'Citroen': 'France',
    'Citroën': 'France',
    'Renault': 'France',
    'Dacia': 'Romania',
    'Suzuki': 'Japan',
    'Peugeot': 'France',
    'Kia': 'South Korea',
  };
  return countries[brandName] || 'Unknown';
}

function getBrandFounded(brandName: string): number | undefined {
  const founded: Record<string, number> = {
    'Citroen': 1919,
    'Citroën': 1919,
    'Renault': 1899,
    'Dacia': 1966,
    'Suzuki': 1909,
    'Peugeot': 1810,
    'Kia': 1944,
  };
  return founded[brandName];
}

function extractModelInfo(modelName: string) {
  // Extract generation code (usually in parentheses)
  const generationMatch = modelName.match(/\(([^)]+)\)/);
  const generation = generationMatch ? generationMatch[1] : undefined;

  // Try to extract years (simple heuristic)
  const yearMatch = modelName.match(/(\d{4})/);
  const year = yearMatch ? parseInt(yearMatch[1]) : undefined;

  return {
    generation,
    startYear: year,
    endYear: undefined, // This would need more sophisticated parsing
  };
}

function guessBodyType(modelName: string) {
  const name = modelName.toLowerCase();
  
  if (name.includes('suv') || name.includes('crossover') || name.includes('captur') || name.includes('duster')) {
    return 'SUV' as const;
  }
  if (name.includes('van') || name.includes('berlingo') || name.includes('kangoo')) {
    return 'VAN' as const;
  }
  if (name.includes('coupe')) {
    return 'COUPE' as const;
  }
  if (name.includes('wagon') || name.includes('estate') || name.includes('break')) {
    return 'WAGON' as const;
  }
  if (name.includes('convertible') || name.includes('cabriolet')) {
    return 'CONVERTIBLE' as const;
  }
  
  return 'HATCHBACK' as const; // Default
}

function guessFuelType(motorisations: string[]) {
  const allMotorisations = motorisations.join(' ').toLowerCase();
  
  if (allMotorisations.includes('electric') || allMotorisations.includes('ev') || allMotorisations.includes('ion')) {
    return 'ELECTRIC' as const;
  }
  if (allMotorisations.includes('hybrid')) {
    return 'HYBRID' as const;
  }
  if (allMotorisations.includes('dci') || allMotorisations.includes('hdi') || allMotorisations.includes('diesel') || 
      allMotorisations.includes('bluehdi') || allMotorisations.includes('td')) {
    return 'DIESEL' as const;
  }
  if (allMotorisations.includes('gdi') || allMotorisations.includes('vti') || allMotorisations.includes('mpi') || 
      allMotorisations.includes('t-gdi') || allMotorisations.includes('cvvt')) {
    return 'GASOLINE' as const;
  }
  
  return 'GASOLINE' as const; // Default
}

function extractEngine(motorisationName: string): string {
  // Extract the main engine designation
  const parts = motorisationName.split(/[\s\-_]/);
  
  // Look for engine patterns like "1.6 HDi", "1.2 TCe", "1.6 GDI", etc.
  for (let i = 0; i < parts.length - 1; i++) {
    const current = parts[i];
    const next = parts[i + 1];
    
    if (/^\d+\.?\d*$/.test(current) && /^(HDi|TCe|VTi|BlueHDi|dCi|TSI|TDI|GDI|MPI|CVVT|T-GDI)$/i.test(next)) {
      return `${current} ${next}`;
    }
  }
  
  // Fallback: return first part that looks like an engine
  const enginePart = parts.find(part => /^\d+\.?\d*(L|l|HDi|TCe|VTi|BlueHDi|dCi|GDI|MPI)/i.test(part));
  return enginePart || 'Unknown';
}

function guessGylinders(displacement?: number): number | undefined {
  if (!displacement) return undefined;
  
  // Simple heuristics based on displacement
  if (displacement <= 1.2) return 3;
  if (displacement <= 2.0) return 4;
  if (displacement <= 3.0) return 6;
  return 8;
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });