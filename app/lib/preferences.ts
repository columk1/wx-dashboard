'use client'

import { useSyncExternalStore } from 'react'

type UserPreferences = {
	showPredictedWind: boolean
}

const STORAGE_KEY = 'wx-dashboard:preferences:v1'

const DEFAULT_PREFERENCES: UserPreferences = {
	showPredictedWind: true,
}

let cachedPreferences: UserPreferences | null = null
const listeners = new Set<() => void>()
let removeStorageListener: (() => void) | null = null

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null

const parsePreferences = (storedValue: string | null): UserPreferences => {
	if (storedValue == null) {
		return DEFAULT_PREFERENCES
	}

	try {
		const parsedValue: unknown = JSON.parse(storedValue)

		if (!isRecord(parsedValue)) {
			return DEFAULT_PREFERENCES
		}

		return {
			showPredictedWind:
				typeof parsedValue.showPredictedWind === 'boolean'
					? parsedValue.showPredictedWind
					: DEFAULT_PREFERENCES.showPredictedWind,
		}
	} catch {
		return DEFAULT_PREFERENCES
	}
}

const readPreferences = (): UserPreferences => {
	if (cachedPreferences != null) {
		return cachedPreferences
	}

	if (typeof window === 'undefined') {
		return DEFAULT_PREFERENCES
	}

	try {
		cachedPreferences = parsePreferences(
			window.localStorage.getItem(STORAGE_KEY),
		)
	} catch {
		cachedPreferences = DEFAULT_PREFERENCES
	}

	return cachedPreferences
}

const notifyListeners = () => {
	for (const listener of listeners) {
		listener()
	}
}

const handleStorage = (event: StorageEvent) => {
	if (event.key !== STORAGE_KEY) {
		return
	}

	cachedPreferences = parsePreferences(event.newValue)
	notifyListeners()
}

const subscribeToPreferences = (listener: () => void) => {
	listeners.add(listener)

	if (typeof window !== 'undefined' && removeStorageListener == null) {
		window.addEventListener('storage', handleStorage)
		removeStorageListener = () => {
			window.removeEventListener('storage', handleStorage)
			removeStorageListener = null
		}
	}

	return () => {
		listeners.delete(listener)

		if (listeners.size === 0) {
			removeStorageListener?.()
		}
	}
}

export const setUserPreference = <Key extends keyof UserPreferences>(
	key: Key,
	value: UserPreferences[Key],
) => {
	const nextPreferences = {
		...readPreferences(),
		[key]: value,
	}

	cachedPreferences = nextPreferences

	try {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextPreferences))
	} catch {}

	notifyListeners()
}

export const useShowPredictedWindPreference = () =>
	useSyncExternalStore(
		subscribeToPreferences,
		() => readPreferences().showPredictedWind,
		() => DEFAULT_PREFERENCES.showPredictedWind,
	)
