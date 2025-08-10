import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/brands - Get all brands with model count
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { country: { contains: search, mode: "insensitive" } }
      ];
    }

    // Get brands with model count
    const [brands, total] = await Promise.all([
      prisma.brand.findMany({
        where,
        include: {
          _count: {
            select: {
              models: true
            }
          }
        },
        orderBy: { name: "asc" },
        skip,
        take: limit
      }),
      prisma.brand.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        brands,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error("Error fetching brands:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération des marques" },
      { status: 500 }
    );
  }
}

// POST /api/admin/brands - Create a new brand
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      website,
      country,
      founded,
      logo,
      photo
    } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { success: false, error: "Le nom de la marque est requis" },
        { status: 400 }
      );
    }

    // Check if brand already exists
    const existingBrand = await prisma.brand.findUnique({
      where: { name }
    });

    if (existingBrand) {
      return NextResponse.json(
        { success: false, error: "Cette marque existe déjà" },
        { status: 409 }
      );
    }

    // Create the brand
    const brand = await prisma.brand.create({
      data: {
        name,
        description: description || null,
        website: website || null,
        country: country || null,
        founded: founded ? parseInt(founded) : null,
        logo: logo || null,
        photo: photo || null
      },
      include: {
        _count: {
          select: {
            models: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: brand,
      message: "Marque créée avec succès"
    });
  } catch (error) {
    console.error("Error creating brand:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la création de la marque" },
      { status: 500 }
    );
  }
}