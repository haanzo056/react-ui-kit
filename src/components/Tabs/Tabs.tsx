import {
  createContext,
  useContext,
  useRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { useControllableState } from '../../hooks/useControllableState';
import { useId } from '../../hooks/useId';
import { cx } from '../../utils/cx';
import styles from './Tabs.module.css';

type Orientation = 'horizontal' | 'vertical';

interface TabsContextValue {
  baseId: string;
  value: string;
  setValue: (value: string) => void;
  orientation: Orientation;
  activationMode: 'automatic' | 'manual';
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(component: string) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error(`<${component}> must be rendered inside <Tabs>`);
  return ctx;
}

const tabId = (base: string, value: string) => `${base}-tab-${value}`;
const panelId = (base: string, value: string) => `${base}-panel-${value}`;

export interface TabsProps {
  value?: string;
  defaultValue: string;
  onValueChange?: (value: string) => void;
  orientation?: Orientation;
  // "manual" means arrow keys only move focus; Enter/Space activates.
  // Useful when showing a panel is expensive (e.g. triggers a fetch).
  activationMode?: 'automatic' | 'manual';
  className?: string;
  children: ReactNode;
}

export function Tabs({
  value: valueProp,
  defaultValue,
  onValueChange,
  orientation = 'horizontal',
  activationMode = 'automatic',
  className,
  children,
}: TabsProps) {
  const baseId = useId();
  const [value, setValue] = useControllableState({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  });

  return (
    <TabsContext.Provider value={{ baseId, value, setValue, orientation, activationMode }}>
      <div className={cx(styles.root, className)} data-orientation={orientation}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export interface TabListProps extends HTMLAttributes<HTMLDivElement> {
  'aria-label'?: string;
}

export function TabList({ className, children, ...rest }: TabListProps) {
  const { orientation } = useTabsContext('TabList');
  const listRef = useRef<HTMLDivElement>(null);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const tabs = Array.from(
      listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])') ?? [],
    );
    const current = tabs.indexOf(document.activeElement as HTMLButtonElement);
    if (current === -1) return;

    const prevKey = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';
    const nextKey = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
    let next: number | null = null;

    if (event.key === nextKey) next = (current + 1) % tabs.length;
    else if (event.key === prevKey) next = (current - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;

    if (next === null) return;
    event.preventDefault();
    tabs[next]?.focus();
  };

  // The tablist itself isn't a tab stop; focus goes to the selected tab.
  return (
    // eslint-disable-next-line jsx-a11y/interactive-supports-focus
    <div
      ref={listRef}
      role="tablist"
      aria-orientation={orientation}
      className={cx(styles.list, className)}
      onKeyDown={onKeyDown}
      {...rest}
    >
      {children}
    </div>
  );
}

export interface TabProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'id'> {
  value: string;
  disabled?: boolean;
}

export function Tab({ value, disabled, className, children, onFocus, onClick, ...rest }: TabProps) {
  const ctx = useTabsContext('Tab');
  const selected = ctx.value === value;

  return (
    <button
      type="button"
      role="tab"
      id={tabId(ctx.baseId, value)}
      aria-selected={selected}
      aria-controls={panelId(ctx.baseId, value)}
      tabIndex={selected ? 0 : -1}
      disabled={disabled}
      className={cx(styles.tab, className)}
      onFocus={(event) => {
        onFocus?.(event);
        if (ctx.activationMode === 'automatic' && !disabled) ctx.setValue(value);
      }}
      onClick={(event) => {
        onClick?.(event);
        if (!disabled) ctx.setValue(value);
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

export interface TabPanelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'id'> {
  value: string;
  // Keep inactive panels in the DOM (hidden) to preserve their state.
  forceMount?: boolean;
}

export function TabPanel({ value, forceMount, className, children, ...rest }: TabPanelProps) {
  const ctx = useTabsContext('TabPanel');
  const selected = ctx.value === value;
  if (!selected && !forceMount) return null;

  return (
    <div
      role="tabpanel"
      id={panelId(ctx.baseId, value)}
      aria-labelledby={tabId(ctx.baseId, value)}
      hidden={!selected}
      // Panels with no focusable content need to be reachable with Tab.
      tabIndex={0}
      className={cx(styles.panel, className)}
      {...rest}
    >
      {children}
    </div>
  );
}
