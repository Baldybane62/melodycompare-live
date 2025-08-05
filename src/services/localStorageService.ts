// A prefix to avoid collisions with other data in localStorage
const APP_PREFIX = 'melodyCompare_';

/**
 * Saves a value to localStorage with the app prefix.
 * @param key The key to save the value under.
 * @param value The value to save (will be JSON stringified).
 */
export function saveState<T>(key: string, value: T): void {
    try {
        const serializedState = JSON.stringify(value);
        localStorage.setItem(APP_PREFIX + key, serializedState);
    } catch (e) {
        console.error("Could not save state to localStorage:", e);
    }
}

/**
 * Loads a value from localStorage.
 * @param key The key to load the value from.
 * @returns The parsed value, or null if it doesn't exist or an error occurs.
 */
export function loadState<T>(key: string): T | null {
    try {
        const serializedState = localStorage.getItem(APP_PREFIX + key);
        if (serializedState === null) {
            return null;
        }
        return JSON.parse(serializedState) as T;
    } catch (e) {
        console.error("Could not load state from localStorage:", e);
        return null;
    }
}

/**
 * Clears all app-related keys from localStorage.
 */
export function clearState(): void {
    try {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(APP_PREFIX)) {
                localStorage.removeItem(key);
            }
        });
    } catch (e) {
        console.error("Could not clear state from localStorage:", e);
    }
}