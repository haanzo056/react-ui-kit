import { act, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef, useState } from 'react';
import { useControllableState } from './useControllableState';
import { useFocusTrap } from './useFocusTrap';
import { useId } from './useId';
import { useMediaQuery } from './useMediaQuery';

describe('useControllableState', () => {
  it('manages internal state when uncontrolled', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useControllableState({ defaultValue: 1, onChange }));
    act(() => result.current[1](2));
    expect(result.current[0]).toBe(2);
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('defers to the prop when controlled', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useControllableState({ value: 5, defaultValue: 1, onChange }),
    );
    act(() => result.current[1](6));
    expect(result.current[0]).toBe(5);
    expect(onChange).toHaveBeenCalledWith(6);
  });

  it('supports updater functions and skips no-op updates', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useControllableState({ defaultValue: 1, onChange }));
    act(() => result.current[1]((n) => n + 1));
    act(() => result.current[1](2));
    expect(result.current[0]).toBe(2);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('keeps the setter stable across renders', () => {
    const { result, rerender } = renderHook(() => useControllableState({ defaultValue: 'a' }));
    const first = result.current[1];
    rerender();
    expect(result.current[1]).toBe(first);
  });
});

describe('useId', () => {
  it('returns the provided id or a stable generated one', () => {
    const { result, rerender } = renderHook(({ id }: { id?: string }) => useId(id), {
      initialProps: {},
    });
    const generated = result.current;
    expect(generated).toBeTruthy();
    rerender({});
    expect(result.current).toBe(generated);
    rerender({ id: 'mine' });
    expect(result.current).toBe('mine');
  });
});

describe('useMediaQuery', () => {
  it('reads and follows matchMedia', () => {
    let listener: (() => void) | undefined;
    let matches = true;
    const original = window.matchMedia;
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      get matches() {
        return matches;
      },
      media: query,
      addEventListener: (_: string, cb: () => void) => (listener = cb),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => useMediaQuery('(min-width: 600px)'));
    expect(result.current).toBe(true);

    matches = false;
    act(() => listener?.());
    expect(result.current).toBe(false);

    window.matchMedia = original;
  });
});

describe('useFocusTrap', () => {
  function Trap() {
    const [el, setEl] = useState<HTMLDivElement | null>(null);
    const initial = useRef<HTMLButtonElement>(null);
    useFocusTrap(el, { initialFocus: initial });
    return (
      <div ref={setEl}>
        <button type="button">first</button>
        <button type="button" ref={initial}>
          second
        </button>
        <button type="button" disabled>
          disabled
        </button>
      </div>
    );
  }

  it('focuses initialFocus and wraps Tab, skipping disabled elements', async () => {
    const user = userEvent.setup();
    render(
      <>
        <button type="button">outside</button>
        <Trap />
      </>,
    );
    expect(screen.getByText('second')).toHaveFocus();
    await user.tab();
    expect(screen.getByText('first')).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByText('second')).toHaveFocus();
  });
});
