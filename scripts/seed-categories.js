const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const categories = [
  // Main categories with subcategories
  {
    name: "Filtres",
    description: "Filtres pour véhicules",
    children: [
      { name: "Filtre à huile", description: "Filtres à huile moteur" },
      { name: "Filtre à air", description: "Filtres à air moteur" },
      { name: "Filtre à carburant", description: "Filtres à carburant" },
      { name: "Filtre hydraulique, boîte automatique", description: "Filtres hydrauliques pour transmission automatique" },
      { name: "Filtre habitacle", description: "Filtres d'habitacle et climatisation" }
    ]
  },
  {
    name: "Freinage",
    description: "Système de freinage",
    children: [
      { name: "Étrier de frein", description: "Étriers et supports de frein" },
      { name: "Disque de frein", description: "Disques de frein avant et arrière" },
      { name: "Flexible de frein", description: "Flexibles et durites de frein" },
      { name: "Tambour de frein", description: "Tambours de frein arrière" },
      { name: "Cable frein à main", description: "Câbles de frein à main" },
      { name: "Maître-cylindre de frein", description: "Maîtres-cylindres de frein" },
      { name: "Cylindre de roue", description: "Cylindres de roue arrière" },
      { name: "Mâchoire de frein", description: "Mâchoires et garnitures de frein" },
      { name: "Kit de plaquettes de frein", description: "Kits de plaquettes de frein" },
      { name: "Capteur ABS", description: "Capteurs ABS et ESP" },
      { name: "Indicateur d'usure, plaquette de freins", description: "Témoins d'usure des plaquettes" }
    ]
  },
  {
    name: "Courroie, tendeur et chaine",
    description: "Système de distribution et transmission",
    children: [
      { name: "Courroie", description: "Courroies d'accessoires" },
      { name: "Courroie de distribution", description: "Courroies de distribution" },
      { name: "Kit de distribution", description: "Kits de distribution complets" },
      { name: "Poulie-Tendeur, Courroie De Distribution", description: "Poulies-tendeurs de distribution" },
      { name: "Tendeur courroie", description: "Tendeurs de courroie d'accessoires" },
      { name: "Tendeur, chaîne de distribution", description: "Tendeurs de chaîne de distribution" },
      { name: "Glissiere chaine distribution", description: "Glissières de chaîne de distribution" },
      { name: "Chaîne de distribution", description: "Chaînes de distribution" },
      { name: "Poulie, vilebrequin", description: "Poulies de vilebrequin" },
      { name: "Poulies", description: "Poulies diverses" }
    ]
  },
  {
    name: "Allumage",
    description: "Système d'allumage",
    children: [
      { name: "Bougie de préchauffage", description: "Bougies de préchauffage diesel" },
      { name: "Bougie d'allumage", description: "Bougies d'allumage essence" },
      { name: "Bobine d'allumage", description: "Bobines d'allumage" },
      { name: "Fiche, bobine d'allumage", description: "Connecteurs de bobine d'allumage" }
    ]
  },
  {
    name: "Suspension",
    description: "Système de suspension",
    children: [
      { name: "Ressort de suspension", description: "Ressorts de suspension" },
      { name: "Compresseur, système d'air comprimé", description: "Compresseurs de suspension pneumatique" },
      { name: "Amortisseur", description: "Amortisseurs avant et arrière" },
      { name: "Coupelle de suspension", description: "Coupelles et butées de suspension" },
      { name: "Butée élastique", description: "Butées élastiques d'amortisseur" }
    ]
  },
  {
    name: "Direction et Trains roulants",
    description: "Direction et trains roulants",
    children: [
      { name: "Rotule de direction intérieure, barre de connexion", description: "Rotules de direction intérieures" },
      { name: "Soufflet direction", description: "Soufflets de direction" },
      { name: "Silent-bloc", description: "Silent-blocs et bagues" },
      { name: "Bras et Triangle suspension", description: "Bras et triangles de suspension" },
      { name: "Barre de connexion", description: "Barres de connexion et biellettes" },
      { name: "Crémaillère de direction", description: "Crémaillères de direction" },
      { name: "Boitier direction", description: "Boîtiers de direction" },
      { name: "Moyeu de roue", description: "Moyeux de roue" },
      { name: "Kit de roulements de roue", description: "Kits de roulements de roue" },
      { name: "Silent-bloc barre stabilisatrice", description: "Silent-blocs de barre stabilisatrice" },
      { name: "Rotule de direction", description: "Rotules de direction" },
      { name: "Rotule de suspension", description: "Rotules de suspension" },
      { name: "Bielette suspension", description: "Biellettes de suspension" }
    ]
  },
  {
    name: "Embrayage",
    description: "Système d'embrayage",
    children: [
      { name: "Butée embrayage", description: "Butées d'embrayage" },
      { name: "Cylindre émetteur, embrayage", description: "Cylindres émetteurs d'embrayage" },
      { name: "Mécanisme d'embrayage", description: "Mécanismes d'embrayage" },
      { name: "Disque d'embrayage", description: "Disques d'embrayage" },
      { name: "Tirette à câble, commande d'embrayage", description: "Câbles de commande d'embrayage" },
      { name: "Kit d'embrayage", description: "Kits d'embrayage complets" },
      { name: "Volant moteur", description: "Volants moteur" },
      { name: "Cylindre récepteur, embrayage", description: "Cylindres récepteurs d'embrayage" },
      { name: "Fourchette embrayage", description: "Fourchettes d'embrayage" }
    ]
  },
  {
    name: "Moteur",
    description: "Pièces moteur",
    children: [
      { name: "Pompe hydraulique, direction", description: "Pompes de direction assistée" },
      { name: "Joint d'étanchéité, carter d'huile", description: "Joints de carter d'huile" },
      { name: "Corps papillon", description: "Corps de papillon" },
      { name: "Joint culasse", description: "Joints de culasse" },
      { name: "Joint de cache culbuteurs", description: "Joints de cache culbuteurs" },
      { name: "Pompe à carburant", description: "Pompes à carburant" },
      { name: "Carter d'huile", description: "Carters d'huile" },
      { name: "Pompe à huile", description: "Pompes à huile" },
      { name: "Cable accelerateur", description: "Câbles d'accélérateur" },
      { name: "Couvercle de culasse", description: "Couvercles de culasse" },
      { name: "Vanne EGR", description: "Vannes EGR" },
      { name: "Pompe à eau", description: "Pompes à eau" },
      { name: "Durite d'air", description: "Durites d'air" },
      { name: "Turbo", description: "Turbocompresseurs" },
      { name: "Support moteur", description: "Supports moteur" },
      { name: "Support boite vitesse", description: "Supports de boîte de vitesse" },
      { name: "Pochette joint", description: "Pochettes de joints" }
    ]
  },
  {
    name: "Eclairage",
    description: "Système d'éclairage",
    children: [
      { name: "Feu clignotant", description: "Feux clignotants" },
      { name: "Phare avant", description: "Phares avant" },
      { name: "Antibrouillard", description: "Feux antibrouillard" },
      { name: "Feu arrière", description: "Feux arrière" }
    ]
  },
  {
    name: "Démarrage électrique",
    description: "Système de démarrage électrique",
    children: [
      { name: "Démarreur", description: "Démarreurs" },
      { name: "Alternateur", description: "Alternateurs" },
      { name: "Poulie roue libre, alternateur", description: "Poulies roue libre d'alternateur" }
    ]
  },
  {
    name: "Capteurs et sondes",
    description: "Capteurs et sondes",
    children: [
      { name: "Sonde de température, liquide de refroidissement", description: "Sondes de température de liquide de refroidissement" },
      { name: "Capteur vilebrequin", description: "Capteurs de vilebrequin" },
      { name: "Sonde lambda", description: "Sondes lambda" },
      { name: "Débitmètre de masse d'air", description: "Débitmètres de masse d'air" },
      { name: "Capteur, température des gaz", description: "Capteurs de température des gaz" },
      { name: "Capteur arbre à cames", description: "Capteurs d'arbre à cames" }
    ]
  },
  {
    name: "Carosserie",
    description: "Pièces de carrosserie",
    children: [
      { name: "Balai d'essuie-glace", description: "Balais d'essuie-glace" },
      { name: "Tringlerie d'essuie-glace", description: "Tringleries d'essuie-glace" },
      { name: "Pompe d'eau de nettoyage, nettoyage des vitres", description: "Pompes de lave-glace" },
      { name: "Serrure de porte", description: "Serrures de porte" },
      { name: "Pédale d'accélérateur", description: "Pédales d'accélérateur" },
      { name: "Lève-vitre", description: "Lève-vitres" },
      { name: "Bague Spirale", description: "Bagues spirales" },
      { name: "vérin", description: "Vérins et actuateurs" }
    ]
  },
  {
    name: "Refroidissement moteur",
    description: "Système de refroidissement moteur",
    children: [
      { name: "Bouchon radiateur / Vase d'eau", description: "Bouchons de radiateur et vase d'expansion" },
      { name: "Thermostat d'eau", description: "Thermostats d'eau" },
      { name: "Vase d'expansion, liquide de refroidissement", description: "Vases d'expansion" },
      { name: "Intercooler, échangeur", description: "Intercoolers et échangeurs" },
      { name: "Radiateur d'huile", description: "Radiateurs d'huile" },
      { name: "Radiateur, refroidissement du moteur", description: "Radiateurs de refroidissement moteur" },
      { name: "Durite de radiateur", description: "Durites de radiateur" },
      { name: "Ventilateur, refroidissement du moteur", description: "Ventilateurs de refroidissement" },
      { name: "Embrayage, ventilateur de radiateur", description: "Embrayages de ventilateur" },
      { name: "Tuyauterie du réfrigérant", description: "Tuyauteries de réfrigérant" },
      { name: "Pipette d'eau", description: "Pipes d'eau" },
      { name: "Durite turbo", description: "Durites de turbo" }
    ]
  },
  {
    name: "Cardan et Transmission",
    description: "Système de transmission",
    children: [
      { name: "Tête cardan", description: "Têtes de cardan" },
      { name: "Cardan", description: "Cardans" },
      { name: "Soufflet, arbre de commande", description: "Soufflets de cardan" },
      { name: "Roulement central", description: "Roulements centraux" },
      { name: "Joint, arbre de transmission", description: "Joints d'arbre de transmission" },
      { name: "Cable vitesse", description: "Câbles de vitesse" }
    ]
  },
  {
    name: "Climatisation",
    description: "Système de climatisation",
    children: [
      { name: "Compresseur, climatisation", description: "Compresseurs de climatisation" },
      { name: "Radiateur climatisation", description: "Condenseurs de climatisation" },
      { name: "Radiateur chauffage", description: "Radiateurs de chauffage" },
      { name: "Evaporateur climatisation", description: "Évaporateurs de climatisation" },
      { name: "Pressostat, climatisation", description: "Pressostats de climatisation" },
      { name: "Pulseur d'air habitacle", description: "Pulseurs d'air habitacle" },
      { name: "Résistance, pulseur d'air habitacle", description: "Résistances de pulseur d'air" }
    ]
  },
  {
    name: "Lubrifiant",
    description: "Lubrifiants et liquides",
    children: [
      { name: "Huile pour boîte automatique", description: "Huiles pour transmissions automatiques" },
      { name: "Huile moteur", description: "Huiles moteur" },
      { name: "Huile pour boîte de vitesses et pont", description: "Huiles pour boîtes de vitesses" },
      { name: "Huile pour direction assistée", description: "Liquides de direction assistée" },
      { name: "Antigel", description: "Liquides de refroidissement" },
      { name: "Huile, boîte de vitesses à variation continue (CVT)", description: "Huiles CVT" }
    ]
  }
];

async function seedCategories() {
  console.log('🌱 Seeding categories...');

  try {
    // Create parent categories first
    for (const categoryData of categories) {
      console.log(`Creating parent category: ${categoryData.name}`);
      
      const parentCategory = await prisma.category.upsert({
        where: { name: categoryData.name },
        update: {},
        create: {
          name: categoryData.name,
          description: categoryData.description
        }
      });

      // Create child categories
      if (categoryData.children) {
        for (const childData of categoryData.children) {
          console.log(`  Creating child category: ${childData.name}`);
          
          await prisma.category.upsert({
            where: { name: childData.name },
            update: {},
            create: {
              name: childData.name,
              description: childData.description,
              parentId: parentCategory.id
            }
          });
        }
      }
    }

    console.log('✅ Categories seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    throw error;
  }
}

async function main() {
  try {
    await seedCategories();
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = { seedCategories };