import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import { useControllableState } from '../../hooks/useControllableState';
import { useId } from '../../hooks/useId';

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface UseSelectParams<T extends string> {
  options: ReadonlyArray<SelectOption<T>>;
  value?: T | null;
  defaultValue?: T | null;
  onChange?: (value: T | null) => void;
  disabled?: boolean;
  id?: string;
  labelId?: string;
}

const TYPEAHEAD_RESET_MS = 500;

function findEnabled<T extends string>(
  options: ReadonlyArray<SelectOption<T>>,
  start: number,
  step: 1 | -1,
): number {
  for (let i = start; i >= 0 && i < options.length; i += step) {
    if (!options[i]?.disabled) return i;
  }
  return -1;
}

// Implements the "select-only combobox" pattern from the ARIA Authoring
// Practices: focus stays on the trigger and aria-activedescendant points at
// the highlighted option. This avoids moving DOM focus into the popup, which
// some screen readers handle poorly with a button + listbox pair.
export function useSelect<T extends string>({
  options,
  value: valueProp,
  defaultValue = null,
  onChange,
  disabled = false,
  id: providedId,
  labelId,
}: UseSelectParams<T>) {
  const baseId = useId(providedId);
  const triggerId = `${baseId}-trigger`;
  const listboxId = `${baseId}-listbox`;
  const optionId = (index: number) => `${baseId}-option-${index}`;

  const [value, setValue] = useControllableState<T | null>({
    value: valueProp,
    defaultValue,
    onChange,
  });
  const [isOpen, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const typeahead = useRef({ query: '', timer: 0 });

  const selectedIndex = options.findIndex((o) => o.value === value);
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  const open = useCallback(
    (initial?: 'first' | 'last') => {
      if (disabled) return;
      let index = selectedIndex;
      if (initial === 'first' || index < 0) index = findEnabled(options, 0, 1);
      if (initial === 'last') index = findEnabled(options, options.length - 1, -1);
      setActiveIndex(index);
      setOpen(true);
    },
    [disabled, options, selectedIndex],
  );

  const close = useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
  }, []);

  const commit = useCallback(
    (index: number) => {
      const option = options[index];
      if (!option || option.disabled) return;
      setValue(option.value);
      close();
    },
    [close, options, setValue],
  );

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || listboxRef.current?.contains(target)) return;
      close();
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [isOpen, close]);

  useEffect(() => {
    if (!isOpen || activeIndex < 0) return;
    const el = document.getElementById(optionId(activeIndex));
    // jsdom doesn't implement scrollIntoView
    el?.scrollIntoView?.({ block: 'nearest' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, activeIndex]);

  useEffect(() => () => window.clearTimeout(typeahead.current.timer), []);

  const runTypeahead = (char: string) => {
    const state = typeahead.current;
    window.clearTimeout(state.timer);
    state.query += char.toLowerCase();
    state.timer = window.setTimeout(() => {
      state.query = '';
    }, TYPEAHEAD_RESET_MS);

    // Repeating the same letter cycles through options starting with it,
    // matching native <select> behaviour.
    const isRepeat = state.query.split('').every((c) => c === state.query[0]);
    const needle = isRepeat ? state.query[0]! : state.query;
    const from = isOpen ? activeIndex : selectedIndex;
    const ordered = options
      .map((option, index) => ({ option, index }))
      .filter(({ option }) => !option.disabled);
    const start = isRepeat ? ordered.findIndex(({ index }) => index > from) : 0;
    const rotated = [...ordered.slice(Math.max(start, 0)), ...ordered.slice(0, Math.max(start, 0))];
    const match = rotated.find(({ option }) => option.label.toLowerCase().startsWith(needle));
    if (!match) return;

    if (isOpen) setActiveIndex(match.index);
    else setValue(match.option.value);
  };

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    const { key } = event;

    if (!isOpen) {
      if (key === 'ArrowDown' || key === 'ArrowUp' || key === 'Enter' || key === ' ') {
        event.preventDefault();
        open();
      } else if (key === 'Home') {
        event.preventDefault();
        open('first');
      } else if (key === 'End') {
        event.preventDefault();
        open('last');
      } else if (key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
        runTypeahead(key);
      }
      return;
    }

    switch (key) {
      case 'ArrowDown': {
        event.preventDefault();
        if (event.altKey) {
          commit(activeIndex);
          break;
        }
        const next = findEnabled(options, activeIndex + 1, 1);
        if (next >= 0) setActiveIndex(next);
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        if (event.altKey) {
          commit(activeIndex);
          break;
        }
        const prev = findEnabled(options, activeIndex - 1, -1);
        if (prev >= 0) setActiveIndex(prev);
        break;
      }
      case 'Home':
        event.preventDefault();
        setActiveIndex(findEnabled(options, 0, 1));
        break;
      case 'End':
        event.preventDefault();
        setActiveIndex(findEnabled(options, options.length - 1, -1));
        break;
      case 'PageDown':
        event.preventDefault();
        setActiveIndex(findEnabled(options, Math.min(activeIndex + 10, options.length - 1), -1));
        break;
      case 'PageUp':
        event.preventDefault();
        setActiveIndex(findEnabled(options, Math.max(activeIndex - 10, 0), 1));
        break;
      // TODO: space in the middle of a typeahead query ("new y...") should
      // extend the query instead of committing.
      case 'Enter':
      case ' ':
        event.preventDefault();
        commit(activeIndex);
        break;
      case 'Escape':
        event.preventDefault();
        close();
        break;
      case 'Tab':
        // Per APG, Tab commits the highlighted option and lets focus move on.
        commit(activeIndex);
        close();
        break;
      default:
        if (key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
          runTypeahead(key);
        }
    }
  };

  const getTriggerProps = (): HTMLAttributes<HTMLButtonElement> & {
    ref: typeof triggerRef;
    id: string;
    type: 'button';
    disabled: boolean;
  } => ({
    ref: triggerRef,
    id: triggerId,
    type: 'button',
    role: 'combobox',
    disabled,
    'aria-haspopup': 'listbox',
    'aria-expanded': isOpen,
    'aria-controls': listboxId,
    'aria-activedescendant': isOpen && activeIndex >= 0 ? optionId(activeIndex) : undefined,
    onClick: () => (isOpen ? close() : open()),
    onKeyDown: onTriggerKeyDown,
  });

  const getListboxProps = (): HTMLAttributes<HTMLUListElement> & {
    ref: typeof listboxRef;
    id: string;
  } => ({
    ref: listboxRef,
    id: listboxId,
    role: 'listbox',
    tabIndex: -1,
    'aria-labelledby': labelId ?? triggerId,
    hidden: !isOpen,
  });

  const getOptionProps = (index: number): HTMLAttributes<HTMLLIElement> & { id: string } => {
    const option = options[index];
    return {
      id: optionId(index),
      role: 'option',
      'aria-selected': index === selectedIndex,
      'aria-disabled': option?.disabled || undefined,
      onMouseMove: () => {
        if (!option?.disabled && activeIndex !== index) setActiveIndex(index);
      },
      // preventDefault on mousedown keeps focus on the trigger.
      onMouseDown: (event: MouseEvent) => event.preventDefault(),
      onClick: () => {
        commit(index);
        triggerRef.current?.focus();
      },
    };
  };

  return {
    isOpen,
    activeIndex,
    selectedIndex,
    selectedOption,
    value,
    open,
    close,
    triggerId,
    getTriggerProps,
    getListboxProps,
    getOptionProps,
  };
}
