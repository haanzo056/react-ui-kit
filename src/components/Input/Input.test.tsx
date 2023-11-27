import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Textarea } from '../Textarea/Textarea';
import { Input } from './Input';

describe('Input', () => {
  it('associates label, hint and error', () => {
    render(<Input label="Email" hint="We never share it" error="Required" />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('We never share it Required');
  });

  it('keeps a caller-provided aria-describedby', () => {
    render(
      <>
        <p id="extra">Extra</p>
        <Input label="Name" hint="Hint" aria-describedby="extra" />
      </>,
    );
    expect(screen.getByLabelText('Name')).toHaveAccessibleDescription('Extra Hint');
  });

  it('uses the provided id', () => {
    render(<Input label="Name" id="custom" />);
    expect(screen.getByLabelText('Name')).toHaveAttribute('id', 'custom');
  });

  it('forwards the ref', () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<Input label="Name" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('has no axe violations with a hidden label', async () => {
    const { container } = render(<Input label="Search" hideLabel type="search" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('Textarea', () => {
  it('shows a character count tied to the field', async () => {
    render(<Textarea label="Bio" showCount maxLength={20} />);
    const textarea = screen.getByLabelText('Bio');
    await userEvent.type(textarea, 'hello');
    expect(screen.getByText('5 / 20')).toBeInTheDocument();
    expect(textarea).toHaveAccessibleDescription('5 / 20');
  });

  it('calls onChange', async () => {
    const onChange = vi.fn();
    render(<Textarea label="Bio" onChange={onChange} />);
    await userEvent.type(screen.getByLabelText('Bio'), 'ab');
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('has no axe violations', async () => {
    const { container } = render(<Textarea label="Notes" hint="Optional" required />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
