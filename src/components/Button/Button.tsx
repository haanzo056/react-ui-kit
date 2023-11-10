import { forwardRef, type ButtonHTMLAttributes, type MouseEvent, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'secondary',
    size = 'md',
    loading = false,
    fullWidth = false,
    startIcon,
    endIcon,
    type = 'button',
    disabled,
    className,
    children,
    onClick,
    ...rest
  },
  ref,
) {
  // While loading we use aria-disabled instead of disabled so the button
  // keeps focus; a real `disabled` would drop focus to <body>.
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (loading) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      aria-disabled={loading || undefined}
      aria-busy={loading || undefined}
      className={cx(
        styles.button,
        styles[variant],
        size !== 'md' && styles[size],
        fullWidth && styles.fullWidth,
        className,
      )}
      onClick={handleClick}
      {...rest}
    >
      {loading ? <span className={styles.spinner} aria-hidden="true" /> : startIcon}
      {children}
      {!loading && endIcon}
    </button>
  );
});
