import type { ReactNode } from 'react';

export type ToastVariant = 'info' | 'success' | 'error';

export interface ToastOptions {
  id?: string;
  title: ReactNode;
  description?: ReactNode;
  variant?: ToastVariant;
  // ms; pass Infinity to keep the toast until dismissed
  duration?: number;
  action?: { label: string; onClick: () => void };
}

export interface ToastRecord extends Required<Pick<ToastOptions, 'id' | 'variant' | 'duration'>> {
  title: ReactNode;
  description?: ReactNode;
  action?: ToastOptions['action'];
  createdAt: number;
}

export interface ToastState {
  visible: ToastRecord[];
  queue: ToastRecord[];
}

export type ToastAction =
  | { type: 'add'; toast: ToastRecord; limit: number }
  | { type: 'update'; id: string; patch: Partial<ToastRecord> }
  | { type: 'dismiss'; id: string; limit: number }
  | { type: 'clear' };

export const initialToastState: ToastState = { visible: [], queue: [] };

export function toastReducer(state: ToastState, action: ToastAction): ToastState {
  switch (action.type) {
    case 'add': {
      const exists = [...state.visible, ...state.queue].some((t) => t.id === action.toast.id);
      if (exists) {
        return toastReducer(state, { type: 'update', id: action.toast.id, patch: action.toast });
      }
      if (state.visible.length < action.limit) {
        return { ...state, visible: [...state.visible, action.toast] };
      }
      return { ...state, queue: [...state.queue, action.toast] };
    }
    case 'update': {
      const patch = (t: ToastRecord) => (t.id === action.id ? { ...t, ...action.patch } : t);
      return { visible: state.visible.map(patch), queue: state.queue.map(patch) };
    }
    case 'dismiss': {
      const visible = state.visible.filter((t) => t.id !== action.id);
      const queue = state.queue.filter((t) => t.id !== action.id);
      const free = Math.max(action.limit - visible.length, 0);
      return {
        visible: [...visible, ...queue.slice(0, free)],
        queue: queue.slice(free),
      };
    }
    case 'clear':
      return initialToastState;
  }
}

let seed = 0;
export const nextToastId = () => `toast-${++seed}`;

export const DEFAULT_DURATION: Record<ToastVariant, number> = {
  info: 5000,
  success: 4000,
  // Errors stay longer; people need time to read what went wrong.
  error: 8000,
};
