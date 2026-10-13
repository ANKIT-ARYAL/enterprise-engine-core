import {
	DEFAULT_FONT_FAMILY,
	DEFAULT_RADIUS,
	type FontFamily,
	getValidFontFamily,
	getValidRadius,
	normalizeUITheme,
	type Radius,
	type UITheme,
	UI_THEME_OPTIONS,
} from "./theme-options";

export type NormalizedAppearance = {
	themePreset: UITheme;
	fontFamily: FontFamily;
	radius: Radius;
};

export type AppearanceRecord =
	| {
			themePreset?: unknown;
			fontFamily?: unknown;
			customThemeConfig?: unknown;
	  }
	| null
	| undefined;

export type AppearancePayload = {
	themePreset: UITheme;
	fontFamily: FontFamily;
	customThemeConfig: { radius: Radius };
};

export const APPEARANCE_STORAGE_KEY = "enterprise-engine-appearance";
export const APPEARANCE_CHANGE_EVENT = "enterprise-engine-appearance-change";

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function getStoredAppearance(
	storage?: StorageLike,
): NormalizedAppearance | null {
	if (!storage) return null;
	try {
		const raw = storage.getItem(APPEARANCE_STORAGE_KEY);
		if (!raw) return null;
		return normalizeAppearance(JSON.parse(raw));
	} catch {
		return null;
	}
}

export function getLocalAppearance(
	storage?: StorageLike,
	fallback: NormalizedAppearance = DEFAULT_APPEARANCE,
): NormalizedAppearance {
	const stored = getStoredAppearance(storage);
	if (stored) return stored;

	// Fallback to active theme applied to document root by SSR / TokenProvider
	if (typeof document !== "undefined") {
		const classList = document.documentElement.classList;
		for (const opt of UI_THEME_OPTIONS) {
			if (classList.contains(`theme-${opt.value}`)) {
				return {
					...fallback,
					themePreset: opt.value,
				};
			}
		}
	}

	return fallback;
}

export function setLocalAppearance(
	storage: StorageLike,
	appearance: NormalizedAppearance,
) {
	storage.setItem(
		APPEARANCE_STORAGE_KEY,
		JSON.stringify(toAppearancePayload(appearance)),
	);
}

export function resetLocalAppearance(storage: StorageLike) {
	storage.removeItem(APPEARANCE_STORAGE_KEY);
}

export function notifyAppearanceChanged(appearance: NormalizedAppearance) {
	if (typeof window === "undefined") return;
	window.dispatchEvent(
		new CustomEvent<NormalizedAppearance>(APPEARANCE_CHANGE_EVENT, {
			detail: appearance,
		}),
	);
}

export function normalizeAppearance(
	record: AppearanceRecord,
): NormalizedAppearance {
	const themePreset =
		record && typeof record === "object" && Object.hasOwn(record, "themePreset")
			? record.themePreset
			: undefined;
	const fontFamily =
		record && typeof record === "object" && Object.hasOwn(record, "fontFamily")
			? record.fontFamily
			: undefined;
	const config =
		record && typeof record === "object" && Object.hasOwn(record, "customThemeConfig")
			? record.customThemeConfig
			: undefined;
	const radius =
		config && typeof config === "object" && Object.hasOwn(config, "radius")
			? (config as { radius: unknown }).radius
			: record && typeof record === "object" && Object.hasOwn(record, "radius")
				? (record as { radius: unknown }).radius
				: undefined;

	return {
		themePreset: normalizeUITheme(themePreset),
		fontFamily: getValidFontFamily(fontFamily, DEFAULT_FONT_FAMILY),
		radius: getValidRadius(radius, DEFAULT_RADIUS),
	};
}

export function toAppearancePayload(
	appearance: NormalizedAppearance,
): AppearancePayload {
	return {
		themePreset: appearance.themePreset,
		fontFamily: appearance.fontFamily,
		customThemeConfig: { radius: appearance.radius },
	};
}

export const DEFAULT_APPEARANCE = normalizeAppearance({});
