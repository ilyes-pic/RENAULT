# ZORRAGA Admin Section - Complete Management System

## Overview

The ZORRAGA Admin section is a comprehensive, modern, and ergonomic administration panel designed to manage the complete automotive hierarchy: **Brands → Models → Motorisations**. It follows the same design system and theme (dark/light mode) as the main application, with a sophisticated three-tier management structure.

## Features

### 🏢 **Brand Management**
- **Complete brand lifecycle management** with photo uploads
- **Brand information**: Name, country, founding year, website, description
- **Dynamic photo handling** from database (no static assets)
- **Brand-specific statistics** and model counts
- **Hierarchical model navigation** from each brand

### 🚗 **Car Model Management** 
- **Complete CRUD operations** for vehicle models
- **Brand-linked models** (no standalone photos, inherit from brand)
- **Advanced filtering** by brand, body type, generation, year range
- **Detailed model views** with technical specifications
- **Direct motorisation management** from each model

### ⚡ **Motorisation Management**
- **Detailed engine specifications**: Power, torque, displacement, cylinders
- **Fuel type and transmission** management
- **Model-specific motorisation lists** (e.g., "PEUGEOT 2008 (CU_) 1.2 VTi")
- **Performance metrics** and technical comparisons
- **Complete variation tracking** per model

### 🎨 Design & UX
- **Responsive design** that works on all devices
- **Dark/Light theme support** with seamless switching
- **Modern glassmorphism effects** and smooth animations
- **Ergonomic navigation** with sidebar and breadcrumbs
- **Consistent color palette** matching the main site

### 🔧 Technical Features
- **TypeScript** for type safety
- **Prisma ORM** for database operations
- **Next.js App Router** for routing
- **Radix UI components** for accessibility
- **Real-time validation** and error handling

## Database Schema Updates

The admin section includes updates to the Prisma schema:

### Brand Model Enhancement
```prisma
model Brand {
  id          String   @id @default(cuid())
  name        String   @unique
  logo        String?
  photo       String?  // NEW: Added photo attribute for brand images
  description String?
  website     String?
  country     String?
  founded     Int?
  models      Model[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## Hierarchical Management Structure

### The Three-Tier System: Brands → Models → Motorisations

```
🏢 BRAND (Peugeot)
 ├── Photo: /brands/peugeot.png (from database)
 ├── Info: France, Founded 1810
 └── 📁 MODELS
     ├── 🚗 PEUGEOT 308 GTi (T9, 2015-2021)
     ├── 🚗 PEUGEOT 2008 (CU_) (I, 2013-2019)
     │   └── ⚡ MOTORISATIONS
     │       ├── PEUGEOT 2008 (CU_) 1.2 VTi (82ch, 1.2L, Essence)
     │       ├── PEUGEOT 2008 (CU_) 1.4 HDi (68ch, 1.4L, Diesel)
     │       ├── PEUGEOT 2008 (CU_) 1.6 BlueHDi 100 (100ch, 1.6L, Diesel)
     │       ├── PEUGEOT 2008 (CU_) 1.6 BlueHDi 120 (120ch, 1.6L, Diesel)
     │       ├── PEUGEOT 2008 (CU_) 1.6 BlueHDi 75 (75ch, 1.6L, Diesel)
     │       ├── PEUGEOT 2008 (CU_) 1.6 HDi (92ch, 1.6L, Diesel)
     │       └── PEUGEOT 2008 (CU_) 1.6 VTi (120ch, 1.6L, Essence)
     └── 🚗 PEUGEOT 108 (I, 2014-current)
```

## Admin Routes Structure

```
/admin                                      # Dashboard with overview
/admin/brands                              # Brand management hub
/admin/brands/new                          # Create new brand
/admin/brands/[id]                         # Brand detail + models list
/admin/brands/[id]/edit                    # Edit brand

/admin/models                              # All models across brands
/admin/models/new                          # Create new model
/admin/models/[id]                         # Model detail view
/admin/models/[id]/edit                    # Edit model
/admin/models/[id]/motorisations           # Motorisations for this model
/admin/models/[id]/motorisations/new       # Add new motorisation
/admin/models/[id]/motorisations/[id]/edit # Edit motorisation

