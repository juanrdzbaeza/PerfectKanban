import { useState, useEffect } from 'react';

// Hook simple para persistir un valor en localStorage
export function useLocalStorage(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) return JSON.parse(raw);
      return typeof initialValue === 'function' ? initialValue() : initialValue;
    } catch (err) {
      console.error('useLocalStorage: error reading key', key, err);
      return typeof initialValue === 'function' ? initialValue() : initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (err) {
      console.error('useLocalStorage: error writing key', key, err);
    }
  }, [key, state]);

  return [state, setState];
}

