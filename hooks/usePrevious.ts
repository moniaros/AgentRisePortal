import { useRef, useEffect } from 'react';

export function usePrevious<T>(value: T): T | undefined {
  // FIX: Explicitly pass undefined to satisfy the "Expected 1 arguments" error and correctly type the ref.
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}
