import { getCachedSystemSettings } from '@/lib/db/queries';

interface SystemTokens {
  textAnimation?: string;
  cardAnimation?: string;
  buttonAnimation?: string;
  pageAnimations?: Record<string, boolean>;
  primaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  radius?: string;
  buttonRadius?: string;
  cardRadius?: string;
  containerWidth?: string;
  shadowStyle?: string;
  cardBgColor?: string;
  cardHoverBgColor?: string;
  cardBorderColor?: string;
  cardHoverBorderColor?: string;
  cardShadow?: string;
  cardHoverShadow?: string;
  buttonBgColor?: string;
  buttonHoverBgColor?: string;
  buttonTextColor?: string;
  buttonHoverTextColor?: string;
  buttonShadow?: string;
  buttonHoverShadow?: string;
  fontHeading?: string;
  fontBody?: string;
  fontSizeH1?: string;
  fontSizeH2?: string;
  fontSizeH3?: string;
  fontSizeSub?: string;
  fontSizeBody?: string;
  fontSizeBtn?: string;
  baseFontSize?: number | string;
  typeScale?: string;
  hoverEffects?: boolean;
  animations?: boolean;
  themePreset?: string;
  displayMode?: string;
  [key: string]: unknown;
}

export async function TokenProvider() {
  const settings = await getCachedSystemSettings();
  const tokens = (settings.tokens as SystemTokens | null) || {};

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
      ${tokens.primaryColor ? `--primary: ${tokens.primaryColor};` : ''}
      ${tokens.accentColor ? `--accent: ${tokens.accentColor};` : ''}
      --bg-body: ${tokens.backgroundColor || 'var(--background)'};
      --text-main: ${tokens.textColor || 'var(--foreground)'};
      --radius: ${tokens.radius || '0.5rem'};
      --button-radius: ${tokens.buttonRadius === 'var(--radius)' ? (tokens.radius || '0.5rem') : (tokens.buttonRadius || '0.5rem')};
      --card-radius: ${tokens.cardRadius === 'var(--radius)' ? (tokens.radius || '0.5rem') : (tokens.cardRadius || '0.75rem')};
      --container-max: ${tokens.containerWidth || '1440px'};
      --global-shadow: ${getShadowCss(tokens.shadowStyle || 'md')};
      
      /* Advanced Card Tokens */
      --card-bg: ${tokens.cardBgColor || 'var(--card)'};
      --card-hover-bg: ${tokens.cardHoverBgColor || 'var(--muted)'};
      --card-border: ${tokens.cardBorderColor || 'var(--border)'};
      --card-hover-border: ${tokens.cardHoverBorderColor || 'var(--border)'};
      --card-shadow: ${getShadowCss(tokens.cardShadow || 'sm')};
      --card-hover-shadow: ${getShadowCss(tokens.cardHoverShadow || 'md')};
      
      /* Advanced Button Tokens */
      --btn-bg: ${tokens.buttonBgColor || 'var(--primary)'};
      --btn-hover-bg: ${tokens.buttonHoverBgColor || 'var(--accent)'};
      --btn-text: ${tokens.buttonTextColor || 'var(--primary-foreground)'};
      --btn-hover-text: ${tokens.buttonHoverTextColor || 'var(--accent-foreground)'};
      --btn-shadow: ${getShadowCss(tokens.buttonShadow || 'sm')};
      --btn-hover-shadow: ${getShadowCss(tokens.buttonHoverShadow || 'md')};
      --button-colors-overridden: ${tokens.buttonColorOverrides === true ? '1' : '0'};
      
      --font-heading: "${tokens.fontHeading || 'Manrope'}", -apple-system, sans-serif;
      --font-body: "${tokens.fontBody || 'Manrope'}", -apple-system, sans-serif;

      /* Fluid Mathematical Typography Scale */
      --font-h1: ${tokens.fontSizeH1 || 'clamp(2.25rem, 5vw + 1rem, 4.5rem)'};
      --font-h2: ${tokens.fontSizeH2 || 'clamp(1.75rem, 3.5vw + 0.75rem, 3.25rem)'};
      --font-h3: ${tokens.fontSizeH3 || 'clamp(1.35rem, 2vw + 0.5rem, 2.25rem)'};
      --font-sub: ${tokens.fontSizeSub || 'clamp(1.05rem, 1vw + 0.25rem, 1.35rem)'};
      --font-desc: ${tokens.fontSizeBody || 'clamp(0.95rem, 0.4vw + 0.8rem, 1.15rem)'};
      --font-btn: ${tokens.fontSizeBtn || 'clamp(0.875rem, 0.2vw + 0.8rem, 1rem)'};
      ${tokens.baseFontSize ? `font-size: ${tokens.baseFontSize}px;` : ''}
      
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

  const antiFoucScript = `
    (function() {
      try {
        var stored = localStorage.getItem('enterprise-engine-appearance');
        var app = stored ? JSON.parse(stored) : null;
        var theme = (app && app.themePreset) ? app.themePreset : '${tokens.themePreset || 'slate'}';
        var mode = localStorage.getItem('enterprise-engine-display-mode') || '${tokens.displayMode || 'system'}';
        var isDark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        var root = document.documentElement;
        root.dataset.buttonColorsOverridden = '${tokens.buttonColorOverrides === true ? 'true' : 'false'}';
        root.dataset.textAnimation = '${tokens.textAnimation || 'none'}';
        root.dataset.cardAnimation = '${tokens.cardAnimation || 'none'}';
        root.dataset.buttonAnimation = '${tokens.buttonAnimation || 'none'}';
        window.__ENGINE_MOTION_PAGES__ = ${JSON.stringify(tokens.pageAnimations || {})};
        root.style.setProperty('--motion-text-delay', '${tokens.textAnimationDelay || '0ms'}');
        root.style.setProperty('--motion-card-delay', '${tokens.cardAnimationDelay || '0ms'}');
        root.style.setProperty('--motion-button-delay', '${tokens.buttonAnimationDelay || '0ms'}');
        root.classList.add('theme-' + theme);
        if (isDark) root.classList.add('dark');
        
        var radMap = {
          none: '0rem', xs: '0.25rem', sm: '0.375rem', md: '0.5rem',
          lg: '0.75rem', xl: '1rem', '2xl': '1.25rem', '3xl': '1.5rem', '4xl': '2rem'
        };
        var activeRadKey = (app && (app.radius || (app.customThemeConfig && app.customThemeConfig.radius))) || '${tokens.radiusPreset || ''}';
        var radVal = radMap[activeRadKey] || '${tokens.radius || '0.5rem'}';
        root.style.setProperty('--radius', radVal);
        root.style.setProperty('--radius-global', radVal);
        root.style.setProperty('--button-radius', radVal);
        root.style.setProperty('--card-radius', radVal);
        root.style.setProperty('--radius-btn', radVal);
        root.style.setProperty('--radius-card', radVal);
        
        var match = radVal.match(/([\\d.]+)rem/);
        var baseNum = match ? parseFloat(match[1]) : (radVal === '0' || radVal === '0rem' || radVal === 'none' ? 0 : 0.5);
        root.style.setProperty('--radius-xs', (baseNum * 0.4) + 'rem');
        root.style.setProperty('--radius-sm', (baseNum * 0.7) + 'rem');
        root.style.setProperty('--radius-md', baseNum + 'rem');
        root.style.setProperty('--radius-lg', (baseNum * 1.3) + 'rem');
        root.style.setProperty('--radius-xl', (baseNum * 1.7) + 'rem');
        root.style.setProperty('--radius-2xl', (baseNum * 2.2) + 'rem');
        root.style.setProperty('--radius-3xl', (baseNum * 3) + 'rem');
      } catch (e) {}
    })();
  `;

  return (
    <>
      <script
        id="theme-anti-fouc-script"
        dangerouslySetInnerHTML={{ __html: antiFoucScript }}
      />
      <style
        id="system-token-streamer"
        dangerouslySetInnerHTML={{ __html: cssPayload }}
      />
    </>
  );
}
