import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('toggles when the label is clicked', async () => {
    const onCheckedChange = vi.fn();
    render(<Checkbox label="Accept terms" onCheckedChange={onCheckedChange} />);
    await userEvent.click(screen.getByText('Accept terms'));
    expect(screen.getByRole('checkbox')).toBeChecked();
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('toggles with Space', async () => {
    render(<Checkbox label="Subscribe" />);
    await userEvent.tab();
    await userEvent.keyboard(' ');
    expect(screen.getByRole('checkbox', { name: 'Subscribe' })).toBeChecked();
  });

  it('sets the indeterminate DOM property', () => {
    render(<Checkbox label="Select all" indeterminate />);
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.indeterminate).toBe(true);
    expect(checkbox).toBePartiallyChecked();
  });

  it('respects the controlled value', async () => {
    render(<Checkbox label="Locked" checked={false} onCheckedChange={() => {}} />);
    await userEvent.click(screen.getByRole('checkbox'));
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('links the description', () => {
    render(<Checkbox label="Marketing" description="At most once a month" />);
    expect(screen.getByRole('checkbox')).toHaveAccessibleDescription('At most once a month');
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <>
        <Checkbox label="One" defaultChecked />
        <Checkbox label="Two" disabled />
        <Checkbox label="Three" indeterminate description="Some items selected" />
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
