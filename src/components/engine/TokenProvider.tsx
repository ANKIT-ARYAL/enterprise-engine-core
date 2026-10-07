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
      
      /* Advanced Card Tokens */
      --card-bg: ${settings.cardBgColor};
      --card-hover-bg: ${settings.cardHoverBgColor};
      --card-border: ${settings.cardBorderColor};
      --card-hover-border: ${settings.cardHoverBorderColor};
      --card-shadow: ${getShadowCss(settings.cardShadow)};
      --card-hover-shadow: ${getShadowCss(settings.cardHoverShadow)};
      
      /* Advanced Button Tokens */
      --btn-bg: ${settings.buttonBgColor};
      --btn-hover-bg: ${settings.buttonHoverBgColor};
      --btn-text: ${settings.buttonTextColor};
      --btn-hover-text: ${settings.buttonHoverTextColor};
      --btn-shadow: ${getShadowCss(settings.buttonShadow)};
      --btn-hover-shadow: ${getShadowCss(settings.buttonHoverShadow)};
      
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
      .card-hover { background-color: var(--card-bg); border-color: var(--card-border); box-shadow: var(--card-shadow); border-radius: var(--card-radius); }
      .card-hover:hover { transform: translateY(-4px); background-color: var(--card-hover-bg); border-color: var(--card-hover-border); box-shadow: var(--card-hover-shadow); }
      
      .btn-hover { background-color: var(--btn-bg); color: var(--btn-text); box-shadow: var(--btn-shadow); border-radius: var(--button-radius); }
      .btn-hover:hover { background-color: var(--btn-hover-bg); color: var(--btn-hover-text); box-shadow: var(--btn-hover-shadow); }
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
