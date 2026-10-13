import { redirect } from 'next/navigation';

export default function AdminThemePreferencesPage() {
  redirect('/admin/settings?tab=theme-presets');
}

