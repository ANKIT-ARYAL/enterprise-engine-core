import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  // Artificial delay to show the loading state on the button
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Destroy the session cookie
  const cookieStore = await cookies();
  cookieStore.delete('engine_admin_session');
  
  return NextResponse.json({ success: true, message: 'Logged out successfully' }, { status: 200 });
}
