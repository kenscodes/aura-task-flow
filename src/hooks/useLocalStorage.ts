/**
 * useLocalStorage.ts — A reusable custom hook for persistent state.
 *
 * WHY a Custom Hook?
 * Custom hooks let you extract stateful logic from components into
 * a reusable, testable function. Any component that needs to persist
 * state to localStorage can use this hook without duplicating the
 * read/write logic.
 *
 * INTERVIEW TIP: This hook demonstrates:
 *   1. Custom Hook naming convention (must start with "use").
 *   2. Generic TypeScript (<T>) to make it fully reusable.
 *   3. Lazy initializer pattern for useState (passing a function
 *      instead of a value avoids re-running JSON.parse on every render).
 */

import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  // Lazy initializer: only runs once on mount, not on every render.
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  // Synchronize state to localStorage whenever it changes.
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(storedValue));
    } catch {
      // Storage could be full or disabled; fail silently.
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
