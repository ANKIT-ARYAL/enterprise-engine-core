export type UITheme =
	| "slate"
	| "emerald-green"
	| "ember"
	| "ocean"
	| "forest"
	| "coral"
	| "minimal"
	| "sneat"
	| "uko"
	| "kandel-group"
	| "westminster-college"
	| "woolwich-dubai";

export type Radius =
	| "none"
	| "xs"
	| "sm"
	| "md"
	| "lg"
	| "xl"
	| "2xl"
	| "3xl"
	| "4xl";

export type FontFamily =
	| "manrope"
	| "sans"
	| "inter"
	| "lexend"
	| "plus-jakarta-sans"
	| "figtree"
	| "nunito"
	| "work-sans"
	| "atkinson-hyperlegible"
	| "public-sans"
	| "space-grotesk"
	| "outfit";

export const DEFAULT_UI_THEME: UITheme = "slate";
export const DEFAULT_RADIUS: Radius = "md";
export const DEFAULT_FONT_FAMILY: FontFamily = "manrope";

export const RADIUS_CSS_VALUES: Readonly<Record<Radius, string>> =
	Object.freeze({
		none: "0rem",
		xs: "0.25rem",
		sm: "0.375rem",
		md: "0.5rem",
		lg: "0.75rem",
		xl: "1rem",
		"2xl": "1.25rem",
		"3xl": "1.5rem",
		"4xl": "2rem",
	});

const freezeOptions = <T extends object>(
	options: T[],
): readonly Readonly<T>[] =>
	Object.freeze(options.map((option) => Object.freeze(option)));

export const RADIUS_OPTIONS: readonly Readonly<{
	value: Radius;
	label: string;
}>[] = freezeOptions([
	{ value: "none", label: "None" },
	{ value: "xs", label: "Extra Small" },
	{ value: "sm", label: "Small" },
	{ value: "md", label: "Medium" },
	{ value: "lg", label: "Large" },
	{ value: "xl", label: "Extra Large" },
	{ value: "2xl", label: "2X Large" },
	{ value: "3xl", label: "3X Large" },
	{ value: "4xl", label: "4X Large" },
]);

export const FONT_OPTIONS: readonly Readonly<{
	value: FontFamily;
	label: string;
	family: string;
}>[] = freezeOptions([
	{ value: "manrope", label: "Manrope", family: "Manrope, sans-serif" },
	{
		value: "sans",
		label: "Sans",
		family: "ui-sans-serif, system-ui, sans-serif",
	},
	{ value: "inter", label: "Inter", family: "Inter, sans-serif" },
	{ value: "lexend", label: "Lexend", family: "Lexend, sans-serif" },
	{
		value: "plus-jakarta-sans",
		label: "Plus Jakarta Sans",
		family: "Plus Jakarta Sans, sans-serif",
	},
	{ value: "figtree", label: "Figtree", family: "Figtree, sans-serif" },
	{ value: "nunito", label: "Nunito", family: "Nunito, sans-serif" },
	{ value: "work-sans", label: "Work Sans", family: "Work Sans, sans-serif" },
	{
		value: "atkinson-hyperlegible",
		label: "Atkinson Hyperlegible",
		family: "Atkinson Hyperlegible, sans-serif",
	},
	{
		value: "public-sans",
		label: "Public Sans",
		family: "Public Sans, sans-serif",
	},
	{
		value: "space-grotesk",
		label: "Space Grotesk",
		family: "Space Grotesk, sans-serif",
	},
	{ value: "outfit", label: "Outfit", family: "Outfit, sans-serif" },
]);

export const UI_THEME_OPTIONS: readonly Readonly<{
	value: UITheme;
	label: string;
	description: string;
	premium?: boolean;
	swatchClass: string;
	previewColor: string;
}>[] = freezeOptions([
	{
		value: "slate",
		label: "Slate",
		description: "Neutral professional gray",
		swatchClass: "bg-slate-600",
		previewColor: "hsl(222.2 47.4% 11.2%)",
	},
	{
		value: "emerald-green",
		label: "Emerald Green",
		description: "Rich emerald institutional green",
		swatchClass: "bg-[#005b52]",
		previewColor: "hsl(166 100% 20.2%)",
	},
	{
		value: "ember",
		label: "Ember",
		description: "Warm glowing burnt orange",
		swatchClass: "bg-[#c2410c]",
		previewColor: "hsl(18 89% 40%)",
	},
	{
		value: "ocean",
		label: "Ocean",
		description: "Open dependable ocean blue",
		swatchClass: "bg-[#0077b6]",
		previewColor: "hsl(198 100% 36%)",
	},
	{
		value: "forest",
		label: "Forest",
		description: "Grounded green and olive",
		swatchClass: "bg-[#2d5948]",
		previewColor: "hsl(158.6667 33.3333% 26.4706%)",
	},
	{
		value: "coral",
		label: "Coral",
		description: "Muted coral and sand",
		swatchClass: "bg-[#7e2c28]",
		previewColor: "hsl(1.3793 53.3742% 31.9608%)",
	},
	{
		value: "minimal",
		label: "Minimal",
		description: "Calm emerald dashboard",
		swatchClass: "bg-[#00786b]",
		previewColor: "hsl(171.5 100% 23.5%)",
	},
	{
		value: "sneat",
		label: "Sneat",
		description: "Confident indigo dashboard",
		swatchClass: "bg-[#6963df]",
		previewColor: "hsl(238.7 73% 63.5%)",
	},
	{
		value: "uko",
		label: "Uko",
		description: "Vivid violet dashboard",
		swatchClass: "bg-[#6950e8]",
		previewColor: "hsl(249.9 77% 61.2%)",
	},
	{
		value: "kandel-group",
		label: "Navy",
		description: "Navy and cardinal institutional blue",
		swatchClass: "bg-[#2c3f78]",
		previewColor: "hsl(227.0886 49.0683% 31.5686%)",
	},
	{
		value: "westminster-college",
		label: "Royal Purple",
		description: "Regal academic purple",
		swatchClass: "bg-[#7131a0]",
		previewColor: "hsl(271.1321 52.4752% 39.6078%)",
	},
	{
		value: "woolwich-dubai",
		label: "Deep Blue",
		description: "Deep professional blue",
		swatchClass: "bg-[#264b66]",
		previewColor: "hsl(217.5000 45.7143% 27.4510%)",
	},
]);

const UI_THEME_VALUES = new Set<UITheme>(
	UI_THEME_OPTIONS.map((option) => option.value),
);

export function isUITheme(value: unknown): value is UITheme {
	return typeof value === "string" && UI_THEME_VALUES.has(value as UITheme);
}

export function getValidUITheme(value: unknown, fallback: UITheme = DEFAULT_UI_THEME): UITheme {
	return isUITheme(value) ? value : fallback;
}

export function normalizeUITheme(value: unknown): UITheme {
	if (isUITheme(value)) return value;
	return DEFAULT_UI_THEME;
}

export function isRadius(value: unknown): value is Radius {
	return (
		typeof value === "string" &&
		RADIUS_OPTIONS.some((option) => option.value === value)
	);
}

export function getValidRadius(
	value: unknown,
	fallback: Radius = DEFAULT_RADIUS,
): Radius {
	return isRadius(value) ? value : fallback;
}

export function isFontFamily(value: unknown): value is FontFamily {
	return (
		typeof value === "string" &&
		FONT_OPTIONS.some((option) => option.value === value)
	);
}

export function getValidFontFamily(
	value: unknown,
	fallback: FontFamily = DEFAULT_FONT_FAMILY,
): FontFamily {
	return isFontFamily(value) ? value : fallback;
}
