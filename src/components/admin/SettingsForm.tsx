/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { updateSystemSettingsAction } from "@/app/actions/admin-mutations";
import {
  Palette,
  Type,
  Layout,
  Code,
  Save,
  CheckCircle2,
  Box,
  Download,
  ChevronDown,
  Check,
  Sparkles,
  Sliders,
  RefreshCw,
  Text,
  Maximize,
  MousePointerClick,
  Layers,
  Shield,
  Plus,
  Minus,
  Paintbrush,
  WandSparkles,
} from "lucide-react";
import { ANIMATION_PRESETS, type AnimationTarget } from "@/lib/theme/animation-presets";
import { FormBuilder } from "@/components/admin/FormBuilder";
import {
  ThemePreferences,
  NavigationPreview,
} from "@/components/admin/ThemePreferences";
import {
  UI_THEME_OPTIONS,
  FONT_OPTIONS,
  RADIUS_OPTIONS,
  RADIUS_CSS_VALUES,
  type Radius,
  type FontFamily,
  type UITheme,
} from "@/lib/theme/theme-options";
import {
  applyAppearance,
  useThemePreferences,
  type ThemeMode,
} from "@/components/theme/theme-provider";
import { useNavigationPreferences } from "@/hooks/use-navigation-preferences";
import {
  setLocalAppearance,
  notifyAppearanceChanged,
  getStoredAppearance,
  getLocalAppearance,
  APPEARANCE_CHANGE_EVENT,
  type NormalizedAppearance,
} from "@/lib/theme/appearance";
import toast from "react-hot-toast";

interface TypeScaleConfig {
  label: string;
  ratio: number;
  description: string;
  fontSizeH1: string;
  fontSizeH2: string;
  fontSizeH3: string;
  fontSizeSub: string;
  fontSizeBody: string;
  fontSizeBtn: string;
}

const TYPE_SCALE_PRESETS: Record<string, TypeScaleConfig> = {
  compact: {
    label: "Compact & Dense",
    ratio: 1.15,
    description:
      "1.150x ratio — Optimized for data-dense dashboards, tables, and compact utility workflows.",
    fontSizeH1: "clamp(1.85rem, 3.5vw + 0.6rem, 2.75rem)",
    fontSizeH2: "clamp(1.4rem, 2.2vw + 0.5rem, 2.15rem)",
    fontSizeH3: "clamp(1.15rem, 1.3vw + 0.35rem, 1.6rem)",
    fontSizeSub: "clamp(0.95rem, 0.6vw + 0.2rem, 1.15rem)",
    fontSizeBody: "clamp(0.875rem, 0.3vw + 0.75rem, 1rem)",
    fontSizeBtn: "clamp(0.8rem, 0.15vw + 0.75rem, 0.9rem)",
  },
  minorThird: {
    label: "1.200 (Subtle & Clean)",
    ratio: 1.2,
    description:
      "1.200x Minor Third — Smooth, conservative hierarchy ideal for enterprise documentation.",
    fontSizeH1: "clamp(2rem, 4vw + 0.75rem, 3.5rem)",
    fontSizeH2: "clamp(1.5rem, 2.75vw + 0.5rem, 2.6rem)",
    fontSizeH3: "clamp(1.2rem, 1.6vw + 0.4rem, 1.85rem)",
    fontSizeSub: "clamp(1rem, 0.8vw + 0.25rem, 1.25rem)",
    fontSizeBody: "clamp(0.9rem, 0.35vw + 0.75rem, 1.05rem)",
    fontSizeBtn: "clamp(0.825rem, 0.2vw + 0.75rem, 0.95rem)",
  },
  majorThird: {
    label: "1.250 (Standard Balanced)",
    ratio: 1.25,
    description:
      "1.250x Major Third — Universal golden middle for modern web applications and marketing sites.",
    fontSizeH1: "clamp(2.25rem, 5vw + 1rem, 4.5rem)",
    fontSizeH2: "clamp(1.75rem, 3.5vw + 0.75rem, 3.25rem)",
    fontSizeH3: "clamp(1.35rem, 2vw + 0.5rem, 2.25rem)",
    fontSizeSub: "clamp(1.05rem, 1vw + 0.25rem, 1.35rem)",
    fontSizeBody: "clamp(0.95rem, 0.4vw + 0.8rem, 1.15rem)",
    fontSizeBtn: "clamp(0.875rem, 0.2vw + 0.8rem, 1rem)",
  },
  perfectFourth: {
    label: "1.333 (Editorial & Bold)",
    ratio: 1.333,
    description:
      "1.333x Perfect Fourth — Strong contrast between headings and body text, great for storytelling.",
    fontSizeH1: "clamp(2.5rem, 6vw + 1rem, 5.25rem)",
    fontSizeH2: "clamp(1.95rem, 4vw + 0.8rem, 3.75rem)",
    fontSizeH3: "clamp(1.45rem, 2.5vw + 0.6rem, 2.6rem)",
    fontSizeSub: "clamp(1.1rem, 1.2vw + 0.3rem, 1.45rem)",
    fontSizeBody: "clamp(1rem, 0.45vw + 0.85rem, 1.2rem)",
    fontSizeBtn: "clamp(0.9rem, 0.25vw + 0.85rem, 1.05rem)",
  },
  augmentedFourth: {
    label: "1.414 (Brutalist Giant)",
    ratio: 1.414,
    description:
      "1.414x Augmented Fourth — Punchy, high-impact titles with pronounced visual drama.",
    fontSizeH1: "clamp(2.75rem, 7vw + 1.25rem, 6rem)",
    fontSizeH2: "clamp(2.15rem, 4.5vw + 0.9rem, 4.25rem)",
    fontSizeH3: "clamp(1.55rem, 2.8vw + 0.7rem, 2.9rem)",
    fontSizeSub: "clamp(1.15rem, 1.3vw + 0.35rem, 1.55rem)",
    fontSizeBody: "clamp(1.05rem, 0.5vw + 0.9rem, 1.25rem)",
    fontSizeBtn: "clamp(0.95rem, 0.3vw + 0.9rem, 1.1rem)",
  },
  goldenRatio: {
    label: "1.618 (Golden Ratio Luxury)",
    ratio: 1.618,
    description:
      "1.618x Golden Ratio — Classical harmonic proportions with commanding hero prominence.",
    fontSizeH1: "clamp(3rem, 8vw + 1.5rem, 7rem)",
    fontSizeH2: "clamp(2.35rem, 5vw + 1rem, 4.8rem)",
    fontSizeH3: "clamp(1.65rem, 3vw + 0.75rem, 3.2rem)",
    fontSizeSub: "clamp(1.2rem, 1.5vw + 0.4rem, 1.65rem)",
    fontSizeBody: "clamp(1.05rem, 0.5vw + 0.9rem, 1.3rem)",
    fontSizeBtn: "clamp(0.95rem, 0.3vw + 0.9rem, 1.15rem)",
  },
};

