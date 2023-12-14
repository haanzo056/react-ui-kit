import type { ReactNode } from 'react';
import { useId } from '../../hooks/useId';
import { cx } from '../../utils/cx';
import fieldStyles from '../Input/Field.module.css';
import { joinIds } from '../Input/Input';
import styles from './Select.module.css';
import { useSelect, type SelectOption } from './useSelect';

export interface SelectProps<T extends string> {
  label: ReactNode;
  options: ReadonlyArray<SelectOption<T>>;
  value?: T | null;
  defaultValue?: T | null;
  onChange?: (value: T | null) => void;
  placeholder?: string;
  hint?: ReactNode;
  error?: ReactNode;
  disabled?: boolean;
  hideLabel?: boolean;
  id?: string;
  className?: string;
  renderOption?: (
    option: SelectOption<T>,
    state: { selected: boolean; active: boolean },
  ) => ReactNode;
}

export function Select<T extends string>({
  label,
  options,
  value,
  defaultValue,
  onChange,
  placeholder = 'Select…',
  hint,
  error,
  disabled,
  hideLabel,
  id,
  className,
  renderOption,
}: SelectProps<T>) {
  const baseId = useId(id);
  const labelId = `${baseId}-label`;
  const hintId = `${baseId}-hint`;
  const errorId = `${baseId}-error`;

  const select = useSelect({
    options,
    value,
    defaultValue,
    onChange,
    disabled,
    id: baseId,
    labelId,
  });
  const triggerProps = select.getTriggerProps();

  return (
    <div className={cx(fieldStyles.field, styles.root, className)}>
      {/* Not a <label for>: clicking it would activate the button and open
          the listbox, whereas a native select label only focuses. */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <span
        id={labelId}
        className={cx(fieldStyles.label, hideLabel && fieldStyles.visuallyHidden)}
        onClick={() => document.getElementById(select.triggerId)?.focus()}
      >
        {label}
      </span>
      {/* role="combobox" comes from getTriggerProps, which the lint rule can't see */}
      {/* eslint-disable-next-line jsx-a11y/role-supports-aria-props */}
      <button
        {...triggerProps}
        aria-labelledby={labelId}
        aria-invalid={error ? true : undefined}
        aria-describedby={joinIds(hint && hintId, error && errorId)}
        className={cx(fieldStyles.control, styles.trigger)}
      >
        <span className={cx(styles.value, !select.selectedOption && styles.placeholder)}>
          {select.selectedOption?.label ?? placeholder}
        </span>
        <svg
          className={styles.chevron}
          viewBox="0 0 16 16"
          width="16"
          height="16"
          aria-hidden="true"
        >
          <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
      <ul {...select.getListboxProps()} className={styles.listbox}>
        {options.map((option, index) => {
          const selected = index === select.selectedIndex;
          const active = index === select.activeIndex;
          return (
            <li
              key={option.value}
              {...select.getOptionProps(index)}
              className={styles.option}
              data-active={active || undefined}
              data-disabled={option.disabled || undefined}
            >
              {renderOption ? renderOption(option, { selected, active }) : option.label}
              {selected && (
                <svg
                  className={styles.check}
                  viewBox="0 0 16 16"
                  width="14"
                  height="14"
                  aria-hidden="true"
                >
                  <path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="1.75" />
                </svg>
              )}
            </li>
          );
        })}
      </ul>
      {hint && (
        <span id={hintId} className={fieldStyles.hint}>
          {hint}
        </span>
      )}
      {error && (
        <span id={errorId} className={fieldStyles.error}>
          {error}
        </span>
      )}
    </div>
  );
}
