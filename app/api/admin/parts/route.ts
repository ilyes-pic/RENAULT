import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/parts - Get all parts with category and motorisation info
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId") || "";
    const availability = searchParams.get("availability") || "";

    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { partNumber: { contains: search, mode: "insensitive" } },
        { manufacturer: { contains: search, mode: "insensitive" } },
        { category: { name: { contains: search, mode: "insensitive" } } }
      ];
    }

    if (categoryId) {
      where.OR = [
        { categoryId },
        { category: { parentId: categoryId } }
      ];
    }

    if (availability) {
      where.availability = availability;
    }

    // Get parts with all related information
    const [parts, total] = await Promise.all([
      prisma.part.findMany({
        where,
        include: {
          category: {
            include: {
              parent: true
            }
          },
          motorisations: {
            include: {
              motorisation: {
                include: {
                  model: {
                    include: {
                      brand: {
                        select: {
                          id: true,
                          name: true,
                          logo: true,
                          photo: true
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: [
          { category: { name: "asc" } },
          { name: "asc" }
        ],
        skip,
        take: limit
      }),
      prisma.part.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        parts,
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
    console.error("Error fetching parts:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération des pièces" },
      { status: 500 }
    );
  }
}

// POST /api/admin/parts - Create a new part
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      partNumber,
      description,
      price,
      categoryId,
      manufacturer,
      engineCode,
      capacity,
      temperatureRange,
      color,
      material,
      chemicalProperties,
      stockQuantity,
      availability,
      warranty,
      weight,
      dimensions,
      motorisationIds = []
    } = body;

    // Validate required fields
    if (!name || !partNumber || !price || !categoryId) {
      return NextResponse.json(
        { success: false, error: "Le nom, numéro de pièce, prix et catégorie sont requis" },
        { status: 400 }
      );
    }

    // Check if part number already exists
    const existingPart = await prisma.part.findUnique({
      where: { partNumber }
    });

    if (existingPart) {
      return NextResponse.json(
        { success: false, error: "Ce numéro de pièce existe déjà" },
        { status: 409 }
      );
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Catégorie introuvable" },
        { status: 404 }
      );
    }

    // Create the part
    const part = await prisma.part.create({
      data: {
        name,
        partNumber,
        description: description || null,
        price: parseFloat(price),
        categoryId,
        manufacturer: manufacturer || null,
        engineCode: engineCode || null,
        capacity: capacity || null,
        temperatureRange: temperatureRange || null,
        color: color || null,
        material: material || null,
        chemicalProperties: chemicalProperties || null,
        stockQuantity: stockQuantity ? parseInt(stockQuantity) : 0,
        availability: availability || "IN_STOCK",
        warranty: warranty ? parseInt(warranty) : null,
        weight: weight ? parseFloat(weight) : null,
        dimensions: dimensions || null,
        // Create motorisation relationships
        motorisations: {
          create: motorisationIds.map((motorisationId: string) => ({
            motorisationId
          }))
        }
      },
      include: {
        category: {
          include: {
            parent: true
          }
        },
        motorisations: {
          include: {
            motorisation: {
              include: {
                model: {
                  include: {
                    brand: {
                      select: {
                        id: true,
                        name: true,
                        logo: true,
                        photo: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: part,
      message: "Pièce créée avec succès"
    });
  } catch (error) {
    console.error("Error creating part:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la création de la pièce" },
      { status: 500 }
    );
  }
}