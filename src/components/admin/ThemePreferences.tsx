/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import {
	applyAppearance,
	type ThemeMode,
	useThemePreferences,
} from "@/components/theme/theme-provider";
import { useNavigationPreferences } from "@/hooks/use-navigation-preferences";
import {
	APPEARANCE_CHANGE_EVENT,
	DEFAULT_APPEARANCE,
	getStoredAppearance,
	notifyAppearanceChanged,
	resetLocalAppearance,
	setLocalAppearance,
	type NormalizedAppearance,
} from "@/lib/theme/appearance";
import {
	FONT_OPTIONS,
	RADIUS_CSS_VALUES,
	RADIUS_OPTIONS,
	UI_THEME_OPTIONS,
} from "@/lib/theme/theme-options";
import { updateSystemSettingsAction } from "@/app/actions/admin-mutations";
import toast from "react-hot-toast";
import { Check, Sparkles, RefreshCw, Save } from "lucide-react";

const selectedClass = "border-primary bg-primary/10 ring-2 ring-primary/30 text-primary dark:border-primary dark:bg-primary/20 dark:ring-primary/40";
const idleClass = "border-border/80 hover:border-primary/50 hover:bg-muted/40 transition-all";

function Section({
	title,
	description,
	children,
}: {
	title: string;
	description: string;
	children: React.ReactNode;
}) {
	return (
		<section className="rounded-xl border border-border/80 bg-card p-5 shadow-xs md:p-6">
			<h2 className="font-semibold text-base text-foreground">{title}</h2>
			<p className="mt-1 text-muted-foreground text-xs leading-relaxed">{description}</p>
			<div className="mt-5">{children}</div>
		</section>
	);
}

export function NavigationPreview({ mode }: { mode: "compact" | "expanded" }) {
	const width = mode === "compact" ? 54 : 108;
	return (
		<svg
			aria-label={`${mode} navigation preview`}
			className="h-full w-full"
			role="img"
			viewBox="0 0 320 180"
		>
			<rect fill="var(--muted, #f1f5f9)" height="180" rx="16" width="320" />
			<rect fill="var(--primary, #0f172a)" height="180" rx="16" width={width} />
			<rect
				fill="var(--primary-foreground, #ffffff)"
				height="22"
				opacity=".9"
				rx="7"
				width="22"
				x="16"
				y="18"
			/>
			<rect
				fill="var(--primary-foreground, #ffffff)"
				height="22"
				opacity=".72"
				rx="7"
				width="22"
				x="16"
				y="62"
			/>
			<rect
				fill="var(--primary-foreground, #ffffff)"
				height="22"
				opacity=".72"
				rx="7"
				width="22"
				x="16"
				y="106"
			/>
			{mode === "expanded" && (
				<>
					<rect
						fill="var(--primary-foreground, #ffffff)"
						height="10"
						opacity=".9"
						rx="5"
						width="44"
						x="48"
						y="23"
					/>
					<rect
						fill="var(--primary-foreground, #ffffff)"
						height="10"
						opacity=".72"
						rx="5"
						width="44"
						x="48"
						y="67"
					/>
					<rect
						fill="var(--primary-foreground, #ffffff)"
						height="10"
						opacity=".72"
						rx="5"
						width="44"
						x="48"
						y="111"
					/>
				</>
			)}
			<rect
				fill="var(--border, #cbd5e1)"
				height="16"
				rx="8"
				width="124"
				x={mode === "expanded" ? 132 : 78}
				y="20"
			/>
			<rect
				fill="var(--border, #cbd5e1)"
				height="10"
				opacity=".8"
				rx="5"
				width="158"
				x={mode === "expanded" ? 132 : 78}
				y="54"
			/>
			<rect
				fill="var(--border, #cbd5e1)"
				height="10"
				opacity=".8"
				rx="5"
				width="142"
				x={mode === "expanded" ? 132 : 78}
				y="82"
			/>
			<rect
				fill="var(--card, #ffffff)"
				height="42"
				rx="12"
				width="174"
				x={mode === "expanded" ? 132 : 78}
				y="110"
			/>
		</svg>
	);
}

