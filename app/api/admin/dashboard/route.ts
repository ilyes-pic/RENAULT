import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get counts for all entities
    const [
      brandsCount,
      modelsCount,
      motorisationsCount,
      partsCount,
      categoriesCount
    ] = await Promise.all([
      prisma.brand.count(),
      prisma.model.count(),
      prisma.motorisation.count(),
      prisma.part.count(),
      prisma.category.count()
    ]);

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      recentBrands,
      recentModels,
      recentMotorisations,
      recentParts
    ] = await Promise.all([
      prisma.brand.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo
          }
        }
      }),
      prisma.model.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo
          }
        }
      }),
      prisma.motorisation.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo
          }
        }
      }),
      prisma.part.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo
          }
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totals: {
          brands: brandsCount,
          models: modelsCount,
          motorisations: motorisationsCount,
          parts: partsCount,
          categories: categoriesCount
        },
        recent: {
          brands: recentBrands,
          models: recentModels,
          motorisations: recentMotorisations,
          parts: recentParts
        }
      }
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération des statistiques" },
      { status: 500 }
    );
  }
}