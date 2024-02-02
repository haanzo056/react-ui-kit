import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react';
import { IconButton } from '../IconButton/IconButton';
import { Portal } from '../Portal/Portal';
import styles from './Toast.module.css';
import {
  DEFAULT_DURATION,
  initialToastState,
  nextToastId,
  toastReducer,
  type ToastOptions,
  type ToastRecord,
} from './toastStore';

interface ToastContextValue {
  toast: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

export interface ToastProviderProps {
  children: ReactNode;
  limit?: number;
  position?: 'top-right' | 'bottom-right' | 'bottom-center';
  label?: string;
}

export function ToastProvider({
  children,
  limit = 3,
  position = 'bottom-right',
  label = 'Notifications',
}: ToastProviderProps) {
  const [state, dispatch] = useReducer(toastReducer, initialToastState);

  const dismiss = useCallback((id: string) => dispatch({ type: 'dismiss', id, limit }), [limit]);
  const clear = useCallback(() => dispatch({ type: 'clear' }), []);
  const toast = useCallback(
    (options: ToastOptions) => {
      const variant = options.variant ?? 'info';
      const record: ToastRecord = {
        id: options.id ?? nextToastId(),
        title: options.title,
        description: options.description,
        action: options.action,
        variant,
        duration: options.duration ?? DEFAULT_DURATION[variant],
        createdAt: Date.now(),
      };
      dispatch({ type: 'add', toast: record, limit });
      return record.id;
    },
    [limit],
  );

  const value = useMemo(() => ({ toast, dismiss, clear }), [toast, dismiss, clear]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Portal>
        {/* The live region has to exist before toasts are added to it,
            otherwise screen readers won't announce the first one. */}
        <section aria-label={label} className={styles.viewport} data-position={position}>
          <ol className={styles.list} aria-live="polite" aria-relevant="additions">
            {state.visible.map((t) => (
              <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
            ))}
          </ol>
        </section>
      </Portal>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: ToastRecord; onDismiss: (id: string) => void }) {
  const remaining = useRef(toast.duration);
  const startedAt = useRef(0);
  const timer = useRef<number>();
  const running = useRef(false);

  const start = useCallback(() => {
    if (running.current || !Number.isFinite(remaining.current)) return;
    running.current = true;
    startedAt.current = Date.now();
    timer.current = window.setTimeout(() => onDismiss(toast.id), remaining.current);
  }, [onDismiss, toast.id]);

  // Pausing on hover/focus gives people time to read or reach the action
  // button (WCAG 2.2.1 Timing Adjustable).
  const pause = useCallback(() => {
    if (!running.current) return;
    running.current = false;
    window.clearTimeout(timer.current);
    remaining.current -= Date.now() - startedAt.current;
  }, []);

  useEffect(() => {
    remaining.current = toast.duration;
    running.current = false;
    start();
    return () => {
      running.current = false;
      window.clearTimeout(timer.current);
    };
  }, [start, toast.duration]);

  return (
    <li
      className={styles.toast}
      data-variant={toast.variant}
      // Non-error toasts are announced by the polite region around the list.
      // role=alert interrupts whatever is being read, so only errors get it.
      role={toast.variant === 'error' ? 'alert' : undefined}
      onMouseEnter={pause}
      onMouseLeave={start}
      onFocus={pause}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) start();
      }}
    >
      <div className={styles.content}>
        <p className={styles.title}>{toast.title}</p>
        {toast.description && <p className={styles.description}>{toast.description}</p>}
      </div>
      {toast.action && (
        <button
          type="button"
          className={styles.action}
          onClick={() => {
            toast.action?.onClick();
            onDismiss(toast.id);
          }}
        >
          {toast.action.label}
        </button>
      )}
      <IconButton
        aria-label="Dismiss notification"
        size="sm"
        onClick={() => onDismiss(toast.id)}
        icon={
          <svg viewBox="0 0 16 16" width="14" height="14">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        }
      />
    </li>
  );
}
