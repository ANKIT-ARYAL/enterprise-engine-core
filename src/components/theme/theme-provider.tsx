/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import * as React from "react";
import {
	APPEARANCE_CHANGE_EVENT,
	DEFAULT_APPEARANCE,
	getLocalAppearance,
	type NormalizedAppearance,
} from "@/lib/theme/appearance";
import {
	FONT_OPTIONS,
	type FontFamily,
	RADIUS_CSS_VALUES,
	UI_THEME_OPTIONS,
} from "@/lib/theme/theme-options";

export type ThemeMode = "light" | "dark" | "system";
export const THEME_MODE_KEY = "enterprise-engine-display-mode";
export const THEME_MODE_CHANGE_EVENT = "enterprise-engine-display-mode-change";
const THEME_CLASSES = UI_THEME_OPTIONS.map(({ value }) => `theme-${value}`);

declare global {
	interface Window {
		__ENGINE_SERVER_APPEARANCE__?: Partial<NormalizedAppearance>;
	}
}

function resolvedMode(mode: ThemeMode) {
	if (typeof window === "undefined") return "light";
	return mode === "system"
		? window.matchMedia("(prefers-color-scheme: dark)").matches
			? "dark"
			: "light"
		: mode;
}

export function applyAppearance(
	appearance: NormalizedAppearance,
	mode: ThemeMode,
) {
	if (typeof document === "undefined") return;
	const root = document.documentElement;
	const font = FONT_OPTIONS.find(
		(option) => option.value === appearance.fontFamily,
	);
	const family = font?.family ?? "Manrope, sans-serif";
	root.classList.remove(...THEME_CLASSES);
	root.classList.add(`theme-${appearance.themePreset}`);
	const isDark = resolvedMode(mode) === "dark";
	root.classList.toggle("dark", isDark);

	// Font variables
	root.style.setProperty("--font-sans", family);
	root.style.setProperty("--font-heading", family);
	root.style.setProperty("--font-body", family);
	root.style.setProperty("--default-font-family", "var(--font-sans)");

	// Radius variables
	const radiusVal = RADIUS_CSS_VALUES[appearance.radius] !== undefined 
		? RADIUS_CSS_VALUES[appearance.radius] 
		: (appearance.radius || "0.5rem");
	root.style.setProperty("--radius", radiusVal);
	root.style.setProperty("--button-radius", radiusVal);
	root.style.setProperty("--card-radius", radiusVal);
	root.style.setProperty("--radius-btn", radiusVal);
	root.style.setProperty("--radius-card", radiusVal);
	root.style.setProperty("--radius-global", radiusVal);

	const numMatch = radiusVal.match(/([\d.]+)rem/);
	const baseNum = numMatch ? parseFloat(numMatch[1]) : (radiusVal === "0" || radiusVal === "0rem" || radiusVal === "none" ? 0 : 0.5);
	root.style.setProperty("--radius-xs", `${baseNum * 0.4}rem`);
	root.style.setProperty("--radius-sm", `${baseNum * 0.7}rem`);
	root.style.setProperty("--radius-md", `${baseNum}rem`);
	root.style.setProperty("--radius-lg", `${baseNum * 1.3}rem`);
	root.style.setProperty("--radius-xl", `${baseNum * 1.7}rem`);
	root.style.setProperty("--radius-2xl", `${baseNum * 2.2}rem`);
	root.style.setProperty("--radius-3xl", `${baseNum * 3}rem`);

	// Direct semantic theme tokens
	const selectedThemeOption = UI_THEME_OPTIONS.find(o => o.value === appearance.themePreset);
	if (selectedThemeOption?.previewColor) {
		root.style.setProperty("--primary", selectedThemeOption.previewColor);
		root.style.setProperty("--btn-bg", selectedThemeOption.previewColor);
		root.style.setProperty("--ring", selectedThemeOption.previewColor);
		root.style.setProperty("--sidebar-primary", selectedThemeOption.previewColor);
	} else {
		root.style.removeProperty("--primary");
		root.style.setProperty("--btn-bg", "var(--primary)");
		root.style.setProperty("--ring", "var(--primary)");
		root.style.setProperty("--sidebar-primary", "var(--primary)");
	}

	// Map surface variables
	root.style.setProperty("--bg-body", "var(--background)");
	root.style.setProperty("--text-main", "var(--foreground)");
	root.style.setProperty("--card-bg", "var(--card)");
	root.style.setProperty("--card-border", "var(--border)");
	root.style.setProperty("--sidebar", "var(--card)");
	root.style.setProperty("--sidebar-foreground", "var(--card-foreground)");
	root.style.setProperty("--sidebar-border", "var(--border)");
	// Presets provide button defaults. Preserve explicit Design Buttons
	// overrides when appearance or dark mode is toggled.
	if (root.dataset.buttonColorsOverridden !== "true") {
		root.style.setProperty("--btn-text", "var(--primary-foreground)");
		if (selectedThemeOption?.previewColor) {
			root.style.setProperty("--btn-hover-bg", `color-mix(in srgb, ${selectedThemeOption.previewColor} 85%, black)`);
		} else {
			root.style.setProperty("--btn-hover-bg", "var(--accent)");
		}
		root.style.setProperty("--btn-hover-text", "var(--btn-text)");
	}

	if (document.body) {
		document.body.style.fontFamily = family;
	}
}

