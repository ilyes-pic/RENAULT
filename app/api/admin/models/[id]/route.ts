import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/models/[id] - Get a specific model with motorisations
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: modelId } = await params;

    const model = await prisma.model.findUnique({
      where: { id: modelId },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            logo: true,
            photo: true
          }
        },
        motorisations: {
          orderBy: { name: "asc" }
        },
        _count: {
          select: {
            motorisations: true
          }
        }
      }
    });

    if (!model) {
      return NextResponse.json(
        { success: false, error: "Modèle non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: model
    });
  } catch (error) {
    console.error("Error fetching model:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération du modèle" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/models/[id] - Update a specific model
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: modelId } = await params;
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

    // Check if model exists
    const existingModel = await prisma.model.findUnique({
      where: { id: modelId }
    });

    if (!existingModel) {
      return NextResponse.json(
        { success: false, error: "Modèle non trouvé" },
        { status: 404 }
      );
    }

    // Check if name already exists for the same brand (excluding current model)
    if (name && brandId && (name !== existingModel.name || brandId !== existingModel.brandId)) {
      const nameExists = await prisma.model.findFirst({
        where: {
          name,
          brandId,
          id: { not: modelId }
        }
      });

      if (nameExists) {
        return NextResponse.json(
          { success: false, error: "Ce modèle existe déjà pour cette marque" },
          { status: 409 }
        );
      }
    }

    // Update the model
    const updatedModel = await prisma.model.update({
      where: { id: modelId },
      data: {
        name: name || existingModel.name,
        brandId: brandId || existingModel.brandId,
        generation: generation !== undefined ? generation : existingModel.generation,
        startYear: startYear ? parseInt(startYear.toString()) : existingModel.startYear,
        endYear: endYear ? parseInt(endYear.toString()) : existingModel.endYear,
        bodyType: bodyType !== undefined ? bodyType : existingModel.bodyType,
        description: description !== undefined ? description : existingModel.description
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
      data: updatedModel,
      message: "Modèle mis à jour avec succès"
    });
  } catch (error) {
    console.error("Error updating model:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la mise à jour du modèle" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/models/[id] - Delete a specific model
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: modelId } = await params;

    // Check if model exists and get motorisation count
    const existingModel = await prisma.model.findUnique({
      where: { id: modelId },
      include: {
        _count: {
          select: {
            motorisations: true
          }
        }
      }
    });

    if (!existingModel) {
      return NextResponse.json(
        { success: false, error: "Modèle non trouvé" },
        { status: 404 }
      );
    }

    // Check if model has motorisations
    if (existingModel._count.motorisations > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Impossible de supprimer ce modèle car il contient ${existingModel._count.motorisations} motorisations` 
        },
        { status: 400 }
      );
    }

    // Delete the model
    await prisma.model.delete({
      where: { id: modelId }
    });

    return NextResponse.json({
      success: true,
      message: "Modèle supprimé avec succès"
    });
  } catch (error) {
    console.error("Error deleting model:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la suppression du modèle" },
      { status: 500 }
    );
  }
}