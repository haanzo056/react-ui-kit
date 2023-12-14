import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { useState } from 'react';
import { Select } from './Select';

const fruits = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'blueberry', label: 'Blueberry' },
  { value: 'cherry', label: 'Cherry', disabled: true },
  { value: 'date', label: 'Date' },
];

function setup(props: Partial<Parameters<typeof Select>[0]> = {}) {
  const onChange = vi.fn();
  render(<Select label="Fruit" options={fruits} onChange={onChange} {...props} />);
  const trigger = screen.getByRole('combobox', { name: 'Fruit' });
  return { trigger, onChange, user: userEvent.setup() };
}

describe('Select', () => {
  it('opens on click and selects an option', async () => {
    const { trigger, onChange, user } = setup();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('listbox')).toBeVisible();

    await user.click(screen.getByRole('option', { name: 'Banana' }));
    expect(onChange).toHaveBeenCalledWith('banana');
    expect(trigger).toHaveTextContent('Banana');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
  });

  it('supports arrow keys, Enter and skips disabled options', async () => {
    const { trigger, onChange, user } = setup();
    trigger.focus();

    await user.keyboard('{ArrowDown}');
    expect(trigger).toHaveAttribute('aria-activedescendant', expect.stringContaining('option-0'));

    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
    // cherry (index 3) is disabled, so we land on date
    expect(trigger).toHaveAttribute('aria-activedescendant', expect.stringContaining('option-4'));

    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenLastCalledWith('date');
  });

  it('Home and End jump to the first and last enabled option', async () => {
    const { trigger, user } = setup();
    trigger.focus();
    await user.keyboard('{End}');
    expect(trigger).toHaveAttribute('aria-activedescendant', expect.stringContaining('option-4'));
    await user.keyboard('{Home}');
    expect(trigger).toHaveAttribute('aria-activedescendant', expect.stringContaining('option-0'));
  });

  it('closes on Escape without changing the value', async () => {
    const { trigger, onChange, user } = setup({ defaultValue: 'apple' });
    trigger.focus();
    await user.keyboard('{ArrowDown}{ArrowDown}{Escape}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(onChange).not.toHaveBeenCalled();
    expect(trigger).toHaveTextContent('Apple');
  });

  it('type-ahead cycles through options with the same first letter', async () => {
    const { trigger, user } = setup();
    trigger.focus();
    await user.keyboard('{ArrowDown}');
    await user.keyboard('b');
    expect(trigger).toHaveAttribute('aria-activedescendant', expect.stringContaining('option-1'));
    await user.keyboard('b');
    expect(trigger).toHaveAttribute('aria-activedescendant', expect.stringContaining('option-2'));
  });

  it('closes on outside click', async () => {
    const { trigger, user } = setup();
    await user.click(trigger);
    await user.click(document.body);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('works controlled', async () => {
    function Controlled() {
      const [value, setValue] = useState<string | null>('date');
      return (
        <>
          <Select label="Fruit" options={fruits} value={value} onChange={setValue} />
          <output>{value}</output>
        </>
      );
    }
    render(<Controlled />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Apple' }));
    expect(screen.getByRole('status')).toHaveTextContent('apple');
  });

  it('marks the selected option with aria-selected', async () => {
    const { trigger, user } = setup({ defaultValue: 'banana' });
    await user.click(trigger);
    expect(screen.getByRole('option', { name: 'Banana' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('option', { name: 'Apple' })).toHaveAttribute('aria-selected', 'false');
  });

  it('has no axe violations when open', async () => {
    const { container } = render(<Select label="Fruit" options={fruits} defaultValue="apple" />);
    await userEvent.click(screen.getByRole('combobox'));
    expect(await axe(container)).toHaveNoViolations();
  });
});
