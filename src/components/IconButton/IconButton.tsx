import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import type { ButtonSize, ButtonVariant } from '../Button/Button';
import styles from '../Button/Button.module.css';

type Labelled =
  | { 'aria-label': string; 'aria-labelledby'?: never }
  | { 'aria-labelledby': string; 'aria-label'?: never };

// An icon-only button has no text content, so an accessible name is
// required at the type level rather than left to a lint rule.
export type IconButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'aria-label' | 'aria-labelledby' | 'children'
> &
  Labelled & {
    icon: ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
  };

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, variant = 'ghost', size = 'md', type = 'button', className, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx(
        styles.button,
        styles.icon,
        styles[variant],
        size !== 'md' && styles[size],
        className,
      )}
      {...rest}
    >
      <span aria-hidden="true" style={{ display: 'inline-flex' }}>
        {icon}
      </span>
    </button>
  );
});
