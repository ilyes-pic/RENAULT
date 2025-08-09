# ZORRAGA - Sélecteur de Véhicules

Une application web moderne pour la sélection de véhicules automobiles, construite avec Next.js, Prisma et Neon Database.

## 🚀 Fonctionnalités

- **Sélecteur de véhicule intelligent** : Recherche par marque, modèle et motorisation
- **Base de données complète** : Plus de 189 modèles de véhicules
- **Mode sombre/clair** : Interface adaptable avec palette de couleurs ZORRAGA
- **Base de données robuste** : Structure complète avec Prisma et PostgreSQL
- **Design moderne** : Interface ergonomique avec Tailwind CSS et Radix UI
- **API RESTful** : Endpoints pour la gestion des véhicules

## 🛠️ Technologies

- **Frontend** : Next.js 15, React 19, TypeScript
- **Styling** : Tailwind CSS, Radix UI, Lucide Icons
- **Database** : PostgreSQL (Neon), Prisma ORM
- **Deployment** : Vercel Ready

## 📦 Installation

1. **Cloner le projet**
   ```bash
   git clone <repository-url>
   cd ZORRAGA_V2
   ```

2. **Installer les dépendances**
   ```bash
   pnpm install
   ```

3. **Configurer la base de données**
   
   Créer un fichier `.env.local` avec votre URL de base de données Neon :
   ```env
   DATABASE_URL='postgresql://username:password@host/database?sslmode=require'
   ```

4. **Initialiser la base de données**
   ```bash
   pnpm run db:setup
   ```

5. **Lancer l'application**
   ```bash
   pnpm dev
   ```

## 🗄️ Structure de la base de données

### Modèles principaux :

- **Brand** : Marques automobiles (Renault, Citroën, Dacia, Suzuki...)
- **Model** : Modèles de véhicules avec années, type de carrosserie
- **Motorisation** : Variantes moteur avec puissance, cylindrée
- **Category** : Catégories de pièces (Moteur, Freinage, Suspension...)
- **Part** : Pièces détachées avec prix, stock, compatibilité
- **Order/OrderItem** : Système de commandes
- **Customer** : Gestion des clients

### Relations :
- Une marque a plusieurs modèles
- Un modèle a plusieurs motorisations
- Les pièces sont liées aux modèles/motorisations
- Système de catégories hiérarchique

## 🎨 Thème et Design

### Palette de couleurs :

**Mode sombre :**
- Primary: `#2ECC71` (Vert vibrant)
- Background: `#121212` (Noir profond)
- Surface: `#1E1E1E` (Noir plus clair)
- Accent: `#00D084` (Vert brillant)

**Mode clair :**
- Primary: `#27AE60` (Vert frais)
- Background: `#FFFFFF` (Blanc)
- Surface: `#F9F9F9` (Blanc cassé)
- Accent: `#00B16A` (Vert froid)

## 📁 Structure du projet

```
ZORRAGA_V2/
├── app/                    # Pages Next.js App Router
│   ├── api/               # API Routes
│   ├── catalogue/         # Page catalogue
│   ├── pieces-auto/       # Page pièces auto
│   └── globals.css        # Styles globaux
├── components/            # Composants React
│   ├── ui/               # Composants UI de base
│   ├── car-selector.tsx  # Sélecteur de véhicule
│   ├── header.tsx        # En-tête
│   └── footer.tsx        # Pied de page
├── lib/                  # Utilitaires
├── prisma/               # Schema et migrations
└── scripts/              # Scripts de configuration
```

## 🚀 Scripts disponibles

```bash
# Développement
pnpm dev                  # Lancer en mode développement
pnpm build               # Construire pour production
pnpm start               # Lancer en production

# Base de données
pnpm run db:setup        # Configuration complète DB
pnpm run db:push         # Pousser le schema
pnpm run db:seed         # Alimenter avec les données
pnpm run db:studio       # Interface Prisma Studio
```

## 🔧 API Endpoints

- `GET /api/brands` : Liste des marques
- `GET /api/models` : Modèles (filtrable par marque)
- `GET /api/parts` : Pièces (avec filtres)
- `POST /api/orders` : Créer une commande

## 📱 Fonctionnalités à venir

- [ ] Système de panier
- [ ] Authentification utilisateur
- [ ] Paiement en ligne
- [ ] Tracking des commandes
- [ ] Interface d'administration
- [ ] Système de reviews
- [ ] Notifications en temps réel

## 🤝 Contribution

Les contributions sont les bienvenues ! Merci de :

1. Fork le projet
2. Créer une branche feature
3. Commiter vos changements
4. Push vers la branche
5. Ouvrir une Pull Request

## 📄 License

Ce projet est sous license MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 📞 Support

Pour toute question ou support :
- Email : contact@zorraga.com
- Téléphone : +33 1 23 45 67 89

---

Fait avec ❤️ par l'équipe ZORRAGA# ZORRAGA
