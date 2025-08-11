import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

function sanitizePathSegment(segment: string): string {
  return segment.replace(/[\\/]/g, '').trim();
}

async function tryRead(filePath: string): Promise<Buffer | null> {
  try {
    return await fs.readFile(filePath);
  } catch {
    return null;
  }
}

async function findFirstWebpInFolder(folderPath: string): Promise<string | null> {
  try {
    const entries = await fs.readdir(folderPath, { withFileTypes: true });
    const webps = entries
      .filter((e) => e.isFile() && e.name.toLowerCase().endsWith('.webp'))
      .map((e) => e.name)
      .sort();
    if (webps.length > 0) {
      return path.join(folderPath, webps[0]);
    }
    return null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const main = searchParams.get('main');
  const parent = searchParams.get('parent');
  const name = searchParams.get('name');

  const baseDir = path.join(process.cwd(), 'partCategories');

  // If a main category image is requested, return first .webp in that folder
  if (main && !name) {
    const normalizedMain = main === 'Carrosserie' ? 'Carosserie' : main;
    const safeMain = sanitizePathSegment(normalizedMain);
    const mainFolder = path.join(baseDir, safeMain);
    const mainImage = await findFirstWebpInFolder(mainFolder);
    if (mainImage) {
      const data = await tryRead(mainImage);
      if (data) {
        return new NextResponse(data, {
          status: 200,
          headers: {
            'Content-Type': 'image/webp',
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        });
      }
    }
    return new NextResponse('Not found', { status: 404 });
  }

  if (!parent || !name) {
    return new NextResponse('Missing parent or name', { status: 400 });
  }

  // Normalize known parent folder variants
  const normalizedParent = parent === 'Carrosserie' ? 'Carosserie' : parent;
  const safeParent = sanitizePathSegment(normalizedParent);
  const safeName = sanitizePathSegment(name);

  // Try exact parent/name folder
  const folderA = path.join(baseDir, safeParent, safeName);
  let imagePath = await findFirstWebpInFolder(folderA);

  // Already normalized parent above; no further alternate parent retry needed

  // As a final fallback, try a direct file named after the category in either folder variant
  let data: Buffer | null = null;
  if (!imagePath) {
    const directA = path.join(baseDir, safeParent, safeName, `${safeName}.webp`);
    data = await tryRead(directA);
    if (!data) {
      let altParent: string | undefined;
      if (safeParent === 'Carrosserie') altParent = 'Carosserie';
      else if (safeParent === 'Carosserie') altParent = 'Carrosserie';
      if (altParent) {
        const directB = path.join(baseDir, altParent, safeName, `${safeName}.webp`);
        data = await tryRead(directB);
      }
    }
  }
  if (!data && imagePath) {
    data = await tryRead(imagePath);
  }

  if (!data) {
    return new NextResponse('Not found', { status: 404 });
  }

  return new NextResponse(data, {
    status: 200,
    headers: {
      'Content-Type': 'image/webp',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}


