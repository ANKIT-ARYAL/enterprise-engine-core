"use client";

import * as React from "react";

export type NavigationMode = "compact" | "expanded";
export const DEFAULT_NAVIGATION_MODE: NavigationMode = "expanded";
export const NAVIGATION_MODE_CHANGE_EVENT = "enterprise-engine-navigation-mode-change";
const STORAGE_KEY = "enterprise-engine-navigation-preferences";

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function getNavigationMode(storage?: StorageLike): NavigationMode {
	const value = storage?.getItem(STORAGE_KEY);
	return value === "expanded" || value === "compact"
		? value
		: DEFAULT_NAVIGATION_MODE;
}

export function setNavigationMode(storage: StorageLike, mode: NavigationMode) {
	storage.setItem(STORAGE_KEY, mode);
}

export function resetNavigationMode(storage: StorageLike) {
	storage.removeItem(STORAGE_KEY);
}

function notifyNavigationModeChanged(mode: NavigationMode) {
	if (typeof window === "undefined") return;
	window.dispatchEvent(
		new CustomEvent<NavigationMode>(NAVIGATION_MODE_CHANGE_EVENT, {
			detail: mode,
		}),
	);
}

export function useNavigationPreferences() {
	const [navigationMode, setMode] = React.useState<NavigationMode>(
		DEFAULT_NAVIGATION_MODE,
	);

	React.useEffect(() => {
		setMode(getNavigationMode(window.localStorage));
	}, []);

	React.useEffect(() => {
		const handleNavigationModeChange = (event: Event) => {
			const next = (event as CustomEvent<NavigationMode>).detail;
			if (next === "compact" || next === "expanded") setMode(next);
		};
		window.addEventListener(
			NAVIGATION_MODE_CHANGE_EVENT,
			handleNavigationModeChange,
		);
		return () =>
			window.removeEventListener(
				NAVIGATION_MODE_CHANGE_EVENT,
				handleNavigationModeChange,
			);
	}, []);

	const setNavigationModeValue = React.useCallback((mode: NavigationMode) => {
		setMode(mode);
		setNavigationMode(window.localStorage, mode);
		notifyNavigationModeChanged(mode);
	}, []);

	const resetNavigationModeValue = React.useCallback(() => {
		setMode(DEFAULT_NAVIGATION_MODE);
		resetNavigationMode(window.localStorage);
		notifyNavigationModeChanged(DEFAULT_NAVIGATION_MODE);
	}, []);

	return {
		navigationMode,
		setNavigationMode: setNavigationModeValue,
		resetNavigationMode: resetNavigationModeValue,
	};
}
