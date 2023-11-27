import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Switch } from './Switch';

describe('Switch', () => {
  it('exposes role=switch with aria-checked', async () => {
    render(<Switch label="Wi-Fi" />);
    const sw = screen.getByRole('switch', { name: 'Wi-Fi' });
    expect(sw).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(sw);
    expect(sw).toHaveAttribute('aria-checked', 'true');
  });

  it('toggles with Space and Enter', async () => {
    const onCheckedChange = vi.fn();
    render(<Switch label="Bluetooth" onCheckedChange={onCheckedChange} />);
    await userEvent.tab();
    await userEvent.keyboard(' ');
    await userEvent.keyboard('{Enter}');
    expect(onCheckedChange.mock.calls).toEqual([[true], [false]]);
  });

  it('toggles when the label is clicked', async () => {
    render(<Switch label="Dark mode" />);
    await userEvent.click(screen.getByText('Dark mode'));
    expect(screen.getByRole('switch')).toBeChecked();
  });

  it('submits a value with the form when checked', async () => {
    const { container } = render(
      <form>
        <Switch label="Notifications" name="notify" />
      </form>,
    );
    const form = container.querySelector('form')!;
    expect(new FormData(form).get('notify')).toBeNull();
    await userEvent.click(screen.getByRole('switch'));
    expect(new FormData(form).get('notify')).toBe('on');
  });

  it('can be cancelled from onClick', async () => {
    render(<Switch label="Guarded" onClick={(e) => e.preventDefault()} />);
    await userEvent.click(screen.getByRole('switch'));
    expect(screen.getByRole('switch')).not.toBeChecked();
  });

  it('has no axe violations', async () => {
    const { container } = render(<Switch label="Airplane mode" defaultChecked />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
