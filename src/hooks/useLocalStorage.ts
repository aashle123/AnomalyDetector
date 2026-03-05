import { useState, useEffect } from 'react';

/**
 * Custom hook for persisting state to localStorage
 * @param key - The localStorage key
 * @param initialValue - Initial value if no stored value exists
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
    // Get stored value or use initial value
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    // Update localStorage when value changes
    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(storedValue));
        } catch (error) {
            console.warn(`Error setting localStorage key "${key}":`, error);
        }
    }, [key, storedValue]);

    return [storedValue, setStoredValue];
}
