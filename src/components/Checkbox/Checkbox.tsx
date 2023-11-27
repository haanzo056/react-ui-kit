import {
  forwardRef,
  useEffect,
  useRef,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { useControllableState } from '../../hooks/useControllableState';
import { useId } from '../../hooks/useId';
import { composeRefs } from '../../utils/composeRefs';
import { cx } from '../../utils/cx';
import styles from './Checkbox.module.css';

export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'checked' | 'defaultChecked' | 'onChange'
> {
  label: ReactNode;
  description?: ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  {
    label,
    description,
    checked: checkedProp,
    defaultChecked = false,
    indeterminate = false,
    onCheckedChange,
    onChange,
    id: providedId,
    className,
    disabled,
    ...rest
  },
  ref,
) {
  const id = useId(providedId);
  const descriptionId = `${id}-description`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [checked, setChecked] = useControllableState({
    value: checkedProp,
    defaultValue: defaultChecked,
    onChange: onCheckedChange,
  });

  // `indeterminate` is a DOM property only, there is no HTML attribute for it.
  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <div className={cx(styles.root, disabled && styles.disabled, className)}>
      <span className={styles.box}>
        <input
          ref={composeRefs(ref, inputRef)}
          id={id}
          type="checkbox"
          className={styles.input}
          checked={checked}
          disabled={disabled}
          aria-describedby={description ? descriptionId : undefined}
          onChange={(event) => {
            setChecked(event.target.checked);
            onChange?.(event);
          }}
          {...rest}
        />
        <svg className={styles.icon} viewBox="0 0 16 16" aria-hidden="true">
          {indeterminate ? (
            <path d="M4 8h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          ) : (
            <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2" />
          )}
        </svg>
      </span>
      <span className={styles.text}>
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
        {description && (
          <span id={descriptionId} className={styles.description}>
            {description}
          </span>
        )}
      </span>
    </div>
  );
});
