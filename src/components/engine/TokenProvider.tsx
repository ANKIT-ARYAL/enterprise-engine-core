import { getCachedSystemSettings } from '@/lib/db/queries';

export async function TokenProvider() {
  const settings = await getCachedSystemSettings();

  const getShadowCss = (style: string) => {
    switch(style) {
      case 'none': return 'none';
      case 'sm': return '0 1px 2px 0 rgb(0 0 0 / 0.05)';
      case 'lg': return '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)';
      case 'xl': return '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)';
      default: return '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'; // md
    }
  };

  const cssPayload = `
    :root {
      --primary: ${settings.primaryColor};
      --accent: ${settings.accentColor};
      --bg-body: ${settings.backgroundColor};
      --text-main: ${settings.textColor};
      --radius: ${settings.radius};
      --button-radius: ${settings.buttonRadius === 'var(--radius)' ? settings.radius : settings.buttonRadius};
      --card-radius: ${settings.cardRadius === 'var(--radius)' ? settings.radius : settings.cardRadius};
      --container-max: ${settings.containerWidth};
      --global-shadow: ${getShadowCss(settings.shadowStyle)};
      --font-heading: "${settings.fontHeading}", -apple-system, sans-serif;
      --font-body: "${settings.fontBody}", -apple-system, sans-serif;
      
      /* Toggle Switches */
      --enable-hover: ${settings.hoverEffects ? '1' : '0'};
      --enable-animations: ${settings.animations ? '1' : '0'};
    }
    
    ${settings.animations ? `
      * { transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
    ` : ''}
    
    ${settings.hoverEffects ? `
      .card-hover:hover { transform: translateY(-4px); box-shadow: var(--global-shadow); }
      .btn-hover:hover { filter: brightness(1.1); }
    ` : ''}

    ${settings.customCss || ''}
  `;

  return (
    <style
      id="system-token-streamer"
      dangerouslySetInnerHTML={{ __html: cssPayload }}
    />
  );
}
