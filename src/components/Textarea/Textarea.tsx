import {
  forwardRef,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';
import { useId } from '../../hooks/useId';
import { composeRefs } from '../../utils/composeRefs';
import { cx } from '../../utils/cx';
import { joinIds } from '../Input/Input';
import styles from '../Input/Field.module.css';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  hideLabel?: boolean;
  autoResize?: boolean;
  showCount?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    label,
    hint,
    error,
    hideLabel,
    autoResize = false,
    showCount = false,
    id: providedId,
    className,
    required,
    maxLength,
    onChange,
    'aria-describedby': ariaDescribedBy,
    ...rest
  },
  ref,
) {
  const id = useId(providedId);
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const countId = `${id}-count`;
  const innerRef = useRef<HTMLTextAreaElement>(null);
  const [length, setLength] = useState(() => String(rest.value ?? rest.defaultValue ?? '').length);

  const resize = () => {
    const el = innerRef.current;
    if (!el || !autoResize) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  useLayoutEffect(() => {
    resize();
    if (rest.value !== undefined) setLength(String(rest.value).length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rest.value, autoResize]);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setLength(event.target.value.length);
    resize();
    onChange?.(event);
  };

  return (
    <div className={cx(styles.field, className)}>
      <label htmlFor={id} className={cx(styles.label, hideLabel && styles.visuallyHidden)}>
        {label}
        {required && (
          <span className={styles.required} aria-hidden="true">
            *
          </span>
        )}
      </label>
      <textarea
        ref={composeRefs(ref, innerRef)}
        id={id}
        required={required}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={joinIds(
          ariaDescribedBy,
          hint && hintId,
          error && errorId,
          showCount && countId,
        )}
        className={cx(styles.control, styles.textarea)}
        style={autoResize ? { resize: 'none', overflow: 'hidden' } : undefined}
        onChange={handleChange}
        {...rest}
      />
      {hint && (
        <span id={hintId} className={styles.hint}>
          {hint}
        </span>
      )}
      {error && (
        <span id={errorId} className={styles.error}>
          {error}
        </span>
      )}
      {showCount && (
        // Not a live region on purpose: announcing every keystroke is noisy.
        // Screen reader users get the count via aria-describedby on focus.
        <span id={countId} className={styles.counter}>
          {maxLength ? `${length} / ${maxLength}` : length}
        </span>
      )}
    </div>
  );
});
