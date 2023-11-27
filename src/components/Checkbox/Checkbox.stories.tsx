import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Checkbox } from './Checkbox';

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  args: { label: 'Email me about product updates' },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Checked: Story = { args: { defaultChecked: true } };
export const WithDescription: Story = {
  args: { description: 'Roughly once a month. Unsubscribe anytime.' },
};
export const Disabled: Story = { args: { disabled: true } };

export const SelectAll: Story = {
  render: () => {
    const items = ['Invoices', 'Receipts', 'Contracts'];
    const [selected, setSelected] = useState<string[]>(['Receipts']);
    const all = selected.length === items.length;
    const some = selected.length > 0 && !all;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Checkbox
          label="All documents"
          checked={all}
          indeterminate={some}
          onCheckedChange={() => setSelected(all ? [] : items)}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 24 }}>
          {items.map((item) => (
            <Checkbox
              key={item}
              label={item}
              checked={selected.includes(item)}
              onCheckedChange={(checked) =>
                setSelected((prev) => (checked ? [...prev, item] : prev.filter((i) => i !== item)))
              }
            />
          ))}
        </div>
      </div>
    );
  },
};
