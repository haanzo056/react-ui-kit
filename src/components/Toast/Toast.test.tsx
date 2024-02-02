import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { ToastProvider, useToast } from './Toast';
import { initialToastState, toastReducer, type ToastRecord } from './toastStore';
import type { ToastOptions } from './toastStore';

function Trigger({ options }: { options: ToastOptions }) {
  const { toast } = useToast();
  return (
    <button type="button" onClick={() => toast(options)}>
      Notify
    </button>
  );
}

function renderWithProvider(options: ToastOptions, limit?: number) {
  return render(
    <ToastProvider limit={limit}>
      <Trigger options={options} />
    </ToastProvider>,
  );
}

const record = (id: string): ToastRecord => ({
  id,
  title: id,
  variant: 'info',
  duration: 1000,
  createdAt: 0,
});

describe('toastReducer', () => {
  it('queues toasts beyond the limit and promotes them on dismiss', () => {
    let state = initialToastState;
    for (const id of ['a', 'b', 'c']) {
      state = toastReducer(state, { type: 'add', toast: record(id), limit: 2 });
    }
    expect(state.visible.map((t) => t.id)).toEqual(['a', 'b']);
    expect(state.queue.map((t) => t.id)).toEqual(['c']);

    state = toastReducer(state, { type: 'dismiss', id: 'a', limit: 2 });
    expect(state.visible.map((t) => t.id)).toEqual(['b', 'c']);
    expect(state.queue).toHaveLength(0);
  });

  it('updates in place when a toast with the same id is added', () => {
    let state = toastReducer(initialToastState, { type: 'add', toast: record('a'), limit: 3 });
    state = toastReducer(state, {
      type: 'add',
      toast: { ...record('a'), title: 'Updated' },
      limit: 3,
    });
    expect(state.visible).toHaveLength(1);
    expect(state.visible[0]?.title).toBe('Updated');
  });
});

describe('ToastProvider', () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
  afterEach(() => vi.useRealTimers());

  it('renders a toast inside a polite live region', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProvider({ title: 'Saved', description: 'Your changes are live' });
    const region = screen.getByRole('region', { name: 'Notifications' });

    await user.click(screen.getByRole('button', { name: 'Notify' }));
    expect(region).toHaveTextContent('Saved');
    expect(region.querySelector('ol')).toHaveAttribute('aria-live', 'polite');
  });

  it('uses role=alert for errors', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProvider({ title: 'Upload failed', variant: 'error' });
    await user.click(screen.getByRole('button', { name: 'Notify' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Upload failed');
  });

  it('auto-dismisses after the duration', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProvider({ title: 'Copied', duration: 2000 });
    await user.click(screen.getByRole('button', { name: 'Notify' }));
    expect(screen.getByText('Copied')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2100);
    });
    expect(screen.queryByText('Copied')).not.toBeInTheDocument();
  });

  it('pauses the timer while hovered', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProvider({ title: 'Hover me', duration: 1000 });
    await user.click(screen.getByRole('button', { name: 'Notify' }));

    await user.hover(screen.getByText('Hover me'));
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText('Hover me')).toBeInTheDocument();

    await user.unhover(screen.getByText('Hover me'));
    act(() => {
      vi.advanceTimersByTime(1100);
    });
    expect(screen.queryByText('Hover me')).not.toBeInTheDocument();
  });

  it('dismisses via the close button', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProvider({ title: 'Closable', duration: Infinity });
    await user.click(screen.getByRole('button', { name: 'Notify' }));
    await user.click(screen.getByRole('button', { name: 'Dismiss notification' }));
    expect(screen.queryByText('Closable')).not.toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProvider({
      title: 'Archived',
      action: { label: 'Undo', onClick: () => {} },
      duration: Infinity,
    });
    await user.click(screen.getByRole('button', { name: 'Notify' }));
    vi.useRealTimers();
    expect(await axe(document.body)).toHaveNoViolations();
  });
});
