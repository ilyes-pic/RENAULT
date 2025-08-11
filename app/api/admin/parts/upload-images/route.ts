import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const uploadedFiles: string[] = [];

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'parts');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    // Process each uploaded file
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('image_') && value instanceof File) {
        const file = value as File;
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          continue;
        }

        // Generate unique filename
        const fileExtension = file.name.split('.').pop() || 'jpg';
        const uniqueFilename = `${randomBytes(16).toString('hex')}.${fileExtension}`;
        const filePath = join(uploadsDir, uniqueFilename);

        // Convert file to buffer and save
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // Store relative path for database
        uploadedFiles.push(`/uploads/parts/${uniqueFilename}`);
      }
    }

    return NextResponse.json({
      success: true,
      imageUrls: uploadedFiles,
      message: `${uploadedFiles.length} images uploaded successfully`
    });

  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to upload images',
        imageUrls: []
      },
      { status: 500 }
    );
  }
}
