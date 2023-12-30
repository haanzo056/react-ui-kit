import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Tooltip } from './Tooltip';

describe('Tooltip', () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
  afterEach(() => vi.useRealTimers());

  it('shows after the delay on hover and links via aria-describedby', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <Tooltip content="Copy to clipboard" delay={300}>
        <button type="button">Copy</button>
      </Tooltip>,
    );
    const button = screen.getByRole('button', { name: 'Copy' });

    await user.hover(button);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(300);
    });
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent('Copy to clipboard');
    expect(button).toHaveAccessibleDescription('Copy to clipboard');
  });

  it('shows immediately on keyboard focus and hides on blur', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <>
        <Tooltip content="Bold">
          <button type="button">B</button>
        </Tooltip>
        <button type="button">Next</button>
      </>,
    );
    await user.tab();
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    await user.tab();
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('dismisses on Escape', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <Tooltip content="Help">
        <button type="button">?</button>
      </Tooltip>,
    );
    await user.tab();
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('preserves the child handlers', async () => {
    const onMouseEnter = vi.fn();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <Tooltip content="Hi">
        <button type="button" onMouseEnter={onMouseEnter}>
          Hover
        </button>
      </Tooltip>,
    );
    await user.hover(screen.getByRole('button'));
    expect(onMouseEnter).toHaveBeenCalled();
  });

  it('has no axe violations while open', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    render(
      <Tooltip content="More info">
        <button type="button">Info</button>
      </Tooltip>,
    );
    await user.tab();
    // body-level scan: the test markup itself has no landmarks
    expect(
      await axe(document.body, { rules: { region: { enabled: false } } }),
    ).toHaveNoViolations();
  });
});
