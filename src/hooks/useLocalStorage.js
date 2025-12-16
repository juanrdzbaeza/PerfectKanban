import { useState, useEffect, useRef } from 'react';

// Hook para persistir exclusivamente en el servidor (SQLite).
// Firma compatible: useLocalStorage(key, initialValue) -> [state, setState]
export function useLocalStorage(key, initialValue) {
  const mountedRef = useRef(true);
  const hydratedRef = useRef(false);
  const [state, setState] = useState(() => (typeof initialValue === 'function' ? initialValue() : initialValue));

  // Hydrate desde servidor al montar
  useEffect(() => {
    mountedRef.current = true;
    (async () => {
      try {
        const resp = await fetch(`/api/board/${encodeURIComponent(key)}`);
        if (resp && resp.ok) {
          const json = await resp.json();
          if (json && json.data && mountedRef.current) {
            setState(json.data);
          }
        }
      } catch (e) {
        console.warn('useLocalStorage: server hydrate failed', e);
      } finally {
        // Marca como hidratado para permitir futuras sincronizaciones
        hydratedRef.current = true;
      }
    })();
    return () => { mountedRef.current = false; };
  }, [key]);

  // Persistir al servidor cada vez que cambia el estado, pero solo después de hidratar
  useEffect(() => {
    if (!hydratedRef.current) {
      // Evitamos el POST inicial que sobrescribe la DB antes de la GET
      return;
    }

    (async () => {
      try {
        const resp = await fetch(`/api/board/${encodeURIComponent(key)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(state),
        });
        if (!resp.ok) {
          const text = await resp.text().catch(() => '');
          console.warn('useLocalStorage: server sync failed', resp.status, text);
        }
      } catch (e) {
        console.warn('useLocalStorage: server sync error', e);
      }
    })();
  }, [key, state]);

  return [state, setState];
}
