import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const modelId = params.get('modelId');
    const motorisationId = params.get('motorisationId');
    const categoryId = params.get('categoryId');

    const where: any = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Filter by modelId via part_motorisations join if motorisation specified
    // If motorisation is provided, it is the most precise filter
    let motorisationFilter: string | null = null;
    if (motorisationId) {
      motorisationFilter = motorisationId;
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

    return NextResponse.json({ success: true, data: { parts } });
  } catch (error) {
    console.error('Error fetching parts:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch parts' }, { status: 500 });
  }
}


