import type { MutableRefObject, Ref, RefCallback } from 'react';

export function setRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref) {
    (ref as MutableRefObject<T | null>).current = value;
  }
}

export function composeRefs<T>(...refs: Array<Ref<T> | undefined>): RefCallback<T> {
  return (node) => {
    for (const ref of refs) setRef(ref, node);
  };
}