interface ThemePreferencesProps {
	initialSettings?: any;
	currentTokens?: any;
	onTokensChange?: (tokens: any) => void;
	onAppearanceChange?: (appearance: NormalizedAppearance) => void;
}

export function ThemePreferences({
	initialSettings,
	currentTokens,
	onTokensChange,
	onAppearanceChange,
}: ThemePreferencesProps) {
	const { mode, setThemeMode } = useThemePreferences();
	const { navigationMode, setNavigationMode, resetNavigationMode } =
		useNavigationPreferences();

	const initialAppearance: NormalizedAppearance = React.useMemo(() => {
		const dbTokens = currentTokens || (initialSettings?.tokens as any) || {};
		if (dbTokens.themePreset || dbTokens.fontFamily || dbTokens.radiusPreset || dbTokens.radius) {
			return {
				themePreset: dbTokens.themePreset || DEFAULT_APPEARANCE.themePreset,
				fontFamily: dbTokens.fontFamily || DEFAULT_APPEARANCE.fontFamily,
				radius: dbTokens.radiusPreset || dbTokens.radius || DEFAULT_APPEARANCE.radius,
			};
		}
		return DEFAULT_APPEARANCE;
	}, [currentTokens, initialSettings?.tokens]);

	const [selected, setSelected] = React.useState<NormalizedAppearance>(() => {
		if (typeof window !== "undefined") {
			const local = getStoredAppearance(window.localStorage);
			if (local) {
				return local;
			}
		}
		return initialAppearance;
	});
	const [baseline, setBaseline] = React.useState<NormalizedAppearance>(selected);
	const [isSaving, startTransition] = React.useTransition();
	const [message, setMessage] = React.useState("");

	React.useEffect(() => {
		const handleAppearanceChange = (event: Event) => {
			const next = (event as CustomEvent<NormalizedAppearance>).detail;
			if (next) {
				setSelected(next);
			}
		};
		window.addEventListener(APPEARANCE_CHANGE_EVENT, handleAppearanceChange);
		return () =>
			window.removeEventListener(
				APPEARANCE_CHANGE_EVENT,
				handleAppearanceChange,
			);
	}, []);

	const preview = (next: NormalizedAppearance) => {
		setSelected(next);
		applyAppearance(next, mode);
		setLocalAppearance(window.localStorage, next);
		notifyAppearanceChanged(next);
		onAppearanceChange?.(next);

		if (onTokensChange) {
			const selectedThemeOption = UI_THEME_OPTIONS.find(o => o.value === next.themePreset);
			const radiusCss = RADIUS_CSS_VALUES[next.radius] || "0.5rem";
			onTokensChange((prev: any) => ({
				...(prev || {}),
				themePreset: next.themePreset,
				fontFamily: next.fontFamily,
				radiusPreset: next.radius,
				radius: radiusCss,
				buttonRadius: radiusCss,
				cardRadius: radiusCss,
				...(selectedThemeOption?.previewColor ? {
					primaryColor: selectedThemeOption.previewColor,
					buttonBgColor: selectedThemeOption.previewColor,
				} : {})
			}));
		}
	};

	const dirty =
		selected.themePreset !== baseline.themePreset ||
		selected.fontFamily !== baseline.fontFamily ||
		selected.radius !== baseline.radius;

	const modes: [ThemeMode, string, string][] = [
		["light", "Light", "Bright surfaces and dark text"],
		["dark", "Dark", "Dim surfaces and light text"],
		["system", "System", "Follow device preference"],
	];

	const handleReset = () => {
		resetLocalAppearance(window.localStorage);
		notifyAppearanceChanged(DEFAULT_APPEARANCE);
		setSelected(DEFAULT_APPEARANCE);
		setBaseline(DEFAULT_APPEARANCE);
		resetNavigationMode();
		applyAppearance(DEFAULT_APPEARANCE, mode);
		onAppearanceChange?.(DEFAULT_APPEARANCE);

		if (onTokensChange) {
			const defaultThemeOption = UI_THEME_OPTIONS.find(o => o.value === DEFAULT_APPEARANCE.themePreset);
			const radiusCss = RADIUS_CSS_VALUES[DEFAULT_APPEARANCE.radius] || "0.5rem";
			onTokensChange((prev: any) => ({
				...(prev || {}),
				themePreset: DEFAULT_APPEARANCE.themePreset,
				fontFamily: DEFAULT_APPEARANCE.fontFamily,
				radiusPreset: DEFAULT_APPEARANCE.radius,
				radius: radiusCss,
				buttonRadius: radiusCss,
				cardRadius: radiusCss,
				...(defaultThemeOption?.previewColor ? {
					primaryColor: defaultThemeOption.previewColor,
					buttonBgColor: defaultThemeOption.previewColor,
				} : {})
			}));
		}

		setMessage("Appearance reset to baseline");
		toast.success("Appearance reset to baseline");
	};

	const handleSave = () => {
		startTransition(async () => {
			try {
				// 1. Save locally for instant UX
				setLocalAppearance(window.localStorage, selected);
				notifyAppearanceChanged(selected);
				setBaseline(selected);
				setMessage("Appearance saved & synced across workspace");

				// 2. Persist to PostgreSQL SystemSettings.tokens
				const currentSettingsTokens = currentTokens || initialSettings?.tokens || {};
				const selectedThemeOption = UI_THEME_OPTIONS.find(o => o.value === selected.themePreset);
				const updatedTokens = {
					...currentSettingsTokens,
					themePreset: selected.themePreset,
					primaryColor: selectedThemeOption?.previewColor || currentSettingsTokens.primaryColor,
					buttonBgColor: selectedThemeOption?.previewColor || currentSettingsTokens.buttonBgColor,
					fontFamily: selected.fontFamily,
					radiusPreset: selected.radius,
					radius: RADIUS_CSS_VALUES[selected.radius] || "0.5rem",
					buttonRadius: RADIUS_CSS_VALUES[selected.radius] || "0.5rem",
					cardRadius: RADIUS_CSS_VALUES[selected.radius] || "0.5rem",
					displayMode: mode,
					navigationMode: navigationMode,
				};

				onTokensChange?.(updatedTokens);

				await updateSystemSettingsAction({
					siteName: initialSettings?.siteName || "Enterprise Engine",
					customCss: initialSettings?.customCss || "",
					tokens: updatedTokens,
				});

				toast.success("Appearance saved! Theme, typography, and radius are active across the app.");
			} catch (err: any) {
				toast.error(err.message || "Failed to save appearance to database");
			}
		});
	};

	return (
		<div className="flex flex-col gap-6 w-full pb-20">
			{/* Top Description Badge */}
			<div className="flex items-center gap-2 p-3 bg-muted/50 border border-border/80 rounded-xl text-xs text-muted-foreground">
				<Sparkles size={16} className="text-amber-500 shrink-0" />
				<span>
					<strong>Theme Engine Active:</strong> Select an executive color palette, font voice, or corner radius to dynamically re-skin both the admin workspace and public site.
				</span>
			</div>

			{/* SECTION 1: DISPLAY MODE */}
			<Section
				description="Choose the lighting that feels right for your workday."
				title="Display mode"
			>
				<div className="grid gap-3 sm:grid-cols-3">
					{modes.map(([value, label, description]) => (
						<button
							aria-pressed={mode === value}
							className={`flex min-h-16 items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${mode === value ? selectedClass : idleClass}`}
							key={value}
							onClick={() => {
								setThemeMode(value);
								applyAppearance(selected, value);
							}}
							type="button"
						>
							<span className="text-xl shrink-0">
								{value === "light" ? "☀" : value === "dark" ? "☾" : "◐"}
							</span>
							<span className="min-w-0 flex-1">
								<span className="block font-semibold text-xs text-foreground">{label}</span>
								<span className="block text-muted-foreground text-[11px] truncate">
									{description}
								</span>
							</span>
							{mode === value && (
								<span className="ml-auto flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0 shadow-xs">
									<Check size={12} />
								</span>
							)}
						</button>
					))}
				</div>
			</Section>

			{/* SECTION 2: NAVIGATION */}
			<Section
				description="Choose the compact rail or an expanded sidebar with full labels."
				title="Navigation"
			>
				<div className="grid gap-3 sm:grid-cols-2">
					{(["compact", "expanded"] as const).map((value) => (
						<button
							aria-pressed={navigationMode === value}
							className={`flex items-center gap-4 rounded-xl border p-4 text-left transition-all ${navigationMode === value ? selectedClass : idleClass}`}
							key={value}
							onClick={() => setNavigationMode(value)}
							type="button"
						>
							<div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg border border-border/60">
								<NavigationPreview mode={value} />
							</div>
							<div className="flex-1 min-w-0">
								<span className="block font-semibold text-sm capitalize text-foreground">
									{value}
								</span>
								<span className="mt-1 block text-muted-foreground text-xs">
									{value === "compact" ? "Icons only (Rail mode)" : "Icons and labels (Expanded)"}
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
			</Section>

			{/* SECTION 3: COLOR PALETTE */}
			<Section
				description="Use the standard semantic color palette across every themed surface."
				title="Color palette"
			>
				<div className="grid grid-cols-2 gap-3 md:grid-cols-4">
					{UI_THEME_OPTIONS.map((option) => (
						<button
							aria-pressed={selected.themePreset === option.value}
							className={`rounded-xl border p-3 text-left transition-all ${selected.themePreset === option.value ? selectedClass : idleClass}`}
							key={option.value}
							onClick={() =>
								preview({ ...selected, themePreset: option.value })
							}
							type="button"
						>
							<div className="flex h-10 items-center gap-1.5 rounded-lg bg-muted p-1.5">
								<span
									className="h-full w-1/3 rounded-sm shadow-xs"
									style={{ backgroundColor: option.previewColor }}
								/>
								<span
									className="h-2.5 flex-1 rounded-full"
									style={{
										backgroundColor: option.previewColor,
										opacity: 0.65,
									}}
								/>
								<span
									className="size-3.5 rounded-full shrink-0"
									style={{ backgroundColor: option.previewColor }}
								/>
							</div>
							<div className="mt-3 font-semibold text-xs text-foreground flex items-center justify-between">
								<span>{option.label}</span>
								{selected.themePreset === option.value && (
									<span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">✓ Active</span>
								)}
							</div>
							<p className="mt-1 text-muted-foreground text-[11px] leading-tight line-clamp-2">
								{option.description}
							</p>
						</button>
					))}
				</div>

				{/* Custom Color & Text Overrides */}
				<div className="mt-6 pt-5 border-t border-border/80">
					<h3 className="font-semibold text-xs text-foreground uppercase tracking-wider mb-1">
						Text & Brand Color Overrides (Optional)
					</h3>
					<p className="text-[11px] text-muted-foreground mb-4">
						Customize primary, accent, background, and global text color directly alongside theme presets.
					</p>

					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
						{[
							{
								id: "textColor",
								label: "Default Text Color",
								value: (currentTokens?.textColor as string) || (initialSettings?.tokens?.textColor as string) || (mode === "dark" ? "#f8fafc" : "#0f172a"),
							},
							{
								id: "primaryColor",
								label: "Primary / Highlights",
								value: (currentTokens?.primaryColor as string) || (initialSettings?.tokens?.primaryColor as string) || "#2563eb",
							},
							{
								id: "accentColor",
								label: "Accent / Secondary",
								value: (currentTokens?.accentColor as string) || (initialSettings?.tokens?.accentColor as string) || "#f97316",
							},
							{
								id: "backgroundColor",
								label: "App Body Background",
								value: (currentTokens?.backgroundColor as string) || (initialSettings?.tokens?.backgroundColor as string) || (mode === "dark" ? "#090d16" : "#ffffff"),
							},
						].map((item) => (
							<div
								key={item.id}
								className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20"
							>
								<div>
									<span className="block text-xs font-semibold text-foreground">
										{item.label}
									</span>
									<span className="block font-mono text-[11px] text-muted-foreground uppercase">
										{item.value}
									</span>
								</div>
								<div className="flex items-center gap-1.5">
									<input
										aria-label={`${item.label} color`}
										type="color"
										value={item.value.startsWith("#") && item.value.length === 7 ? item.value : "#000000"}
										onChange={(e) => {
											const val = e.target.value;
											if (onTokensChange) {
												onTokensChange((prev: any) => ({
													...(prev || {}),
													[item.id]: val,
												}));
											}
											if (typeof document !== "undefined") {
												if (item.id === "textColor") {
													document.documentElement.style.setProperty("--text-main", val);
													document.documentElement.style.setProperty("--foreground", val);
												}
												if (item.id === "primaryColor") {
													document.documentElement.style.setProperty("--primary", val);
													document.documentElement.style.setProperty("--btn-bg", val);
												}
												if (item.id === "accentColor") {
													document.documentElement.style.setProperty("--accent", val);
												}
												if (item.id === "backgroundColor") {
													document.documentElement.style.setProperty("--bg-body", val);
													document.documentElement.style.setProperty("--background", val);
												}
											}
										}}
										className="w-7 h-7 rounded-md border-0 p-0 cursor-pointer bg-transparent"
									/>
								</div>
							</div>
						))}
					</div>
				</div>
			</Section>

			{/* SECTION 4: TYPOGRAPHY */}
			<Section
				description="Choose the voice of your interface from curated editorial and geometric font families."
				title="Typography"
			>
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
					{FONT_OPTIONS.map((option) => (
						<button
							aria-pressed={selected.fontFamily === option.value}
							className={`flex h-24 flex-col items-center justify-center rounded-xl border p-2 text-center transition-all ${selected.fontFamily === option.value ? selectedClass : idleClass}`}
							key={option.value}
							onClick={() =>
								preview({ ...selected, fontFamily: option.value })
							}
							type="button"
						>
							<span
								className="font-bold text-2xl text-foreground"
								style={{ fontFamily: option.family }}
							>
								Aa
							</span>
							<span className="mt-1.5 text-muted-foreground text-[11px] truncate w-full px-1">
								{option.label}
							</span>
						</button>
					))}
				</div>
			</Section>

			{/* SECTION 5: CORNER RADIUS */}
			<Section
				description="Set how soft or structured controls and surfaces feel."
				title="Corner radius"
			>
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
					{RADIUS_OPTIONS.map((option) => (
						<button
							aria-pressed={selected.radius === option.value}
							className={`flex h-24 flex-col items-center justify-center rounded-xl border p-2 transition-all ${selected.radius === option.value ? selectedClass : idleClass}`}
							key={option.value}
							onClick={() => preview({ ...selected, radius: option.value })}
							type="button"
						>
							<span
								className="size-9 border-2 border-primary bg-primary/10 transition-all"
								style={{ borderRadius: RADIUS_CSS_VALUES[option.value] }}
							/>
							<span className="mt-2 text-muted-foreground text-xs">
								{option.label}
							</span>
						</button>
					))}
				</div>
			</Section>

			{/* ACTION FOOTER BAR */}
			<div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
				<p className="text-muted-foreground text-xs">
					{message ||
						(dirty
							? "Previewing unsaved changes across interface."
							: "Appearance is up to date and synchronized with database.")}
				</p>
				<div className="flex items-center gap-2">
					<button
						onClick={handleReset}
						type="button"
						className="flex items-center gap-2 px-4 py-2 border border-border text-foreground hover:bg-muted text-xs font-semibold rounded-lg transition-colors"
					>
						<RefreshCw size={14} />
						<span>Reset</span>
					</button>
					<button
						disabled={isSaving}
						onClick={handleSave}
						type="button"
						className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground hover:opacity-90 text-xs font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
					>
						<Save size={14} />
						<span>{isSaving ? "Saving..." : "Save changes"}</span>
					</button>
				</div>
			</div>
		</div>
	);
}
export default ThemePreferences;
