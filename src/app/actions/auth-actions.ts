'use server';

import { cookies } from 'next/headers';
import { z } from 'zod';

export async function loginAction(formData: FormData) {
  const email = formData.get('email');
  const password = formData.get('password');

  const validEmail = process.env.ADMIN_EMAIL || 'admin@engine.local';
  const validPassword = process.env.ADMIN_PASSWORD || 'admin123456';

  if (email === validEmail && password === validPassword) {
    const cookieStore = await cookies();
    cookieStore.set('engine_admin_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });
    return { success: true };
  }

  return { success: false, error: 'Invalid credentials. Check your .env file.' };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('engine_admin_session');
  return { success: true };
}
