import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { useControllableState } from '../../hooks/useControllableState';
import { useId } from '../../hooks/useId';
import { cx } from '../../utils/cx';
import styles from './Switch.module.css';

export interface SwitchProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onChange' | 'value' | 'children'
> {
  label: ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  // Renders a hidden input so the switch participates in native form submission.
  name?: string;
  value?: string;
  labelPosition?: 'start' | 'end';
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  {
    label,
    checked: checkedProp,
    defaultChecked = false,
    onCheckedChange,
    name,
    value = 'on',
    labelPosition = 'end',
    id: providedId,
    className,
    disabled,
    onClick,
    ...rest
  },
  ref,
) {
  const id = useId(providedId);
  const labelId = `${id}-label`;
  const [checked, setChecked] = useControllableState({
    value: checkedProp,
    defaultValue: defaultChecked,
    onChange: onCheckedChange,
  });

  const labelEl = (
    <label id={labelId} htmlFor={id} className={styles.label}>
      {label}
    </label>
  );

  return (
    <div className={cx(styles.root, disabled && styles.disabled, className)}>
      {labelPosition === 'start' && labelEl}
      <button
        ref={ref}
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        // <label for> works for clicks, but not every screen reader / axe
        // version computes a button's name from it.
        aria-labelledby={labelId}
        disabled={disabled}
        className={styles.track}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) setChecked((prev) => !prev);
        }}
        {...rest}
      >
        <span className={styles.thumb} aria-hidden="true" />
      </button>
      {labelPosition === 'end' && labelEl}
      {name && checked && <input type="hidden" name={name} value={value} disabled={disabled} />}
    </div>
  );
});
