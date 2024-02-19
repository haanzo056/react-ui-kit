export type SortDirection = 'asc' | 'desc';

export interface SortState {
  columnId: string;
  direction: SortDirection;
}

export type SortValue = string | number | boolean | Date | null | undefined;

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

export function compareValues(a: SortValue, b: SortValue): number {
  // Empty values always sink to the bottom regardless of direction; handled by the caller.
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b);
  return collator.compare(String(a), String(b));
}

const isEmpty = (v: SortValue) => v === null || v === undefined || v === '';

export function sortRows<T>(
  rows: readonly T[],
  getValue: (row: T) => SortValue,
  direction: SortDirection,
  compare: (a: T, b: T) => number = (a, b) => compareValues(getValue(a), getValue(b)),
): T[] {
  const factor = direction === 'asc' ? 1 : -1;
  // Array.prototype.sort is stable since ES2019, so equal rows keep input order.
  return [...rows].sort((a, b) => {
    const aEmpty = isEmpty(getValue(a));
    const bEmpty = isEmpty(getValue(b));
    if (aEmpty || bEmpty) return aEmpty === bEmpty ? 0 : aEmpty ? 1 : -1;
    return compare(a, b) * factor;
  });
}

export function nextSort(current: SortState | null, columnId: string): SortState | null {
  if (!current || current.columnId !== columnId) return { columnId, direction: 'asc' };
  if (current.direction === 'asc') return { columnId, direction: 'desc' };
  return null;
}
