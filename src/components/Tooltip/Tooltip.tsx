import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { useId } from '../../hooks/useId';
import { composeRefs } from '../../utils/composeRefs';
import { Portal } from '../Portal/Portal';
import styles from './Tooltip.module.css';

export type TooltipSide = 'top' | 'bottom' | 'left' | 'right';

type TriggerProps = {
  'aria-describedby'?: string;
  onMouseEnter?: (event: MouseEvent<HTMLElement>) => void;
  onMouseLeave?: (event: MouseEvent<HTMLElement>) => void;
  onFocus?: (event: FocusEvent<HTMLElement>) => void;
  onBlur?: (event: FocusEvent<HTMLElement>) => void;
};

export interface TooltipProps {
  content: ReactNode;
  children: ReactElement<TriggerProps>;
  side?: TooltipSide;
  delay?: number;
  closeDelay?: number;
  disabled?: boolean;
}

const GAP = 6;

function isFocusVisible(el: Element) {
  try {
    return el.matches(':focus-visible');
  } catch {
    // Older engines throw on unknown pseudo-classes.
    return true;
  }
}

function computePosition(trigger: DOMRect, tip: DOMRect, side: TooltipSide): CSSProperties {
  const centerX = trigger.left + trigger.width / 2 - tip.width / 2;
  const centerY = trigger.top + trigger.height / 2 - tip.height / 2;
  const clampX = (x: number) => Math.max(GAP, Math.min(x, window.innerWidth - tip.width - GAP));

  switch (side) {
    case 'bottom':
      return { top: trigger.bottom + GAP, left: clampX(centerX) };
    case 'left':
      return { top: centerY, left: trigger.left - tip.width - GAP };
    case 'right':
      return { top: centerY, left: trigger.right + GAP };
    case 'top':
    default:
      return { top: trigger.top - tip.height - GAP, left: clampX(centerX) };
  }
}

// FIXME: no collision flipping yet. A top tooltip on an element at the very
// top of the viewport renders off-screen. Worth pulling in floating-ui if
// this grows beyond simple cases.
export function Tooltip({
  content,
  children,
  side = 'top',
  delay = 400,
  closeDelay = 100,
  disabled = false,
}: TooltipProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<CSSProperties>({ top: -9999, left: -9999 });
  const triggerRef = useRef<HTMLElement>(null);
  // State instead of a ref: the Portal mounts its children a render later,
  // so the positioning effect has to re-run once the node actually exists.
  const [tooltipEl, setTooltipEl] = useState<HTMLDivElement | null>(null);
  const timer = useRef<number>();

  const clear = () => window.clearTimeout(timer.current);

  const show = useCallback(
    (immediate = false) => {
      clear();
      if (disabled) return;
      if (immediate) setOpen(true);
      else timer.current = window.setTimeout(() => setOpen(true), delay);
    },
    [delay, disabled],
  );

  const hide = useCallback(
    (immediate = false) => {
      clear();
      if (immediate) setOpen(false);
      else timer.current = window.setTimeout(() => setOpen(false), closeDelay);
    },
    [closeDelay],
  );

  useEffect(() => clear, []);

  useLayoutEffect(() => {
    if (!open || !tooltipEl) return;
    const update = () => {
      if (!triggerRef.current) return;
      setPosition(
        computePosition(
          triggerRef.current.getBoundingClientRect(),
          tooltipEl.getBoundingClientRect(),
          side,
        ),
      );
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open, side, tooltipEl]);

  // WCAG 1.4.13: tooltip must be dismissable without moving pointer or focus.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') hide(true);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, hide]);

  if (!isValidElement(children)) return children;

  const childProps = children.props;
  // React 18 keeps `ref` on the element, not in props.
  const childRef = (children as unknown as { ref?: Ref<HTMLElement> }).ref;
  const trigger = cloneElement(
    children as ReactElement<TriggerProps & { ref?: Ref<HTMLElement> }>,
    {
      ref: composeRefs(childRef, triggerRef),
      'aria-describedby':
        [childProps['aria-describedby'], open ? id : undefined].filter(Boolean).join(' ') ||
        undefined,
      onMouseEnter: (event: MouseEvent<HTMLElement>) => {
        childProps.onMouseEnter?.(event);
        show();
      },
      onMouseLeave: (event: MouseEvent<HTMLElement>) => {
        childProps.onMouseLeave?.(event);
        hide();
      },
      onFocus: (event: FocusEvent<HTMLElement>) => {
        childProps.onFocus?.(event);
        // Only keyboard focus should open immediately; a mouse click also
        // focuses the button and would flash the tooltip.
        if (isFocusVisible(event.target)) show(true);
      },
      onBlur: (event: FocusEvent<HTMLElement>) => {
        childProps.onBlur?.(event);
        hide(true);
      },
    },
  );

  return (
    <>
      {trigger}
      {open && (
        <Portal>
          <div
            ref={setTooltipEl}
            id={id}
            role="tooltip"
            className={styles.tooltip}
            data-side={side}
            style={position}
            // Keeps the tooltip open while hovered so its text can be read or selected.
            onMouseEnter={() => show(true)}
            onMouseLeave={() => hide()}
          >
            {content}
          </div>
        </Portal>
      )}
    </>
  );
}
