import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import sharp from 'sharp';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db/client';
import fs from 'fs/promises';
import path from 'path';
import { writeAuditLog } from '@/lib/audit-log';

const MAX_FILE_SIZE = 100 * 1024 * 1024;
const MAX_FILES = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime'];

const storageDriver = process.env.STORAGE_DRIVER || 'local';
const uploadDir = process.env.LOCAL_STORAGE_PATH || './public/uploads';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('engine_admin_session')?.value;

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll('images') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded.' }, { status: 400 });
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json({ error: `Maximum ${MAX_FILES} files allowed at a time.` }, { status: 400 });
    }

    // Ensure local upload directory exists
    if (storageDriver === 'local') {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json({ error: `Invalid file type: ${file.type}. Only images allowed.` }, { status: 400 });
      }

      const isVideo = file.type.startsWith('video/');
      if (file.size > MAX_FILE_SIZE || (!isVideo && file.size > 1024 * 1024)) {
        return NextResponse.json({ error: `File ${file.name} exceeds the permitted size.` }, { status: 400 });
      }

      const buffer = await file.arrayBuffer();
      const nodeBuffer = Buffer.from(buffer);
      
      const processedBuffer = isVideo ? nodeBuffer : await sharp(nodeBuffer).webp({ quality: 80 }).toBuffer();

      const extension = isVideo ? (file.type === 'video/quicktime' ? 'mov' : file.type.split('/')[1]) : 'webp';
      const uniqueFileName = `${crypto.randomUUID()}.${extension}`;
      let publicUrl = '';

      if (storageDriver === 'local') {
        const filePath = path.join(uploadDir, uniqueFileName);
        await fs.writeFile(filePath, processedBuffer);
        // Assuming uploadDir is inside ./public
        const publicPath = uploadDir.replace(/^\.\/public/, '');
        publicUrl = `${publicPath}/${uniqueFileName}`.replace(/\/\//g, '/');
      } else if (storageDriver === 'supabase') {
        const supabaseUrl = process.env.SUPABASE_URL || '';
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
        const supabaseBucket = process.env.SUPABASE_BUCKET || 'engine-assets';
        
        if (!supabaseUrl) {
           return NextResponse.json({ error: 'Supabase URL not configured for production driver.' }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);
        
        const { error } = await supabase.storage
          .from(supabaseBucket)
          .upload(uniqueFileName, processedBuffer, {
            contentType: file.type,
            upsert: false,
          });

        if (error) {
          console.error('Supabase upload error:', error);
          return NextResponse.json({ error: 'Failed to upload image to bucket.' }, { status: 500 });
        }

        const { data: publicUrlData } = supabase.storage
          .from(supabaseBucket)
          .getPublicUrl(uniqueFileName);

        publicUrl = publicUrlData.publicUrl;
      } else {
        // Fallback for missing supabase config or other drivers
        return NextResponse.json({ error: 'Storage driver not fully configured.' }, { status: 500 });
      }

      // Sync with Prisma MediaVault
      await prisma.mediaVault.create({
        data: {
          fileName: file.name,
          storageKey: publicUrl,
          mimeType: file.type,
          fileSize: processedBuffer.length,
          altText: file.name,
        }
      });
      await writeAuditLog({ action: 'upload', resource: 'media', metadata: { fileName: file.name, mimeType: file.type, size: processedBuffer.length } });

      uploadedUrls.push(publicUrl);
    }

    return NextResponse.json({ success: true, urls: uploadedUrls });
  } catch (error) {
    console.error('Upload handler error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
