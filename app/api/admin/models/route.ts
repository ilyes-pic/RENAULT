import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/models - Get all models with brand and motorisation count
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const brandId = searchParams.get("brandId") || "";
    const bodyType = searchParams.get("bodyType") || "";

    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { generation: { contains: search, mode: "insensitive" } },
        { brand: { name: { contains: search, mode: "insensitive" } } }
      ];
    }

    if (brandId) {
      where.brandId = brandId;
    }

    if (bodyType) {
      where.bodyType = bodyType;
    }

    // Get models with brand information and motorisation count
    const [models, total] = await Promise.all([
      prisma.model.findMany({
        where,
        include: {
          brand: {
            select: {
              id: true,
              name: true,
              logo: true,
              photo: true
            }
          },
          _count: {
            select: {
              motorisations: true
            }
          }
        },
        orderBy: [
          { brand: { name: "asc" } },
          { name: "asc" }
        ],
        skip,
        take: limit
      }),
      prisma.model.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        models,
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
    console.error("Error fetching models:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération des modèles" },
      { status: 500 }
    );
  }
}

// POST /api/admin/models - Create a new model
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      brandId,
      generation,
      startYear,
      endYear,
      bodyType,
      description
    } = body;

    // Validate required fields
    if (!name || !brandId) {
      return NextResponse.json(
        { success: false, error: "Le nom et la marque sont requis" },
        { status: 400 }
      );
    }

    // Check if brand exists
    const brand = await prisma.brand.findUnique({
      where: { id: brandId }
    });

    if (!brand) {
      return NextResponse.json(
        { success: false, error: "Marque introuvable" },
        { status: 404 }
      );
    }

    // Check if model already exists for this brand
    const existingModel = await prisma.model.findUnique({
      where: {
        name_brandId: {
          name,
          brandId
        }
      }
    });

    if (existingModel) {
      return NextResponse.json(
        { success: false, error: "Ce modèle existe déjà pour cette marque" },
        { status: 409 }
      );
    }

    // Create the model
    const model = await prisma.model.create({
      data: {
        name,
        brandId,
        generation: generation || null,
        startYear: startYear ? parseInt(startYear) : null,
        endYear: endYear ? parseInt(endYear) : null,
        bodyType: bodyType || null,
        description: description || null
      },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            logo: true,
            photo: true
          }
        },
        _count: {
          select: {
            motorisations: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: model,
      message: "Modèle créé avec succès"
    });
  } catch (error) {
    console.error("Error creating model:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la création du modèle" },
      { status: 500 }
    );
  }
}