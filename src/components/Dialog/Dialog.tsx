import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useId } from '../../hooks/useId';
import { cx } from '../../utils/cx';
import { IconButton } from '../IconButton/IconButton';
import { Portal } from '../Portal/Portal';
import styles from './Dialog.module.css';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  role?: 'dialog' | 'alertdialog';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  hideCloseButton?: boolean;
  initialFocus?: RefObject<HTMLElement>;
  className?: string;
}

// Only the top-most dialog should react to Escape when dialogs are nested.
const openStack: string[] = [];

let scrollLocks = 0;
let previousOverflow = '';
let previousPaddingRight = '';

function lockScroll() {
  if (scrollLocks++ > 0) return;
  const body = document.body;
  // Compensate for the scrollbar disappearing so the page doesn't shift sideways.
  const scrollbar = window.innerWidth - document.documentElement.clientWidth;
  previousOverflow = body.style.overflow;
  previousPaddingRight = body.style.paddingRight;
  body.style.overflow = 'hidden';
  if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
}

function unlockScroll() {
  if (--scrollLocks > 0) return;
  document.body.style.overflow = previousOverflow;
  document.body.style.paddingRight = previousPaddingRight;
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = 'md',
  role = 'dialog',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  hideCloseButton = false,
  initialFocus,
  className,
}: DialogProps) {
  const id = useId();
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;
  const [content, setContent] = useState<HTMLDivElement | null>(null);
  const pointerDownOnOverlay = useRef(false);

  useFocusTrap(content, { enabled: open, initialFocus });

  useEffect(() => {
    if (!open) return;
    openStack.push(id);
    lockScroll();
    return () => {
      openStack.splice(openStack.indexOf(id), 1);
      unlockScroll();
    };
  }, [open, id]);

  useEffect(() => {
    if (!open || !closeOnEscape) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || openStack[openStack.length - 1] !== id) return;
      event.stopPropagation();
      onOpenChange(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, closeOnEscape, onOpenChange, id]);

  if (!open) return null;

  // TODO: aria-modal is ignored by some older VoiceOver/Safari combos; setting
  // `inert` on the rest of the app would be more reliable but needs a root ref.
  return (
    <Portal>
      {/* Overlay click is a mouse shortcut; keyboard users have Escape and the close button. */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        className={styles.overlay}
        data-testid="dialog-overlay"
        // Tracking where the press started avoids closing when the user
        // drags a text selection from inside the dialog out onto the overlay.
        onPointerDown={(event) => {
          pointerDownOnOverlay.current = event.target === event.currentTarget;
        }}
        onClick={(event) => {
          if (
            closeOnOverlayClick &&
            pointerDownOnOverlay.current &&
            event.target === event.currentTarget
          ) {
            onOpenChange(false);
          }
          pointerDownOnOverlay.current = false;
        }}
      >
        <div
          ref={setContent}
          role={role}
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={description ? descriptionId : undefined}
          tabIndex={-1}
          className={cx(styles.content, styles[size], className)}
        >
          <div className={styles.header}>
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
            {!hideCloseButton && (
              <IconButton
                aria-label="Close"
                size="sm"
                className={styles.close}
                onClick={() => onOpenChange(false)}
                icon={
                  <svg viewBox="0 0 16 16" width="16" height="16">
                    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                }
              />
            )}
          </div>
          {description && (
            <p id={descriptionId} className={styles.description}>
              {description}
            </p>
          )}
          {children && <div className={styles.body}>{children}</div>}
          {footer && <div className={styles.footer}>{footer}</div>}
        </div>
      </div>
    </Portal>
  );
}
