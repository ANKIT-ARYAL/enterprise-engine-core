import { revalidateTag, revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function GET() {
  revalidateTag('pages', 'default');
  revalidateTag('system-settings', 'default');
  revalidateTag('global-content', 'default');
  revalidateTag('navigation', 'default');
  revalidatePath('/', 'layout');
  revalidatePath('/');
  return NextResponse.json({ revalidated: true, timestamp: Date.now() });
}