function adjustClamp(val: string, deltaRem: number): string {
  if (!val) return val;
  const clampMatch = val.match(
    /^clamp\(\s*([\d.]+)rem\s*,\s*([^,]+)\s*,\s*([\d.]+)rem\s*\)$/,
  );
  if (clampMatch) {
    const min = Math.max(
      0.5,
      parseFloat((parseFloat(clampMatch[1]) + deltaRem).toFixed(3)),
    );
    const max = Math.max(
      min,
      parseFloat((parseFloat(clampMatch[3]) + deltaRem * 1.5).toFixed(3)),
    );
    return `clamp(${min}rem, ${clampMatch[2].trim()}, ${max}rem)`;
  }
  const remMatch = val.match(/^([\d.]+)rem$/);
  if (remMatch) {
    const next = Math.max(
      0.5,
      parseFloat((parseFloat(remMatch[1]) + deltaRem).toFixed(3)),
    );
    return `${next}rem`;
  }
  return val;
}

const selectedClass =
  "border-primary bg-primary/10 ring-2 ring-primary/30 text-primary dark:border-primary dark:bg-primary/20 dark:ring-primary/40";
const idleClass =
  "border-border/80 hover:border-primary/50 hover:bg-muted/40 transition-all";

function StudioSection({
  title,
  description,
  badge,
  children,
}: {
  title: string;
  description: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-border rounded-card overflow-hidden bg-card shadow-sm w-full">
      <div className="px-5 py-4 border-b border-border bg-muted/20 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-base text-foreground flex items-center gap-2">
            {title}
            {badge && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {badge}
              </span>
            )}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </div>
      <div className="p-5 md:p-6 space-y-5 w-full">{children}</div>
    </div>
  );
}

