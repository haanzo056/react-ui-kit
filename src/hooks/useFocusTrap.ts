import { useEffect, type RefObject } from 'react';

const FOCUSABLE = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) =>
      !el.hasAttribute('inert') &&
      !el.closest('[inert]') &&
      el.getAttribute('aria-hidden') !== 'true',
  );
}

interface UseFocusTrapOptions {
  enabled?: boolean;
  initialFocus?: RefObject<HTMLElement>;
  restoreFocus?: boolean;
}

// Takes the element itself rather than a ref: a ref's .current changing
// (e.g. content rendered into a portal a tick later) doesn't re-run effects.
export function useFocusTrap(
  container: HTMLElement | null,
  { enabled = true, initialFocus, restoreFocus = true }: UseFocusTrapOptions = {},
) {
  useEffect(() => {
    if (!enabled || !container) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    const target = initialFocus?.current ?? getFocusable(container)[0] ?? container;
    target.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const items = getFocusable(container);
      if (items.length === 0) {
        event.preventDefault();
        container.focus();
        return;
      }
      const first = items[0]!;
      const last = items[items.length - 1]!;
      const active = document.activeElement;

      if (event.shiftKey && (active === first || active === container)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    // Catches focus escaping via mouse clicks on the page behind or programmatic focus().
    const onFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      // A nested modal (portalled outside this container) owns focus while open.
      if (target.closest?.('[aria-modal="true"]') && !container.contains(target)) return;
      if (!container.contains(target)) {
        (getFocusable(container)[0] ?? container).focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('focusin', onFocusIn);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('focusin', onFocusIn);
      if (restoreFocus && previouslyFocused && document.contains(previouslyFocused)) {
        // Deferred: restoring synchronously during unmount can get swallowed
        // when the trigger re-renders in the same commit.
        setTimeout(() => previouslyFocused.focus({ preventScroll: true }), 0);
      }
    };
  }, [container, enabled, initialFocus, restoreFocus]);
}
