import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/motorisations - Get all motorisations with model and brand info
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const modelId = searchParams.get("modelId") || "";
    const fuelType = searchParams.get("fuelType") || "";

    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { engine: { contains: search, mode: "insensitive" } },
        { model: { name: { contains: search, mode: "insensitive" } } },
        { model: { brand: { name: { contains: search, mode: "insensitive" } } } }
      ];
    }

    if (modelId) {
      where.modelId = modelId;
    }

    if (fuelType) {
      where.fuelType = fuelType;
    }

    // Get motorisations with model and brand information
    const [motorisations, total] = await Promise.all([
      prisma.motorisation.findMany({
        where,
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
        },
        orderBy: [
          { model: { brand: { name: "asc" } } },
          { model: { name: "asc" } },
          { name: "asc" }
        ],
        skip,
        take: limit
      }),
      prisma.motorisation.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        motorisations,
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
    console.error("Error fetching motorisations:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération des motorisations" },
      { status: 500 }
    );
  }
}

// POST /api/admin/motorisations - Create a new motorisation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      engine,
      modelId,
      power,
      torque,
      displacement,
      cylinders,
      fuelType,
      transmission,
      driveType
    } = body;

    // Validate required fields
    if (!name || !engine || !modelId) {
      return NextResponse.json(
        { success: false, error: "Le nom, le moteur et le modèle sont requis" },
        { status: 400 }
      );
    }

    // Check if model exists
    const model = await prisma.model.findUnique({
      where: { id: modelId }
    });

    if (!model) {
      return NextResponse.json(
        { success: false, error: "Modèle introuvable" },
        { status: 404 }
      );
    }

    // Check if motorisation already exists for this model
    const existingMotorisation = await prisma.motorisation.findFirst({
      where: {
        name,
        modelId
      }
    });

    if (existingMotorisation) {
      return NextResponse.json(
        { success: false, error: "Cette motorisation existe déjà pour ce modèle" },
        { status: 409 }
      );
    }

    // Create the motorisation
    const motorisation = await prisma.motorisation.create({
      data: {
        name,
        engine,
        modelId,
        power: power ? parseInt(power) : null,
        torque: torque ? parseInt(torque) : null,
        displacement: displacement ? parseFloat(displacement) : null,
        cylinders: cylinders ? parseInt(cylinders) : null,
        fuelType: fuelType || null,
        transmission: transmission || null,
        driveType: driveType || null
      },
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
    });

    return NextResponse.json({
      success: true,
      data: motorisation,
      message: "Motorisation créée avec succès"
    });
  } catch (error) {
    console.error("Error creating motorisation:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la création de la motorisation" },
      { status: 500 }
    );
  }
}