export default function SettingsForm({
  initialSettings,
}: {
  initialSettings: any;
  availablePages?: any[];
}) {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "theme-presets";
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);

  const { mode: themeMode, setThemeMode } = useThemePreferences();
  const { navigationMode, setNavigationMode } = useNavigationPreferences();

  const tokens = (initialSettings.tokens as any) || {};
  const [liveTokens, setLiveTokens] = useState(() => {
    const theme = tokens.themePreset || "slate";
    const font = tokens.fontFamily || "manrope";
    const rad = tokens.radiusPreset || "md";
    const themeOpt = UI_THEME_OPTIONS.find((o) => o.value === theme);
    const radiusCss = RADIUS_CSS_VALUES[rad as Radius] || "0.5rem";
    const activeColor =
      themeOpt?.previewColor || tokens.primaryColor || "#2563eb";
    return {
      ...tokens,
      themePreset: theme,
      fontFamily: font,
      radiusPreset: rad,
      radius: tokens.radius || radiusCss,
      buttonRadius: tokens.buttonRadius || radiusCss,
      cardRadius: tokens.cardRadius || radiusCss,
      primaryColor: activeColor,
      // Button colors inherit from the selected preset until explicitly
      // changed in the Buttons & Roundness tab.
      buttonBgColor: tokens.buttonBgColor || activeColor,
      buttonColorOverrides: tokens.buttonColorOverrides === true,
      fontSizeH1: tokens.fontSizeH1 || "clamp(2.25rem, 5vw + 1rem, 4.5rem)",
      fontSizeH2:
        tokens.fontSizeH2 || "clamp(1.75rem, 3.5vw + 0.75rem, 3.25rem)",
      fontSizeH3: tokens.fontSizeH3 || "clamp(1.35rem, 2vw + 0.5rem, 2.25rem)",
      fontSizeSub:
        tokens.fontSizeSub || "clamp(1.05rem, 1vw + 0.25rem, 1.35rem)",
      fontSizeBody:
        tokens.fontSizeBody || "clamp(0.95rem, 0.4vw + 0.8rem, 1.15rem)",
      fontSizeBtn:
        tokens.fontSizeBtn || "clamp(0.875rem, 0.2vw + 0.8rem, 1rem)",
      baseFontSize: tokens.baseFontSize || 16,
      typeScale: tokens.typeScale || "majorThird",
      textAnimation: tokens.textAnimation || "none",
      cardAnimation: tokens.cardAnimation || "none",
      buttonAnimation: tokens.buttonAnimation || "none",
      textAnimationDelay: tokens.textAnimationDelay || "0ms",
      cardAnimationDelay: tokens.cardAnimationDelay || "0ms",
      buttonAnimationDelay: tokens.buttonAnimationDelay || "0ms",
      pageAnimations: tokens.pageAnimations || {},
    };
  });

  // Ensure active theme is fully propagated when switching tabs or loading subtabs
  useEffect(() => {
    const stored =
      typeof window !== "undefined"
        ? getStoredAppearance(window.localStorage)
        : null;
    const currentTheme = (liveTokens.themePreset ||
      stored?.themePreset ||
      tokens.themePreset ||
      "slate") as UITheme;
    const currentFont = (liveTokens.fontFamily ||
      stored?.fontFamily ||
      tokens.fontFamily ||
      "manrope") as FontFamily;
    const currentRad = (liveTokens.radiusPreset ||
      stored?.radius ||
      tokens.radiusPreset ||
      "md") as Radius;

    applyAppearance(
      {
        themePreset: currentTheme,
        fontFamily: currentFont,
        radius: currentRad,
      },
      themeMode,
    );
  }, [activeTab, themeMode]);

  // Listen to appearance changes emitted by theme presets, dark mode switcher, etc.
  useEffect(() => {
    const handleAppearanceChange = (e: Event) => {
      const next = (e as CustomEvent<NormalizedAppearance>).detail;
      if (next) {
        const themeOpt = UI_THEME_OPTIONS.find(
          (o) => o.value === next.themePreset,
        );
        const radiusCss = RADIUS_CSS_VALUES[next.radius] || "0.5rem";
        setLiveTokens((prev: any) => ({
          ...prev,
          themePreset: next.themePreset,
          fontFamily: next.fontFamily,
          radiusPreset: next.radius,
          radius: radiusCss,
          buttonRadius: radiusCss,
          cardRadius: radiusCss,
          ...(themeOpt?.previewColor
            ? {
                primaryColor: themeOpt.previewColor,
              }
            : {}),
        }));
      }
    };
    window.addEventListener(APPEARANCE_CHANGE_EVENT, handleAppearanceChange);
    return () =>
      window.removeEventListener(
        APPEARANCE_CHANGE_EVENT,
        handleAppearanceChange,
      );
  }, []);

  const handleLiveChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === "checkbox";
    const checked = isCheckbox ? (e.target as HTMLInputElement).checked : false;

    setLiveTokens((prev: any) => ({
      ...prev,
      ...(name.startsWith("button")
        ? { buttonColorOverrides: true }
        : {}),
      [name]: isCheckbox ? checked : value,
    }));
  };

  // Dynamically inject CSS variables to the document root to update the Admin UI live
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.textAnimation = liveTokens.textAnimation || "none";
    root.dataset.cardAnimation = liveTokens.cardAnimation || "none";
    root.dataset.buttonAnimation = liveTokens.buttonAnimation || "none";
    root.style.setProperty("--motion-text-delay", liveTokens.textAnimationDelay || "0ms");
    root.style.setProperty("--motion-card-delay", liveTokens.cardAnimationDelay || "0ms");
    root.style.setProperty("--motion-button-delay", liveTokens.buttonAnimationDelay || "0ms");
    root.dataset.buttonColorsOverridden = liveTokens.buttonColorOverrides
      ? "true"
      : "false";
    // Core Colors
    if (liveTokens.primaryColor)
      root.style.setProperty("--primary", liveTokens.primaryColor);
    if (liveTokens.accentColor)
      root.style.setProperty("--accent", liveTokens.accentColor);
    if (liveTokens.backgroundColor)
      root.style.setProperty("--bg-body", liveTokens.backgroundColor);
    if (liveTokens.textColor)
      root.style.setProperty("--text-main", liveTokens.textColor);

    // Geometry & Radius
    if (liveTokens.radius !== undefined) {
      const rad = String(liveTokens.radius);
      root.style.setProperty("--radius", rad);
      root.style.setProperty("--radius-global", rad);
      const numMatch = rad.match(/([\d.]+)rem/);
      const baseNum = numMatch
        ? parseFloat(numMatch[1])
        : rad === "0" || rad === "0rem" || rad === "none"
          ? 0
          : 0.5;
      root.style.setProperty("--radius-xs", `${baseNum * 0.4}rem`);
      root.style.setProperty("--radius-sm", `${baseNum * 0.7}rem`);
      root.style.setProperty("--radius-md", `${baseNum}rem`);
      root.style.setProperty("--radius-lg", `${baseNum * 1.3}rem`);
      root.style.setProperty("--radius-xl", `${baseNum * 1.7}rem`);
      root.style.setProperty("--radius-2xl", `${baseNum * 2.2}rem`);
      root.style.setProperty("--radius-3xl", `${baseNum * 3}rem`);
    }
    if (liveTokens.buttonRadius !== undefined) {
      const bRad =
        liveTokens.buttonRadius === "var(--radius)"
          ? liveTokens.radius || "0.5rem"
          : liveTokens.buttonRadius;
      root.style.setProperty("--button-radius", bRad);
      root.style.setProperty("--radius-btn", bRad);
    }
    if (liveTokens.cardRadius !== undefined) {
      const cRad =
        liveTokens.cardRadius === "var(--radius)"
          ? liveTokens.radius || "0.5rem"
          : liveTokens.cardRadius;
      root.style.setProperty("--card-radius", cRad);
      root.style.setProperty("--radius-card", cRad);
    }
    if (liveTokens.containerWidth)
      root.style.setProperty("--container-max", liveTokens.containerWidth);

    // Typography
    if (liveTokens.fontHeading)
      root.style.setProperty(
        "--font-heading",
        `"${liveTokens.fontHeading}", -apple-system, sans-serif`,
      );
    if (liveTokens.fontBody)
      root.style.setProperty(
        "--font-body",
        `"${liveTokens.fontBody}", -apple-system, sans-serif`,
      );
    if (liveTokens.fontSizeH1)
      root.style.setProperty("--font-h1", liveTokens.fontSizeH1);
    if (liveTokens.fontSizeH2)
      root.style.setProperty("--font-h2", liveTokens.fontSizeH2);
    if (liveTokens.fontSizeH3)
      root.style.setProperty("--font-h3", liveTokens.fontSizeH3);
    if (liveTokens.fontSizeSub)
      root.style.setProperty("--font-sub", liveTokens.fontSizeSub);
    if (liveTokens.fontSizeBody)
      root.style.setProperty("--font-desc", liveTokens.fontSizeBody);
    if (liveTokens.fontSizeBtn)
      root.style.setProperty("--font-btn", liveTokens.fontSizeBtn);
    if (liveTokens.baseFontSize)
      root.style.setProperty("font-size", `${liveTokens.baseFontSize}px`);

    // Components (Cards)
    if (liveTokens.cardBgColor)
      root.style.setProperty("--card-bg", liveTokens.cardBgColor);
    if (liveTokens.cardHoverBgColor)
      root.style.setProperty("--card-hover-bg", liveTokens.cardHoverBgColor);
    if (liveTokens.cardBorderColor)
      root.style.setProperty("--card-border", liveTokens.cardBorderColor);

    // Components (Buttons)
    if (liveTokens.buttonBgColor) {
      root.style.setProperty(
        "--btn-bg",
        liveTokens.buttonColorOverrides
          ? liveTokens.buttonBgColor
          : "var(--primary)",
      );
    } else {
      root.style.setProperty("--btn-bg", "var(--primary)");
    }
    if (liveTokens.buttonTextColor && liveTokens.buttonColorOverrides) {
      root.style.setProperty("--btn-text", liveTokens.buttonTextColor);
    } else {
      root.style.setProperty("--btn-text", "var(--primary-foreground)");
    }
    if (liveTokens.buttonHoverBgColor && liveTokens.buttonColorOverrides)
      root.style.setProperty("--btn-hover-bg", liveTokens.buttonHoverBgColor);
    if (liveTokens.buttonHoverTextColor && liveTokens.buttonColorOverrides)
      root.style.setProperty(
        "--btn-hover-text",
        liveTokens.buttonHoverTextColor,
      );
  }, [liveTokens]);

  const selectThemePreset = (themeValue: UITheme) => {
    const option = UI_THEME_OPTIONS.find((o) => o.value === themeValue);
    const newColor = option?.previewColor || "var(--primary)";

    setLiveTokens((prev: any) => ({
      ...prev,
      themePreset: themeValue,
      primaryColor: newColor,
    }));

    const appearance: NormalizedAppearance = {
      themePreset: themeValue,
      fontFamily: liveTokens.fontFamily || "manrope",
      radius: liveTokens.radiusPreset || "md",
    };
    applyAppearance(appearance, themeMode);
    setLocalAppearance(window.localStorage, appearance);
    notifyAppearanceChanged(appearance);
  };

  const selectFontPreset = (fontValue: FontFamily) => {
    const font = FONT_OPTIONS.find((f) => f.value === fontValue);
    const family = font?.family || "Inter, sans-serif";
    setLiveTokens((prev: any) => ({
      ...prev,
      fontFamily: fontValue,
      fontHeading: font?.label || prev.fontHeading,
      fontBody: font?.label || prev.fontBody,
    }));

    const currentTheme = (liveTokens.themePreset ||
      (typeof window !== "undefined"
        ? getStoredAppearance(window.localStorage)?.themePreset
        : null) ||
      initialSettings?.tokens?.themePreset ||
      "slate") as UITheme;

    const appearance: NormalizedAppearance = {
      themePreset: currentTheme,
      fontFamily: fontValue,
      radius: (liveTokens.radiusPreset || "md") as Radius,
    };
    applyAppearance(appearance, themeMode);
    setLocalAppearance(window.localStorage, appearance);
    notifyAppearanceChanged(appearance);
  };

  const selectButtonRadiusPreset = (radiusValue: Radius | "pill") => {
    const cssVal =
      radiusValue === "pill"
        ? "9999px"
        : RADIUS_CSS_VALUES[radiusValue] || "0.5rem";
    setLiveTokens((prev: any) => ({
      ...prev,
      buttonRadius: cssVal,
    }));
    document.documentElement.style.setProperty("--button-radius", cssVal);
    document.documentElement.style.setProperty("--radius-btn", cssVal);
  };

  const selectCardRadiusPreset = (radiusValue: Radius) => {
    const cssVal = RADIUS_CSS_VALUES[radiusValue] || "0.5rem";
    setLiveTokens((prev: any) => ({
      ...prev,
      cardRadius: cssVal,
      radiusPreset: radiusValue,
      radius: cssVal,
    }));
    document.documentElement.style.setProperty("--card-radius", cssVal);
    document.documentElement.style.setProperty("--radius-card", cssVal);
    const currentTheme = (liveTokens.themePreset ||
      (typeof window !== "undefined"
        ? getStoredAppearance(window.localStorage)?.themePreset
        : null) ||
      initialSettings?.tokens?.themePreset ||
      "slate") as UITheme;
    const appearance: NormalizedAppearance = {
      themePreset: currentTheme,
      fontFamily: liveTokens.fontFamily || "manrope",
      radius: radiusValue,
    };
    applyAppearance(appearance, themeMode);
    setLocalAppearance(window.localStorage, appearance);
    notifyAppearanceChanged(appearance);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const storedApp =
      typeof window !== "undefined"
        ? getStoredAppearance(window.localStorage)
        : null;
    const targetTheme = (liveTokens.themePreset ||
      storedApp?.themePreset ||
      initialSettings?.tokens?.themePreset ||
      "slate") as UITheme;
    const targetFont = (liveTokens.fontFamily ||
      storedApp?.fontFamily ||
      initialSettings?.tokens?.fontFamily ||
      "manrope") as FontFamily;
    const targetRadius = (liveTokens.radiusPreset ||
      storedApp?.radius ||
      initialSettings?.tokens?.radiusPreset ||
      "md") as Radius;

    const selectedThemeOption = UI_THEME_OPTIONS.find(
      (o) => o.value === targetTheme,
    );
    const radiusCss = RADIUS_CSS_VALUES[targetRadius] || "0.5rem";

    const updatedTokens = {
      ...liveTokens,
      themePreset: targetTheme,
      fontFamily: targetFont,
      radiusPreset: targetRadius,
      radius: radiusCss,
      buttonRadius: liveTokens.buttonRadius || radiusCss,
      cardRadius: liveTokens.cardRadius || radiusCss,
      primaryColor:
        selectedThemeOption?.previewColor ||
        liveTokens.primaryColor ||
        initialSettings?.tokens?.primaryColor,
      buttonColorOverrides: liveTokens.buttonColorOverrides === true,
      navigationMode: navigationMode,
      displayMode: themeMode,
    };

    // Do not persist resolved preset defaults as button overrides.
    // This keeps Theme Presets as the source of truth until a button color is
    // explicitly changed in Design Buttons.
    if (!updatedTokens.buttonColorOverrides) {
      delete updatedTokens.buttonBgColor;
      delete updatedTokens.buttonHoverBgColor;
      delete updatedTokens.buttonTextColor;
      delete updatedTokens.buttonHoverTextColor;
    }

    const data = {
      siteName: liveTokens.siteName || initialSettings.siteName,
      customCss: liveTokens.customCss || initialSettings.customCss || "",
      tokens: updatedTokens,
    };

    startTransition(async () => {
      try {
        await updateSystemSettingsAction(data as any);
        const appearance: NormalizedAppearance = {
          themePreset: targetTheme,
          fontFamily: targetFont,
          radius: targetRadius,
        };
        setLocalAppearance(window.localStorage, appearance);
        notifyAppearanceChanged(appearance);
        setSuccess(true);
        toast.success("Tokens deployed and synchronized with database!");
        setTimeout(() => setSuccess(false), 3000);
      } catch (err: any) {
        toast.error(err.message || "Failed to Sync Changes");
      }
    });
  }

  const displayModes: [ThemeMode, string, string][] = [
    ["light", "Light", "Bright surfaces & dark text"],
    ["dark", "Dark", "Dim surfaces & light text"],
    ["system", "System", "Follow device preference"],
  ];

  const studioTabs = [
    { id: "theme-presets", label: "Theme & Presets", icon: Palette },
    {
      id: "design-buttons",
      label: "Buttons & Roundness",
      icon: MousePointerClick,
    },
    { id: "design-cards", label: "Cards & Surfaces", icon: Layers },
    { id: "design-animations", label: "Animations", icon: WandSparkles },
    { id: "design-container", label: "Layout & Navigation", icon: Layout },
    { id: "text-sizes", label: "Sizes & Fluid Scale", icon: Sliders },
    { id: "comp-form-builder", label: "Dynamic Form Builder", icon: Box },
    { id: "advanced-css", label: "Custom Scripts & CSS", icon: Code },
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="h-[calc(100vh-2rem)] flex flex-col w-full"
    >
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-card-border shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            System Design Studio
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Single-source-of-truth token architecture governing both admin
            workspaces and public views.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold border border-card-border bg-card-bg text-surface-text rounded-lg">
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{
                backgroundColor: liveTokens.buttonBgColor || "var(--primary)",
              }}
            />
            <span className="capitalize">
              Active: {liveTokens.themePreset || "Slate"}
            </span>
          </div>
          <button
            disabled={isPending}
            type="submit"
            style={{
              backgroundColor: liveTokens.buttonBgColor || "var(--primary)",
              color: liveTokens.buttonTextColor || "var(--primary-foreground)",
              borderRadius: liveTokens.buttonRadius || "var(--radius)",
            }}
            className="flex items-center gap-2 px-6 py-2 text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-70 shadow-sm"
          >
            <span className="flex items-center gap-2">
              {success ? <CheckCircle2 size={16} /> : <Save size={16} />}
              <span>
                {isPending
                  ? "Syncing..."
                  : success
                    ? "Synced!"
                    : "Sync Changes"}
              </span>
            </span>
          </button>
        </div>
      </div>

      {/* Top Studio Subtabs Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 shrink-0 custom-scrollbar w-full">
        {studioTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const TabIcon = tab.icon;
          return (
            <Link
              key={tab.id}
              href={`/admin/settings?tab=${tab.id}`}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                isActive
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <TabIcon size={14} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Workspace */}
      <div className="flex gap-6 flex-1 min-h-0 w-full">
        {/* Center Column: Precision Control Deck */}
        <div className="flex-1 overflow-y-auto pr-2 pb-20 custom-scrollbar w-full">
          <div className="w-full space-y-6">
            {/* TAB: THEME PRESETS & MASTER OVERVIEW */}
            {activeTab === "theme-presets" && (
              <div className="w-full animate-in fade-in duration-200">
                <ThemePreferences
                  initialSettings={initialSettings}
                  currentTokens={liveTokens}
                  onTokensChange={setLiveTokens}
                  onAppearanceChange={(next) => {
                    const themeOpt = UI_THEME_OPTIONS.find(
                      (o) => o.value === next.themePreset,
                    );
                    const radiusCss =
                      RADIUS_CSS_VALUES[next.radius] || "0.5rem";
                    setLiveTokens((prev: any) => ({
                      ...prev,
                      themePreset: next.themePreset,
                      fontFamily: next.fontFamily,
                      radiusPreset: next.radius,
                      radius: radiusCss,
                      buttonRadius: radiusCss,
                      cardRadius: radiusCss,
                      ...(themeOpt?.previewColor
                        ? {
                            primaryColor: themeOpt.previewColor,
                            buttonBgColor: themeOpt.previewColor,
                          }
                        : {}),
                    }));
                  }}
                />
              </div>
            )}



            {/* TAB: BUTTONS & ROUNDNESS */}
            {activeTab === "design-buttons" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Corner Radius Engineering */}
                <StudioSection
                  title="Button Corner Radius Engineering"
                  description="Set the roundness of action buttons across the entire platform. Select from the 9 curated scales or pill mode."
                  badge="10 Radius Levels"
                >
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                    {RADIUS_OPTIONS.map((option) => {
                      const isCurrent =
                        (liveTokens.radiusPreset || "md") === option.value &&
                        liveTokens.buttonRadius !== "9999px";
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => selectButtonRadiusPreset(option.value)}
                          className={`flex h-24 flex-col items-center justify-center rounded-xl border p-2 transition-all ${isCurrent ? selectedClass : idleClass}`}
                        >
                          <span
                            className="size-8 border-2 border-primary bg-primary/20 transition-all"
                            style={{
                              borderRadius: RADIUS_CSS_VALUES[option.value],
                            }}
                          />
                          <span className="mt-2 text-muted-foreground text-xs font-medium">
                            {option.label}
                          </span>
                        </button>
                      );
                    })}
                    {/* Pill Option */}
                    <button
                      type="button"
                      onClick={() => selectButtonRadiusPreset("pill")}
                      className={`flex h-24 flex-col items-center justify-center rounded-xl border p-2 transition-all ${liveTokens.buttonRadius === "9999px" ? selectedClass : idleClass}`}
                    >
                      <span className="w-10 h-6 border-2 border-primary bg-primary/20 transition-all rounded-full" />
                      <span className="mt-2 text-muted-foreground text-xs font-medium">
                        Pill (Full)
                      </span>
                    </button>
                  </div>
                </StudioSection>



                {/* Button Color Styling Overrides */}
                <StudioSection
                  title="Button Color Customization"
                  description="Customize exact colors for default and hover states."
                  badge="Colors"
                >
                  <div className="space-y-4">
                    {[
                      {
                        id: "buttonBgColor",
                        label: "Default Button Background Color",
                        val: liveTokens.buttonBgColor || "#000000",
                      },
                      {
                        id: "buttonHoverBgColor",
                        label: "Button Hover Background Color",
                        val: liveTokens.buttonHoverBgColor || "#333333",
                      },
                      {
                        id: "buttonTextColor",
                        label: "Button Text Color",
                        val: liveTokens.buttonTextColor || "#ffffff",
                      },
                      {
                        id: "buttonHoverTextColor",
                        label: "Button Hover Text Color",
                        val: liveTokens.buttonHoverTextColor || "#ffffff",
                      },
                    ].map((color) => (
                      <div
                        key={color.id}
                        className="flex items-center justify-between gap-4 py-1"
                      >
                        <label className="text-sm font-medium opacity-90">
                          {color.label}
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            name={color.id}
                            value={color.val}
                            onChange={handleLiveChange}
                            className="w-24 px-2 py-1 text-xs font-mono border rounded-lg bg-transparent border-card-border text-center uppercase"
                          />
                          <input
                            type="color"
                            name={color.id}
                            value={color.val}
                            onChange={handleLiveChange}
                            className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </StudioSection>
              </div>
            )}

            {/* TAB: ANIMATIONS */}
            {activeTab === "design-animations" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <StudioSection
                  title="Motion System"
                  description="Choose one entrance behavior for every text, card, and button across the platform. Settings are persisted as global design tokens."
                  badge="Global Motion"
                >
                  <div className="space-y-8">
                    {(["text", "card", "button"] as AnimationTarget[]).map((target) => {
                      const field = `${target}Animation`;
                      const current = liveTokens[field] || "none";
                      return (
                        <div key={target} className="space-y-3">
                          <div>
                            <h3 className="text-sm font-semibold capitalize">{target}s</h3>
                            <p className="text-xs text-muted-foreground">{target === "text" ? "Headings, labels, and copy" : target === "card" ? "Cards, panels, and surfaces" : "Primary and action buttons"}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                            {ANIMATION_PRESETS[target].map((preset) => (
                              <button
                                key={preset.value}
                                type="button"
                                name={field}
                                onClick={() => setLiveTokens((prev: any) => ({ ...prev, [field]: preset.value }))}
                                className={`rounded-xl border p-4 text-left transition-all ${current === preset.value ? selectedClass : idleClass}`}
                              >
                                <span className={`mb-3 flex h-10 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold ${preset.className}`}>
                                  Aa
                                </span>
                                <span className="block text-xs font-semibold">{preset.label}</span>
                                <span className="mt-1 block text-[11px] text-muted-foreground">{preset.description}</span>
                              </button>
                            ))}
                          </div>
                          <label className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">Delay before {target} animation</span>
                            <input
                              type="number"
                              min="0"
                              max="5000"
                              step="50"
                              value={Number.parseInt(liveTokens[`${target}AnimationDelay`] || "0", 10)}
                              onChange={(event) => setLiveTokens((prev: any) => ({ ...prev, [`${target}AnimationDelay`]: `${event.target.value}ms` }))}
                              className="w-24 rounded-md border border-border bg-background px-2 py-1 text-right text-foreground"
                            />
                            <span>ms</span>
                          </label>
                        </div>
                      );
                    })}
                    <div className="border-t border-border pt-6">
                      <h3 className="text-sm font-semibold">Page animation controls</h3>
                      <p className="mt-1 text-xs text-muted-foreground">Disable motion on specific frontend routes while keeping it enabled everywhere else.</p>
                      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {["/", "/about-us", "/faq", "/blogs", "/contact-us", "/privacy", "/terms"].map((path) => (
                          <label key={path} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs">
                            <input
                              type="checkbox"
                              checked={liveTokens.pageAnimations?.[path] !== false}
                              onChange={(event) => setLiveTokens((prev: any) => ({ ...prev, pageAnimations: { ...(prev.pageAnimations || {}), [path]: event.target.checked } }))}
                            />
                            <span>{path === "/" ? "Homepage" : path.slice(1).replaceAll("-", " ")}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </StudioSection>
              </div>
            )}

            {/* TAB: CARDS & SURFACES */}
            {activeTab === "design-cards" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Corner Radius Engineering */}
                <StudioSection
                  title="Card & Surface Corner Radius Engineering"
                  description="Set how soft or structured surface containers and dashboard cards feel."
                  badge="9 Radius Levels"
                >
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                    {RADIUS_OPTIONS.map((option) => {
                      const isCurrent =
                        (liveTokens.radiusPreset || "md") === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => selectCardRadiusPreset(option.value)}
                          className={`flex h-24 flex-col items-center justify-center rounded-xl border p-2 transition-all ${isCurrent ? selectedClass : idleClass}`}
                        >
                          <span
                            className="size-10 border-2 border-primary bg-primary/20 transition-all"
                            style={{
                              borderRadius: RADIUS_CSS_VALUES[option.value],
                            }}
                          />
                          <span className="mt-2 text-muted-foreground text-xs font-medium">
                            {option.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </StudioSection>

                {/* Interactive Card Showcase */}
                <StudioSection
                  title="Interactive Card Showcase"
                  description="Live preview of a container card reflecting your active radius, border, and surface tokens."
                  badge="Preview"
                >
                  <div className="p-6 rounded-xl border border-border/80 bg-muted/20 w-full">
                    <div
                      className="border border-border bg-card p-6 shadow-sm transition-all w-full"
                      style={{
                        borderRadius: liveTokens.cardRadius || "0.75rem",
                      }}
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-border">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                            <Layers size={16} />
                          </span>
                          <span className="font-semibold text-sm text-foreground">
                            Operational Metrics
                          </span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          Active
                        </span>
                      </div>

                      <div className="py-4 space-y-2">
                        <h3 className="font-bold text-base text-foreground">
                          Sub-Second Execution
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Enterprise engine workloads are operating with zero
                          regression and real-time state synchronization.
                        </p>
                      </div>

                      <div className="pt-2 flex items-center justify-between">
                        <span className="text-xs font-mono text-muted-foreground">
                          Latency: 14ms
                        </span>
                        <button
                          type="button"
                          style={{
                            borderRadius: liveTokens.buttonRadius || "0.5rem",
                          }}
                          className="px-4 py-1.5 bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs"
                        >
                          Inspect Trace
                        </button>
                      </div>
                    </div>
                  </div>
                </StudioSection>

                {/* Card Surface Colors */}
                <StudioSection
                  title="Surface & Border Colors"
                  description="Fine-tune surface fill and border outlines."
                  badge="Colors"
                >
                  <div className="space-y-4">
                    {[
                      {
                        id: "cardBgColor",
                        label: "Card Base Background",
                        val: liveTokens.cardBgColor || "#ffffff",
                      },
                      {
                        id: "cardHoverBgColor",
                        label: "Card Hover State",
                        val: liveTokens.cardHoverBgColor || "#f8fafc",
                      },
                      {
                        id: "cardBorderColor",
                        label: "Card Outline Border",
                        val: liveTokens.cardBorderColor || "#e2e8f0",
                      },
                    ].map((color) => (
                      <div
                        key={color.id}
                        className="flex items-center justify-between gap-4 py-1"
                      >
                        <label className="text-sm font-medium opacity-90">
                          {color.label}
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            name={color.id}
                            value={color.val}
                            onChange={handleLiveChange}
                            className="w-24 px-2 py-1 text-xs font-mono border rounded-lg bg-transparent border-card-border text-center uppercase"
                          />
                          <input
                            type="color"
                            name={color.id}
                            value={color.val}
                            onChange={handleLiveChange}
                            className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </StudioSection>
              </div>
            )}

            {/* TAB: LAYOUT & NAVIGATION */}
            {activeTab === "design-container" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Navigation Rail Mode */}
                <StudioSection
                  title="Navigation Rail Mode"
                  description="Choose between a compact rail layout (icons only) or an expanded sidebar with full labels."
                  badge="Navigation"
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    {(["compact", "expanded"] as const).map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => {
                          setNavigationMode(value);
                          setLiveTokens((prev: any) => ({
                            ...prev,
                            navigationMode: value,
                          }));
                        }}
                        className={`flex items-center gap-4 rounded-xl border p-4 text-left transition-all ${navigationMode === value ? selectedClass : idleClass}`}
                      >
                        <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg border border-border/60">
                          <NavigationPreview mode={value} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="block font-semibold text-sm capitalize text-foreground">
                            {value}
                          </span>
                          <span className="mt-1 block text-muted-foreground text-xs">
                            {value === "compact"
                              ? "Icons only (Rail mode)"
                              : "Icons and labels (Expanded)"}
                          </span>
                        </div>
                        {navigationMode === value && (
                          <span className="ml-auto flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0 shadow-xs">
                            <Check size={12} />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </StudioSection>

                {/* Container Width & Padding */}
                <StudioSection
                  title="Container Grid & Layout Bounds"
                  description="Control maximum width constraints and responsive container padding."
                  badge="Layout"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-1">
                      <label className="text-sm font-medium opacity-90">
                        Max Container Width
                      </label>
                      <select
                        name="containerWidth"
                        value={liveTokens.containerWidth || "1440px"}
                        onChange={handleLiveChange as any}
                        className="w-1/2 px-3 py-2 text-sm border rounded-lg bg-transparent border-card-border"
                      >
                        <option value="1024px">1024px (Tight)</option>
                        <option value="1200px">1200px (Classic Desktop)</option>
                        <option value="1440px">
                          1440px (Modern Widescreen)
                        </option>
                        <option value="1600px">1600px (Ultra Wide)</option>
                        <option value="100%">100% (Fluid Full Width)</option>
                      </select>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <label className="text-sm font-medium opacity-90">
                        Global Base Padding
                      </label>
                      <select
                        name="containerPadding"
                        value={
                          liveTokens.containerPadding ||
                          "clamp(1rem, 4vw, 3rem)"
                        }
                        onChange={handleLiveChange as any}
                        className="w-1/2 px-3 py-2 text-sm border rounded-lg bg-transparent border-card-border"
                      >
                        <option value="clamp(1rem, 4vw, 3rem)">
                          Fluid (Responsive)
                        </option>
                        <option value="1rem">1rem (Fixed Mobile)</option>
                        <option value="2rem">2rem (Fixed Standard)</option>
                      </select>
                    </div>
                  </div>
                </StudioSection>
              </div>
            )}

            {/* TAB: SIZES & FLUID SCALE */}
            {activeTab === "text-sizes" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Section 1: Presets & Base Root Dimension */}
                <StudioSection
                  title="Fluid Typography Systems & Mathematical Ratios"
                  description="Choose a harmonic scale ratio or set your base root font size. All viewport clamp boundaries adapt dynamically."
                  badge="Scale Systems"
                >
                  <div className="space-y-5">
                    {/* Ratio Presets Grid */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Mathematical Ratio Presets
                        </label>
                        <span className="text-[11px] text-muted-foreground font-mono">
                          Current:{" "}
                          {TYPE_SCALE_PRESETS[
                            liveTokens.typeScale || "majorThird"
                          ]?.label || "Custom"}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {Object.entries(TYPE_SCALE_PRESETS).map(
                          ([key, config]) => {
                            const isSelected =
                              (liveTokens.typeScale || "majorThird") === key;
                            return (
                              <button
                                key={key}
                                type="button"
                                onClick={() => {
                                  setLiveTokens((prev: any) => ({
                                    ...prev,
                                    typeScale: key,
                                    fontSizeH1: config.fontSizeH1,
                                    fontSizeH2: config.fontSizeH2,
                                    fontSizeH3: config.fontSizeH3,
                                    fontSizeSub: config.fontSizeSub,
                                    fontSizeBody: config.fontSizeBody,
                                    fontSizeBtn: config.fontSizeBtn,
                                  }));
                                }}
                                className={`p-3 rounded-xl border text-left transition-all ${isSelected ? selectedClass : idleClass}`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-xs text-foreground">
                                    {config.label}
                                  </span>
                                  {isSelected && (
                                    <span className="flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold shadow-xs">
                                      ✓
                                    </span>
                                  )}
                                </div>
                                <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                                  {config.description}
                                </p>
                              </button>
                            );
                          },
                        )}
                      </div>
                    </div>

                    {/* Root Base Font Size */}
                    <div className="pt-4 border-t border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-semibold text-foreground">
                          Root Base Font Size (1rem)
                        </span>
                        <p className="text-[11px] text-muted-foreground">
                          Sets the root html font denominator in pixels (default
                          16px).
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min={12}
                          max={22}
                          step={1}
                          name="baseFontSize"
                          value={liveTokens.baseFontSize || 16}
                          onChange={handleLiveChange}
                          className="w-32 cursor-pointer accent-primary"
                        />
                        <span className="font-mono text-xs font-bold px-2.5 py-1 bg-muted rounded-lg border border-border min-w-[54px] text-center">
                          {liveTokens.baseFontSize || 16}px
                        </span>
                      </div>
                    </div>
                  </div>
                </StudioSection>

                {/* Section 2: Individual Level Precision Controls */}
                <StudioSection
                  title="Semantic Hierarchy Level Customization"
                  description="Directly edit fluid clamp formulas or rem values for each typography level. Use the stepper buttons to nudge sizes up or down."
                  badge="Level Controls"
                >
                  <div className="space-y-3.5">
                    {[
                      {
                        id: "fontSizeH1",
                        label: "H1 Display Heading",
                        badge: "Hero Title",
                        desc: "Page titles, hero headlines, and primary banners.",
                        val:
                          liveTokens.fontSizeH1 ||
                          "clamp(2.25rem, 5vw + 1rem, 4.5rem)",
                        step: 0.25,
                      },
                      {
                        id: "fontSizeH2",
                        label: "H2 Section Heading",
                        badge: "Section Title",
                        desc: "Major section titles and page content headers.",
                        val:
                          liveTokens.fontSizeH2 ||
                          "clamp(1.75rem, 3.5vw + 0.75rem, 3.25rem)",
                        step: 0.2,
                      },
                      {
                        id: "fontSizeH3",
                        label: "H3 Card & Subheading",
                        badge: "Card Header",
                        desc: "Card headers, feature callouts, and modal titles.",
                        val:
                          liveTokens.fontSizeH3 ||
                          "clamp(1.35rem, 2vw + 0.5rem, 2.25rem)",
                        step: 0.15,
                      },
                      {
                        id: "fontSizeSub",
                        label: "Subtitle & Lead Text",
                        badge: "Lead Text",
                        desc: "Hero subtitles, introductory paragraphs, and lead copy.",
                        val:
                          liveTokens.fontSizeSub ||
                          "clamp(1.05rem, 1vw + 0.25rem, 1.35rem)",
                        step: 0.1,
                      },
                      {
                        id: "fontSizeBody",
                        label: "Body & Description Text",
                        badge: "Base Body",
                        desc: "Standard paragraph copy, table cells, and article content.",
                        val:
                          liveTokens.fontSizeBody ||
                          "clamp(0.95rem, 0.4vw + 0.8rem, 1.15rem)",
                        step: 0.05,
                      },
                      {
                        id: "fontSizeBtn",
                        label: "Button & Action Text",
                        badge: "Interactive",
                        desc: "Buttons, pills, badges, navigation items, and action chips.",
                        val:
                          liveTokens.fontSizeBtn ||
                          "clamp(0.875rem, 0.2vw + 0.8rem, 1rem)",
                        step: 0.05,
                      },
                    ].map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-xl border border-border/70 bg-card hover:border-border transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-foreground">
                              {item.label}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted border border-border text-muted-foreground uppercase">
                              {item.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">
                            {item.desc}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {/* Nudge Down Button */}
                          <button
                            type="button"
                            title="Decrease scale"
                            onClick={() => {
                              const next = adjustClamp(item.val, -item.step);
                              setLiveTokens((prev: any) => ({
                                ...prev,
                                [item.id]: next,
                                typeScale: "custom",
                              }));
                            }}
                            className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-xs font-bold transition-colors cursor-pointer"
                          >
                            <Minus size={13} />
                          </button>

                          {/* Editable Clamp Input */}
                          <input
                            type="text"
                            name={item.id}
                            value={item.val}
                            onChange={(e) => {
                              handleLiveChange(e);
                              setLiveTokens((prev: any) => ({
                                ...prev,
                                typeScale: "custom",
                              }));
                            }}
                            className="w-56 sm:w-64 px-2.5 py-1 text-xs font-mono border rounded-lg bg-card border-card-border text-foreground outline-none focus:ring-1 focus:ring-primary text-center"
                          />

                          {/* Nudge Up Button */}
                          <button
                            type="button"
                            title="Increase scale"
                            onClick={() => {
                              const next = adjustClamp(item.val, item.step);
                              setLiveTokens((prev: any) => ({
                                ...prev,
                                [item.id]: next,
                                typeScale: "custom",
                              }));
                            }}
                            className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-xs font-bold transition-colors cursor-pointer"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </StudioSection>

                {/* Section 3: Live Interactive Typography Hierarchy Canvas */}
                <StudioSection
                  title="Interactive Typography Hierarchy Preview Canvas"
                  description="Live interactive canvas reflecting active font family, clamp formulas, and visual contrast. Updates in real-time."
                  badge="Live Canvas"
                >
                  <div className="p-5 md:p-6 rounded-xl border border-border bg-card space-y-4 shadow-xs">
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                        H1 Display Headline
                      </span>
                      <h1
                        className="h1-title tracking-tight font-extrabold text-foreground"
                        style={{ fontSize: liveTokens.fontSizeH1 }}
                      >
                        Executive Enterprise Architecture
                      </h1>
                    </div>

                    <div className="pt-3 border-t border-border/40">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                        H2 Section Heading
                      </span>
                      <h2
                        className="h2-title font-bold text-foreground"
                        style={{ fontSize: liveTokens.fontSizeH2 }}
                      >
                        Engineered for Sub-Second Precision & Fluid
                        Responsiveness
                      </h2>
                    </div>

                    <div className="pt-3 border-t border-border/40">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                        H3 Card Header
                      </span>
                      <h3
                        className="h3-title font-semibold text-foreground"
                        style={{ fontSize: liveTokens.fontSizeH3 }}
                      >
                        Autonomous State Synchronization & Design Systems
                      </h3>
                    </div>

                    <div className="pt-3 border-t border-border/40">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                        Subtitle / Lead Copy
                      </span>
                      <p
                        className="text-foreground/90 font-medium leading-relaxed"
                        style={{ fontSize: liveTokens.fontSizeSub }}
                      >
                        Universal fluid mathematical typography scales
                        dynamically across mobile, desktop, and ultra-wide
                        viewports.
                      </p>
                    </div>

                    <div className="pt-3 border-t border-border/40">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                        Body Text / Paragraph
                      </span>
                      <p
                        className="desc-text leading-relaxed text-muted-foreground"
                        style={{ fontSize: liveTokens.fontSizeBody }}
                      >
                        Single-source-of-truth token architecture ensures
                        real-time parity between the executive administration
                        studio and public edge views. Custom font sizes and
                        scale ratios are deployed globally with sub-second
                        propagation.
                      </p>
                    </div>

                    <div className="pt-4 border-t border-border/40 flex flex-wrap items-center gap-3">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Button Typography Preview:
                      </span>
                      <button
                        type="button"
                        style={{
                          fontSize: liveTokens.fontSizeBtn,
                          backgroundColor:
                            liveTokens.buttonBgColor || "var(--primary)",
                          color:
                            liveTokens.buttonTextColor ||
                            "var(--primary-foreground)",
                          borderRadius:
                            liveTokens.buttonRadius || "var(--radius)",
                        }}
                        className="px-4 py-2 font-semibold shadow-xs hover:opacity-90 transition-opacity"
                      >
                        Deploy Live Architecture
                      </button>

                      <button
                        type="button"
                        style={{
                          fontSize: liveTokens.fontSizeBtn,
                          borderRadius:
                            liveTokens.buttonRadius || "var(--radius)",
                        }}
                        className="px-4 py-2 font-semibold border border-border bg-card text-foreground hover:bg-muted transition-colors"
                      >
                        Secondary Action
                      </button>
                    </div>
                  </div>
                </StudioSection>
              </div>
            )}

            {/* TAB: DYNAMIC FORM BUILDER */}
            {activeTab === "comp-form-builder" && (
              <div className="animate-in fade-in duration-200">
                <FormBuilder
                  initialSchema={liveTokens.formSchema}
                  onSave={(schema) => {
                    setLiveTokens({ ...liveTokens, formSchema: schema });
                  }}
                />
              </div>
            )}

            {/* TAB: RAW CSS OVERRIDES */}
            {activeTab === "advanced-css" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <StudioSection
                  title="Raw CSS Overrides"
                  description="Directly inject custom style sheets and cascading token rules."
                  badge="Engine Hook"
                >
                  <textarea
                    name="customCss"
                    defaultValue={initialSettings.customCss || ""}
                    className="w-full h-48 p-4 font-mono text-xs border border-card-border rounded-lg bg-transparent focus:ring-1 focus:ring-black outline-none resize-none"
                    placeholder="/* Inject global CSS overrides here */"
                  />
                </StudioSection>
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
