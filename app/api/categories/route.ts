import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const source = request.nextUrl.searchParams.get('source');

    if (source === 'fs') {
      const baseDir = path.join(process.cwd(), 'partCategories');
      const mains = await fs.readdir(baseDir, { withFileTypes: true });
      const mainDirs = mains.filter((e) => e.isDirectory()).map((e) => e.name);

      const data = await Promise.all(
        mainDirs.map(async (mainName) => {
          const mainPath = path.join(baseDir, mainName);
          let children: string[] = [];
          try {
            const subs = await fs.readdir(mainPath, { withFileTypes: true });
            children = subs.filter((e) => e.isDirectory()).map((e) => e.name);
          } catch {}
          const parent = { id: mainName, name: mainName };
          return {
            id: mainName,
            name: mainName,
            parent: null,
            children: children.map((child) => ({ id: child, name: child, parent })),
          };
        })
      );

      return NextResponse.json({ success: true, data });
    }

    const categories = await prisma.category.findMany({
      include: {
        parent: true,
        children: true,
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch categories' }, { status: 500 });
  }
}


