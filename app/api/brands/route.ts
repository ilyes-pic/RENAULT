import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/brands - Get all brands with their photos for client-side use
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeModels = searchParams.get("includeModels") === "true";

    // Get brands with optional models
    const brands = await prisma.brand.findMany({
      select: {
        id: true,
        name: true,
        logo: true,
        photo: true,
        description: true,
        models: includeModels ? {
          select: {
            id: true,
            name: true,
            startYear: true,
            endYear: true,
            bodyType: true,
            description: true,
            motorisations: {
              select: {
                id: true,
                name: true,
                engine: true,
                power: true,
                displacement: true,
                fuelType: true,
                transmission: true
              },
              orderBy: { name: "asc" }
            }
          },
          orderBy: { name: "asc" }
        } : false
      },
      orderBy: { name: "asc" }
    });

    return NextResponse.json({
      success: true,
      data: brands
    });
  } catch (error) {
    console.error("Error fetching brands:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération des marques" },
      { status: 500 }
    );
  }
}