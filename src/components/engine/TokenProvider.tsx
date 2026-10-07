import { getCachedSystemSettings } from '@/lib/db/queries';

export async function TokenProvider() {
  const settings = await getCachedSystemSettings();

  const cssPayload = `
    :root {
      --primary: ${settings.primaryColor};
      --accent: ${settings.accentColor};
      --bg-body: ${settings.backgroundColor};
      --text-main: ${settings.textColor};
      --radius: ${settings.radius};
      --font-heading: "${settings.fontHeading}", -apple-system, sans-serif;
      --font-body: "${settings.fontBody}", -apple-system, sans-serif;
    }
  `.replace(/\s+/g, ' ');

  return (
    <style
      id="system-token-streamer"
      dangerouslySetInnerHTML={{ __html: cssPayload }}
    />
  );
}
