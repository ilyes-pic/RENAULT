import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/parts/[id] - Get a specific part
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: partId } = await params;

    const part = await prisma.part.findUnique({
      where: { id: partId },
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

    if (!part) {
      return NextResponse.json(
        { success: false, error: "Pièce non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: part
    });
  } catch (error) {
    console.error("Error fetching part:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération de la pièce" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/parts/[id] - Update a specific part
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: partId } = await params;
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
      images = [],
      motorisationIds = []
    } = body;

    // Check if part exists
    const existingPart = await prisma.part.findUnique({
      where: { id: partId }
    });

    if (!existingPart) {
      return NextResponse.json(
        { success: false, error: "Pièce non trouvée" },
        { status: 404 }
      );
    }

    // Check if part number already exists (excluding current part)
    if (partNumber && partNumber !== existingPart.partNumber) {
      const numberExists = await prisma.part.findFirst({
        where: {
          partNumber,
          id: { not: partId }
        }
      });

      if (numberExists) {
        return NextResponse.json(
          { success: false, error: "Ce numéro de pièce existe déjà" },
          { status: 409 }
        );
      }
    }

    // Update the part
    const updatedPart = await prisma.part.update({
      where: { id: partId },
      data: {
        name: name || existingPart.name,
        partNumber: partNumber || existingPart.partNumber,
        description: description !== undefined ? description : existingPart.description,
        price: price ? parseFloat(price) : existingPart.price,
        categoryId: categoryId || existingPart.categoryId,
        manufacturer: manufacturer !== undefined ? manufacturer : existingPart.manufacturer,
        engineCode: engineCode !== undefined ? engineCode : existingPart.engineCode,
        capacity: capacity !== undefined ? capacity : existingPart.capacity,
        temperatureRange: temperatureRange !== undefined ? temperatureRange : existingPart.temperatureRange,
        color: color !== undefined ? color : existingPart.color,
        material: material !== undefined ? material : existingPart.material,
        chemicalProperties: chemicalProperties !== undefined ? chemicalProperties : existingPart.chemicalProperties,
        stockQuantity: stockQuantity !== undefined ? parseInt(stockQuantity) : existingPart.stockQuantity,
        availability: availability || existingPart.availability,
        warranty: warranty !== undefined ? (warranty ? parseInt(warranty) : null) : existingPart.warranty,
        weight: weight !== undefined ? (weight ? parseFloat(weight) : null) : existingPart.weight,
        dimensions: dimensions !== undefined ? dimensions : existingPart.dimensions,
        // Persist images updates
        images: Array.isArray(images) ? (images as string[]) : existingPart.images,
        // Update motorisation relationships
        motorisations: {
          deleteMany: {}, // Remove all existing relationships
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
      data: updatedPart,
      message: "Pièce mise à jour avec succès"
    });
  } catch (error) {
    console.error("Error updating part:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la mise à jour de la pièce" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/parts/[id] - Delete a specific part
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: partId } = await params;

    // Check if part exists
    const existingPart = await prisma.part.findUnique({
      where: { id: partId }
    });

    if (!existingPart) {
      return NextResponse.json(
        { success: false, error: "Pièce non trouvée" },
        { status: 404 }
      );
    }

    // Delete the part (relationships will be deleted automatically due to cascade)
    await prisma.part.delete({
      where: { id: partId }
    });

    return NextResponse.json({
      success: true,
      message: "Pièce supprimée avec succès"
    });
  } catch (error) {
    console.error("Error deleting part:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la suppression de la pièce" },
      { status: 500 }
    );
  }
}