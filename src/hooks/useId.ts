import * as React from 'react';

// Looked up with a computed key so bundlers don't error on React 17,
// where the named export doesn't exist.
const reactUseId = (React as unknown as Record<string, unknown>)['useId'.toString()] as
  (() => string) | undefined;

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

let counter = 0;

function useFallbackId(): string {
  const [id, setId] = React.useState<string | undefined>(undefined);
  useIsomorphicLayoutEffect(() => {
    // Assigned after mount so server and client markup match on hydration.
    setId((current) => current ?? `ui-${++counter}`);
  }, []);
  return id ?? '';
}

// reactUseId is resolved once at module load, so the hook order never changes between renders.
const useGeneratedId = reactUseId ?? useFallbackId;

export function useId(providedId?: string): string {
  const generated = useGeneratedId();
  return providedId ?? generated;
}
