import { useEffect, useState } from 'react';

function getMatches(query: string, fallback: boolean): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return fallback;
  return window.matchMedia(query).matches;
}

// Not using useSyncExternalStore here so the hook still works on React 17.
export function useMediaQuery(query: string, serverFallback = false): boolean {
  const [matches, setMatches] = useState(() => getMatches(query, serverFallback));

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);
    update();

    // Safari < 14 only has the deprecated addListener API.
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', update);
      return () => mql.removeEventListener('change', update);
    }
    mql.addListener(update);
    return () => mql.removeListener(update);
  }, [query]);

  return matches;
}
