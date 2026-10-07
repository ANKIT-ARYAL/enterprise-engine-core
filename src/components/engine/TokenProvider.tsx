import { getCachedSystemSettings } from '@/lib/db/queries';

export async function TokenProvider() {
  const settings = await getCachedSystemSettings();
  const tokens = (settings.tokens as any) || {};

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
      --primary: ${tokens.primaryColor || '#2563eb'};
      --accent: ${tokens.accentColor || '#f97316'};
      --bg-body: ${tokens.backgroundColor || '#ffffff'};
      --text-main: ${tokens.textColor || '#0f172a'};
      --radius: ${tokens.radius || '0.5rem'};
      --button-radius: ${tokens.buttonRadius === 'var(--radius)' ? (tokens.radius || '0.5rem') : (tokens.buttonRadius || '0.5rem')};
      --card-radius: ${tokens.cardRadius === 'var(--radius)' ? (tokens.radius || '0.5rem') : (tokens.cardRadius || '0.75rem')};
      --container-max: ${tokens.containerWidth || '1440px'};
      --global-shadow: ${getShadowCss(tokens.shadowStyle || 'md')};
      
      /* Advanced Card Tokens */
      --card-bg: ${tokens.cardBgColor || '#ffffff'};
      --card-hover-bg: ${tokens.cardHoverBgColor || '#f8fafc'};
      --card-border: ${tokens.cardBorderColor || '#e2e8f0'};
      --card-hover-border: ${tokens.cardHoverBorderColor || '#cbd5e1'};
      --card-shadow: ${getShadowCss(tokens.cardShadow || 'sm')};
      --card-hover-shadow: ${getShadowCss(tokens.cardHoverShadow || 'md')};
      
      /* Advanced Button Tokens */
      --btn-bg: ${tokens.buttonBgColor || '#2563eb'};
      --btn-hover-bg: ${tokens.buttonHoverBgColor || '#1d4ed8'};
      --btn-text: ${tokens.buttonTextColor || '#ffffff'};
      --btn-hover-text: ${tokens.buttonHoverTextColor || '#ffffff'};
      --btn-shadow: ${getShadowCss(tokens.buttonShadow || 'sm')};
      --btn-hover-shadow: ${getShadowCss(tokens.buttonHoverShadow || 'md')};
      
      --font-heading: "${tokens.fontHeading || 'Inter'}", -apple-system, sans-serif;
      --font-body: "${tokens.fontBody || 'Inter'}", -apple-system, sans-serif;
      
      /* Toggle Switches */
      --enable-hover: ${tokens.hoverEffects !== false ? '1' : '0'};
      --enable-animations: ${tokens.animations !== false ? '1' : '0'};
    }
    
    ${tokens.animations !== false ? `
      * { transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
    ` : ''}
    
    ${tokens.hoverEffects !== false ? `
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