export function useThemePreferences() {
	const [mode, setMode] = React.useState<ThemeMode>("system");

	const [localAppearance, setLocalAppearance] =
		React.useState<NormalizedAppearance>(DEFAULT_APPEARANCE);

	React.useEffect(() => {
		const stored = getLocalAppearance(window.localStorage, DEFAULT_APPEARANCE);
		const hasStoredAppearance = window.localStorage.getItem("enterprise-engine-appearance");
		const serverAppearance = window.__ENGINE_SERVER_APPEARANCE__;
		const current = hasStoredAppearance || !serverAppearance
			? stored
			: {
					...DEFAULT_APPEARANCE,
					themePreset: serverAppearance.themePreset ?? DEFAULT_APPEARANCE.themePreset,
					fontFamily: serverAppearance.fontFamily ?? DEFAULT_APPEARANCE.fontFamily,
					radius: serverAppearance.radius ?? DEFAULT_APPEARANCE.radius,
				};
		setLocalAppearance(current);
	}, []);

	React.useEffect(() => {
		const handleAppearanceChange = (event: Event) => {
			const next = (event as CustomEvent<NormalizedAppearance>).detail;
			if (next) setLocalAppearance(next);
		};
		window.addEventListener(APPEARANCE_CHANGE_EVENT, handleAppearanceChange);
		return () =>
			window.removeEventListener(
				APPEARANCE_CHANGE_EVENT,
				handleAppearanceChange,
			);
	}, []);

	React.useEffect(() => {
		const stored = window.localStorage.getItem(THEME_MODE_KEY);
		if (stored === "light" || stored === "dark" || stored === "system")
			setMode(stored);
	}, []);

	React.useEffect(() => {
		const handleThemeModeChange = (event: Event) => {
			const next = (event as CustomEvent<ThemeMode>).detail;
			if (next === "light" || next === "dark" || next === "system")
				setMode(next);
		};
		window.addEventListener(THEME_MODE_CHANGE_EVENT, handleThemeModeChange);
		return () =>
			window.removeEventListener(
				THEME_MODE_CHANGE_EVENT,
				handleThemeModeChange,
			);
	}, []);

	React.useEffect(() => {
		applyAppearance(localAppearance, mode);
	}, [mode, localAppearance]);

	React.useEffect(() => {
		if (mode !== "system") return;
		const media = window.matchMedia("(prefers-color-scheme: dark)");
		const update = () => applyAppearance(localAppearance, mode);
		media.addEventListener("change", update);
		return () => media.removeEventListener("change", update);
	}, [mode, localAppearance]);

	const setThemeMode = React.useCallback((next: ThemeMode) => {
		setMode(next);
		window.localStorage.setItem(THEME_MODE_KEY, next);
		window.dispatchEvent(
			new CustomEvent<ThemeMode>(THEME_MODE_CHANGE_EVENT, { detail: next }),
		);
	}, []);

	return { mode, setThemeMode, savedAppearance: localAppearance };
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	useThemePreferences();
	return <>{children}</>;
}
