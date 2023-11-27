import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { useId } from '../../hooks/useId';
import { cx } from '../../utils/cx';
import styles from './Field.module.css';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  hideLabel?: boolean;
}

// Accepts `cond && id` expressions, where cond may be any ReactNode.
export function joinIds(...ids: unknown[]) {
  return (
    ids.filter((id): id is string => typeof id === 'string' && id !== '').join(' ') || undefined
  );
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    hint,
    error,
    hideLabel,
    id: providedId,
    className,
    required,
    'aria-describedby': ariaDescribedBy,
    ...rest
  },
  ref,
) {
  const id = useId(providedId);
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

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
      <input
        ref={ref}
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={joinIds(ariaDescribedBy, hint && hintId, error && errorId)}
        className={styles.control}
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
    </div>
  );
});
