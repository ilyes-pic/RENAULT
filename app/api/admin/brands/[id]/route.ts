import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/brands/[id] - Get a specific brand
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: brandId } = await params;

    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
      include: {
        models: {
          include: {
            _count: {
              select: {
                motorisations: true
              }
            }
          },
          orderBy: { name: "asc" }
        },
        _count: {
          select: {
            models: true
          }
        }
      }
    });

    if (!brand) {
      return NextResponse.json(
        { success: false, error: "Marque non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: brand
    });
  } catch (error) {
    console.error("Error fetching brand:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération de la marque" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/brands/[id] - Update a specific brand
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: brandId } = await params;
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

    // Check if brand exists
    const existingBrand = await prisma.brand.findUnique({
      where: { id: brandId }
    });

    if (!existingBrand) {
      return NextResponse.json(
        { success: false, error: "Marque non trouvée" },
        { status: 404 }
      );
    }

    // Check if name already exists (excluding current brand)
    if (name && name !== existingBrand.name) {
      const nameExists = await prisma.brand.findFirst({
        where: {
          name,
          id: { not: brandId }
        }
      });

      if (nameExists) {
        return NextResponse.json(
          { success: false, error: "Cette marque existe déjà" },
          { status: 409 }
        );
      }
    }

    // Update the brand
    const updatedBrand = await prisma.brand.update({
      where: { id: brandId },
      data: {
        name: name || existingBrand.name,
        description: description !== undefined ? description : existingBrand.description,
        website: website !== undefined ? website : existingBrand.website,
        country: country !== undefined ? country : existingBrand.country,
        founded: founded ? parseInt(founded.toString()) : existingBrand.founded,
        logo: logo !== undefined ? logo : existingBrand.logo,
        photo: photo !== undefined ? photo : existingBrand.photo
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
      data: updatedBrand,
      message: "Marque mise à jour avec succès"
    });
  } catch (error) {
    console.error("Error updating brand:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la mise à jour de la marque" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/brands/[id] - Delete a specific brand
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: brandId } = await params;

    // Check if brand exists and get model count
    const existingBrand = await prisma.brand.findUnique({
      where: { id: brandId },
      include: {
        _count: {
          select: {
            models: true
          }
        }
      }
    });

    if (!existingBrand) {
      return NextResponse.json(
        { success: false, error: "Marque non trouvée" },
        { status: 404 }
      );
    }

    // Check if brand has models
    if (existingBrand._count.models > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Impossible de supprimer cette marque car elle contient ${existingBrand._count.models} modèles` 
        },
        { status: 400 }
      );
    }

    // Delete the brand
    await prisma.brand.delete({
      where: { id: brandId }
    });

    return NextResponse.json({
      success: true,
      message: "Marque supprimée avec succès"
    });
  } catch (error) {
    console.error("Error deleting brand:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la suppression de la marque" },
      { status: 500 }
    );
  }
}