import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const brandId = searchParams.get('brandId');
    const includeMotorisations = searchParams.get('includeMotorisations') === 'true';

    const where = brandId ? { brandId } : {};

    const models = await prisma.model.findMany({
      where,
      include: {
        brand: true,
        motorisations: includeMotorisations,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(models);
  } catch (error) {
    console.error('Error fetching models:', error);
    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 500 }
    );
  }
}

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
      fuelType,
      transmission,
      driveType,
      image,
      description,
    } = body;

    const model = await prisma.model.create({
      data: {
        name,
        brandId,
        generation,
        startYear,
        endYear,
        bodyType,
        fuelType,
        transmission,
        driveType,
        image,
        description,
      },
      include: {
        brand: true,
      },
    });

    return NextResponse.json(model, { status: 201 });
  } catch (error) {
    console.error('Error creating model:', error);
    return NextResponse.json(
      { error: 'Failed to create model' },
      { status: 500 }
    );
  }
}