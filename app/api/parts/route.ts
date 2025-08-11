import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const modelId = params.get('modelId');
    const motorisationId = params.get('motorisationId');
    const categoryParam = params.get('categoryId');

    const where: any = {};

    // Resolve category by id or by name (FS flow sends folder name as categoryId)
    if (categoryParam) {
      let resolvedCategoryId: string | null = null;
      try {
        const byId = await prisma.category.findUnique({ where: { id: categoryParam } });
        if (byId) {
          resolvedCategoryId = byId.id;
        } else {
          const byName = await prisma.category.findUnique({ where: { name: categoryParam } });
          if (byName) resolvedCategoryId = byName.id;
        }
      } catch {}

      if (resolvedCategoryId) {
        where.categoryId = resolvedCategoryId;
      } else {
        // If not found, keep a condition that yields none
        where.categoryId = '__non_existing__';
      }
    }

    // Filter by modelId via part_motorisations join if motorisation specified
    // If motorisation is provided, it is the most precise filter
    let motorisationFilter: string | null = null;
    if (motorisationId) {
      // Validate motorisation exists to avoid false positives
      const mot = await prisma.motorisation.findUnique({ where: { id: motorisationId } });
      motorisationFilter = mot ? motorisationId : null;
    } else if (modelId) {
      // If only model is provided, we will filter parts that are linked to any motorisation of that model
      const motorisations = await prisma.motorisation.findMany({
        where: { modelId },
        select: { id: true },
      });
      if (motorisations.length > 0) {
        // Use any of these motorisation ids
        // We'll add a filter via some() on part_motorisations relation
        where.motorisations = {
          some: {
            motorisationId: { in: motorisations.map((m) => m.id) },
          },
        };
      }
    }

    const parts = await prisma.part.findMany({
      where: motorisationFilter
        ? {
            ...where,
            motorisations: { some: { motorisationId: motorisationFilter } },
          }
        : where,
      include: {
        category: { include: { parent: true } },
        motorisations: {
          include: {
            motorisation: {
              include: {
                model: { include: { brand: true } },
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    // If none found by direct category, try matching by category name from FS param under parent match
    if (parts.length === 0 && categoryParam) {
      const fallbackParts = await prisma.part.findMany({
        where: motorisationFilter
          ? {
              motorisations: { some: { motorisationId: motorisationFilter } },
            }
          : {},
        include: {
          category: { include: { parent: true } },
          motorisations: {
            include: { motorisation: { include: { model: { include: { brand: true } } } } },
          },
        },
      });
      const filtered = fallbackParts.filter((p) => p.category.name === categoryParam);
      if (filtered.length > 0) {
        return NextResponse.json({ success: true, data: { parts: filtered } });
      }
    }

    return NextResponse.json({ success: true, data: { parts } });
  } catch (error) {
    console.error('Error fetching parts:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch parts' }, { status: 500 });
  }
}


