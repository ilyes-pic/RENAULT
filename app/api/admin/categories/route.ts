import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/categories - Get all categories with hierarchy
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeChildren = searchParams.get("includeChildren") === "true";
    const parentOnly = searchParams.get("parentOnly") === "true";

    let where = {};
    if (parentOnly) {
      where = { parentId: null };
    }

    const categories = await prisma.category.findMany({
      where,
      include: {
        parent: true,
        children: includeChildren,
        _count: {
          select: {
            parts: true
          }
        }
      },
      orderBy: [
        { parent: { name: "asc" } },
        { name: "asc" }
      ]
    });

    return NextResponse.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération des catégories" },
      { status: 500 }
    );
  }
}

// POST /api/admin/categories - Create a new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, parentId } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { success: false, error: "Le nom de la catégorie est requis" },
        { status: 400 }
      );
    }

    // Check if category already exists
    const existingCategory = await prisma.category.findUnique({
      where: { name }
    });

    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: "Cette catégorie existe déjà" },
        { status: 409 }
      );
    }

    // If parentId is provided, check if parent exists
    if (parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: parentId }
      });

      if (!parent) {
        return NextResponse.json(
          { success: false, error: "Catégorie parent introuvable" },
          { status: 404 }
        );
      }
    }

    // Create the category
    const category = await prisma.category.create({
      data: {
        name,
        description: description || null,
        parentId: parentId || null
      },
      include: {
        parent: true,
        _count: {
          select: {
            parts: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: category,
      message: "Catégorie créée avec succès"
    });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la création de la catégorie" },
      { status: 500 }
    );
  }
}