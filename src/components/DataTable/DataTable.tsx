import { useEffect, useMemo, type ReactNode } from 'react';
import { useControllableState } from '../../hooks/useControllableState';
import { cx } from '../../utils/cx';
import { Button } from '../Button/Button';
import styles from './DataTable.module.css';
import { nextSort, sortRows, type SortState, type SortValue } from './sortRows';

type KeysMatching<T, V> = { [K in keyof T]-?: T[K] extends V ? K : never }[keyof T];

export interface Column<T> {
  id: string;
  header: ReactNode;
  // A key of T whose value is sortable, or a function deriving one.
  accessor?: KeysMatching<T, SortValue> | ((row: T) => SortValue);
  cell?: (row: T) => ReactNode;
  sortable?: boolean;
  compare?: (a: T, b: T) => number;
  align?: 'start' | 'center' | 'end';
  width?: string;
}

export interface DataTableProps<T> {
  data: readonly T[];
  columns: ReadonlyArray<Column<T>>;
  getRowId: (row: T, index: number) => string;
  caption: ReactNode;
  hideCaption?: boolean;
  sort?: SortState | null;
  defaultSort?: SortState | null;
  onSortChange?: (sort: SortState | null) => void;
  page?: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  pageSize?: number;
  emptyMessage?: ReactNode;
  className?: string;
}

function getAccessorValue<T>(row: T, accessor: Column<T>['accessor']): SortValue {
  if (!accessor) return undefined;
  if (typeof accessor === 'function') return accessor(row);
  return row[accessor] as SortValue;
}

function SortIcon({ direction }: { direction: 'asc' | 'desc' | null }) {
  return (
    <svg className={styles.sortIcon} viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
      <path d="M6 2l3 3.5H3z" opacity={direction === 'asc' ? 1 : 0.3} fill="currentColor" />
      <path d="M6 10l3-3.5H3z" opacity={direction === 'desc' ? 1 : 0.3} fill="currentColor" />
    </svg>
  );
}

export function DataTable<T>({
  data,
  columns,
  getRowId,
  caption,
  hideCaption = false,
  sort: sortProp,
  defaultSort = null,
  onSortChange,
  page: pageProp,
  defaultPage = 1,
  onPageChange,
  pageSize = 10,
  emptyMessage = 'No results',
  className,
}: DataTableProps<T>) {
  const [sort, setSort] = useControllableState<SortState | null>({
    value: sortProp,
    defaultValue: defaultSort,
    onChange: onSortChange,
  });
  const [page, setPage] = useControllableState({
    value: pageProp,
    defaultValue: defaultPage,
    onChange: onPageChange,
  });

  const sorted = useMemo(() => {
    if (!sort) return data;
    const column = columns.find((c) => c.id === sort.columnId);
    if (!column) return data;
    return sortRows(
      data,
      (row) => getAccessorValue(row, column.accessor),
      sort.direction,
      column.compare,
    );
  }, [data, columns, sort]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(Math.max(page, 1), pageCount);
  const start = (currentPage - 1) * pageSize;
  const rows = sorted.slice(start, start + pageSize);

  // Data shrinking (e.g. after filtering) can leave us past the last page.
  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount, setPage]);

  const onHeaderClick = (columnId: string) => {
    setSort(nextSort(sort, columnId));
    setPage(1);
  };

  return (
    <div className={cx(styles.root, className)}>
      <div className={styles.scroll}>
        <table className={styles.table}>
          <caption className={cx(styles.caption, hideCaption && styles.visuallyHidden)}>
            {caption}
          </caption>
          <thead>
            <tr>
              {columns.map((column) => {
                const direction = sort?.columnId === column.id ? sort.direction : null;
                const ariaSort =
                  direction === 'asc'
                    ? 'ascending'
                    : direction === 'desc'
                      ? 'descending'
                      : undefined;
                return (
                  <th
                    key={column.id}
                    scope="col"
                    aria-sort={column.sortable ? (ariaSort ?? 'none') : undefined}
                    style={{ width: column.width, textAlign: column.align }}
                    className={styles.th}
                  >
                    {column.sortable ? (
                      // The button carries the interaction; aria-sort on the <th>
                      // is what screen readers announce as the sort state.
                      <button
                        type="button"
                        className={styles.sortButton}
                        onClick={() => onHeaderClick(column.id)}
                      >
                        {column.header}
                        <SortIcon direction={direction} />
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className={styles.empty}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr key={getRowId(row, start + i)} className={styles.tr}>
                  {columns.map((column) => (
                    <td key={column.id} className={styles.td} style={{ textAlign: column.align }}>
                      {column.cell
                        ? column.cell(row)
                        : String(getAccessorValue(row, column.accessor) ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {pageCount > 1 && (
        <nav className={styles.pagination} aria-label="Pagination">
          <span className={styles.status} aria-live="polite">
            {start + 1}–{Math.min(start + pageSize, sorted.length)} of {sorted.length}
          </span>
          <div className={styles.pageButtons}>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className={styles.pageLabel}>
              Page {currentPage} of {pageCount}
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage === pageCount}
            >
              Next
            </Button>
          </div>
        </nav>
      )}
    </div>
  );
}
