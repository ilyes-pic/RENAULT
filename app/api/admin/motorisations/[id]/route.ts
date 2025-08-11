import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/motorisations/[id] - Get a specific motorisation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: motorisationId } = await params;

    const motorisation = await prisma.motorisation.findUnique({
      where: { id: motorisationId },
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

    if (!motorisation) {
      return NextResponse.json(
        { success: false, error: "Motorisation non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: motorisation
    });
  } catch (error) {
    console.error("Error fetching motorisation:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération de la motorisation" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/motorisations/[id] - Update a specific motorisation
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: motorisationId } = await params;
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

    // Check if motorisation exists
    const existingMotorisation = await prisma.motorisation.findUnique({
      where: { id: motorisationId }
    });

    if (!existingMotorisation) {
      return NextResponse.json(
        { success: false, error: "Motorisation non trouvée" },
        { status: 404 }
      );
    }

    // Check if name already exists for the same model (excluding current motorisation)
    if (name && modelId && (name !== existingMotorisation.name || modelId !== existingMotorisation.modelId)) {
      const nameExists = await prisma.motorisation.findFirst({
        where: {
          name,
          modelId,
          id: { not: motorisationId }
        }
      });

      if (nameExists) {
        return NextResponse.json(
          { success: false, error: "Cette motorisation existe déjà pour ce modèle" },
          { status: 409 }
        );
      }
    }

    // Update the motorisation
    const updatedMotorisation = await prisma.motorisation.update({
      where: { id: motorisationId },
      data: {
        name: name || existingMotorisation.name,
        engine: engine || existingMotorisation.engine,
        modelId: modelId || existingMotorisation.modelId,
        power: power ? parseInt(power.toString()) : existingMotorisation.power,
        torque: torque ? parseInt(torque.toString()) : existingMotorisation.torque,
        displacement: displacement ? parseFloat(displacement.toString()) : existingMotorisation.displacement,
        cylinders: cylinders ? parseInt(cylinders.toString()) : existingMotorisation.cylinders,
        fuelType: fuelType !== undefined ? fuelType : existingMotorisation.fuelType,
        transmission: transmission !== undefined ? transmission : existingMotorisation.transmission,
        driveType: driveType !== undefined ? driveType : existingMotorisation.driveType
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
      data: updatedMotorisation,
      message: "Motorisation mise à jour avec succès"
    });
  } catch (error) {
    console.error("Error updating motorisation:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la mise à jour de la motorisation" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/motorisations/[id] - Delete a specific motorisation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: motorisationId } = await params;

    // Check if motorisation exists
    const existingMotorisation = await prisma.motorisation.findUnique({
      where: { id: motorisationId }
    });

    if (!existingMotorisation) {
      return NextResponse.json(
        { success: false, error: "Motorisation non trouvée" },
        { status: 404 }
      );
    }

    // Delete the motorisation
    await prisma.motorisation.delete({
      where: { id: motorisationId }
    });

    return NextResponse.json({
      success: true,
      message: "Motorisation supprimée avec succès"
    });
  } catch (error) {
    console.error("Error deleting motorisation:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la suppression de la motorisation" },
      { status: 500 }
    );
  }
}