/admin/parts                               # Parts management  
/admin/customers                           # Customer management
/admin/stats                               # Statistics and reports
/admin/settings                            # Admin settings
```

## API Endpoints

### Brands API
- `GET /api/admin/brands` - List brands with pagination and filters
- `POST /api/admin/brands` - Create new brand with photo
- `GET /api/admin/brands/[id]` - Get brand details
- `PUT /api/admin/brands/[id]` - Update brand
- `DELETE /api/admin/brands/[id]` - Delete brand
- `GET /api/brands` - Public API for client-side (with photos)

### Models API  
- `GET /api/admin/models` - List models with pagination and filters
- `POST /api/admin/models` - Create new model (linked to brand)
- `GET /api/admin/models/[id]` - Get model details
- `PUT /api/admin/models/[id]` - Update model
- `DELETE /api/admin/models/[id]` - Delete model

### Motorisations API
- `GET /api/admin/motorisations?modelId=xxx` - List motorisations for model
- `POST /api/admin/motorisations` - Create new motorisation
- `GET /api/admin/motorisations/[id]` - Get motorisation details
- `PUT /api/admin/motorisations/[id]` - Update motorisation
- `DELETE /api/admin/motorisations/[id]` - Delete motorisation

### Filter Parameters
- `page` - Page number for pagination
- `limit` - Items per page
- `search` - Search in model name, generation, or brand
- `brandId` - Filter by specific brand
- `bodyType` - Filter by body type
- `fuelType` - Filter by fuel type

## Component Architecture

### Admin Layout (`app/admin/layout.tsx`)
- Responsive sidebar navigation
- Mobile-friendly with overlay
- Theme toggle integration
- Breadcrumb navigation

### Models Management
- **List View** (`app/admin/models/page.tsx`) - Grid/table view with filters
- **Create Form** (`app/admin/models/new/page.tsx`) - Comprehensive form with validation
- **Detail View** (`app/admin/models/[id]/page.tsx`) - Full model information display

### UI Components
- Enhanced cards with glassmorphism effects
- Form components with real-time validation
- Loading states and error handling
- Responsive grid layouts

## Usage

### Accessing the Admin Panel
1. Click the "Admin" link in the main navigation
2. Or use the settings icon in the header toolbar
3. Direct URL: `/admin`

### Managing Car Models

#### Creating a New Model
1. Navigate to `/admin/models`
2. Click "Nouveau modèle" button
3. Fill in the required information:
   - Model name (required)
   - Brand (required)
   - Start year (required)
   - Optional: Generation, end year, technical specs
4. Upload or provide image URL
5. Save the model

#### Editing a Model
1. From the models list, click the edit icon
2. Or from the detail view, click "Modifier"
3. Update the information
4. Save changes

#### Filtering Models
- Use the search bar for text search
- Filter by brand using the dropdown
- Filter by body type or fuel type
- Combine multiple filters for precise results

## Theme Integration

The admin section fully supports the existing theme system:

### Light Mode Features
- Clean, bright interface with subtle shadows
- Enhanced contrast for readability
- Soft color transitions
- Light background images

### Dark Mode Features
- Rich dark colors with proper contrast
- Glowing effects for interactive elements
- Dark background images
- Reduced eye strain

### CSS Classes Used
- `card-enhanced` - Enhanced card styling with glassmorphism
- `btn-primary` - Primary button with gradient effects
- `input-enhanced` - Enhanced input fields with focus effects
- `card-hover` - Hover effects for interactive cards

## Development Notes

### File Structure
```
app/admin/
├── layout.tsx              # Admin layout with sidebar
├── page.tsx                # Dashboard
├── models/
│   ├── page.tsx           # Models list
│   ├── new/
│   │   └── page.tsx       # Create model form
│   └── [id]/
│       ├── page.tsx       # Model detail view
│       └── edit/
│           └── page.tsx   # Edit model form
└── api/
    └── admin/
        └── models/
            ├── route.ts    # Models CRUD API
            └── [id]/
                └── route.ts # Individual model API
```

### Data Validation
- Client-side validation with real-time feedback
- Server-side validation in API routes
- Type safety with TypeScript interfaces
- Error handling with user-friendly messages

### Performance Considerations
- Lazy loading for images
- Pagination for large datasets
- Optimized database queries with Prisma
- Minimal bundle size with code splitting

## Future Enhancements

Planned features for future releases:
- [ ] Bulk operations for models
- [ ] Advanced analytics dashboard
- [ ] User role management
- [ ] Audit logging
- [ ] Data export/import functionality
- [ ] Advanced search with filters
- [ ] Model comparison tools

## Troubleshooting

### Common Issues

1. **Theme not switching properly**
   - Ensure ThemeProvider is properly configured
   - Check for conflicting CSS classes

2. **API errors**
   - Verify database connection
   - Check Prisma schema is up to date
   - Run `npx prisma db push` to sync schema

3. **Image upload issues**
   - Verify file size limits
   - Check supported formats (PNG, JPG)
   - Ensure proper permissions

### Database Migration
After schema changes, run:
```bash
npx prisma db push
# or for production
npx prisma migrate deploy
```

## Security Considerations

- Input validation on all forms
- SQL injection protection via Prisma
- XSS protection with proper escaping
- CSRF protection (to be implemented)
- Access control (to be implemented)

---

**Note**: This admin section is designed to be ergonomic, modern, and fully integrated with the existing ZORRAGA design system. All components follow the established patterns and will automatically adapt to theme changes.