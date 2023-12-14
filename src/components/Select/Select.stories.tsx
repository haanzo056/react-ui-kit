import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Select } from './Select';
import { useSelect } from './useSelect';

const timezones = [
  { value: 'utc', label: 'UTC' },
  { value: 'europe-kyiv', label: 'Europe/Kyiv' },
  { value: 'europe-london', label: 'Europe/London' },
  { value: 'europe-berlin', label: 'Europe/Berlin' },
  { value: 'america-new-york', label: 'America/New_York' },
  { value: 'america-chicago', label: 'America/Chicago' },
  { value: 'america-denver', label: 'America/Denver', disabled: true },
  { value: 'america-los-angeles', label: 'America/Los_Angeles' },
  { value: 'asia-tokyo', label: 'Asia/Tokyo' },
  { value: 'asia-singapore', label: 'Asia/Singapore' },
  { value: 'australia-sydney', label: 'Australia/Sydney' },
  { value: 'pacific-auckland', label: 'Pacific/Auckland' },
];

const meta = {
  title: 'Components/Select',
  component: Select,
  args: { label: 'Timezone', options: timezones },
  decorators: [(Story) => <div style={{ maxWidth: 280, minHeight: 320 }}>{Story()}</div>],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithValue: Story = { args: { defaultValue: 'europe-kyiv' } };
export const WithError: Story = { args: { error: 'Pick a timezone', hint: 'Used for reminders' } };
export const Disabled: Story = { args: { disabled: true, defaultValue: 'utc' } };

export const Controlled: Story = {
  render: (args) => {
    const [value, setValue] = useState<string | null>('asia-tokyo');
    return (
      <>
        <Select {...args} value={value} onChange={setValue} />
        <p style={{ fontSize: 12 }}>value: {String(value)}</p>
      </>
    );
  },
};

// The hook on its own, for when the styled component doesn't fit.
export const Headless: Story = {
  render: () => {
    const options = timezones.slice(0, 5);
    const select = useSelect({ options, defaultValue: 'utc', labelId: 'headless-label' });
    return (
      <div style={{ position: 'relative', fontFamily: 'sans-serif' }}>
        <div id="headless-label">Timezone (headless)</div>
        <button {...select.getTriggerProps()} aria-labelledby="headless-label">
          {select.selectedOption?.label ?? 'None'} ▾
        </button>
        <ul
          {...select.getListboxProps()}
          style={{ listStyle: 'none', padding: 4, border: '1px solid' }}
        >
          {options.map((o, i) => (
            <li
              key={o.value}
              {...select.getOptionProps(i)}
              style={{ padding: 4, background: i === select.activeIndex ? '#ddd' : undefined }}
            >
              {o.label}
            </li>
          ))}
        </ul>
      </div>
    );
  },
};
