import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { prisma } from '@/lib/db/client';
import { StorageProvider } from '@/lib/storage/provider';

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_BYTES = 12 * 1024 * 1024; // 12 Megabytes

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'File payload missing' }, { status: 400 });
    }

    if (!ALLOWED_MIME.includes(file.type) || file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Unacceptable image format or payload > 12MB' }, { status: 422 });
    }

    const rawBuffer = Buffer.from(await file.arrayBuffer());

    // Strict WebP conversion pipeline
    const optimizedBuffer = await sharp(rawBuffer)
      .resize({ width: 2560, withoutEnlargement: true })
      .webp({ quality: 80, effort: 4 })
      .toBuffer();

    const metadata = await sharp(optimizedBuffer).metadata();
    const storageKey = `media-${Date.now()}-${crypto.randomUUID().slice(0, 8)}.webp`;
    
    // Save to local public/uploads or Supabase/S3 Storage
    const publicUrl = await StorageProvider.write(storageKey, optimizedBuffer, 'image/webp');

    const vaultEntry = await prisma.mediaVault.create({
      data: {
        fileName: file.name.replace(/\.[^/.]+$/, '') + '.webp',
        storageKey,
        mimeType: 'image/webp',
        fileSize: optimizedBuffer.length,
        width: metadata.width ?? 0,
        height: metadata.height ?? 0,
      },
    });

    return NextResponse.json({ url: publicUrl, id: vaultEntry.id }, { status: 201 });
  } catch (error) {
    console.error('[Media Upload Subsystem Error]:', error);
    return NextResponse.json({ error: 'Image processing failed' }, { status: 500 });
  }
}
