import type { Meta, StoryObj } from '@storybook/react';
import { Switch } from './Switch';

const meta = {
  title: 'Components/Switch',
  component: Switch,
  args: { label: 'Enable notifications' },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const On: Story = { args: { defaultChecked: true } };
export const LabelStart: Story = { args: { labelPosition: 'start' } };
export const Disabled: Story = { args: { disabled: true, defaultChecked: true } };

export const InForm: Story = {
  render: (args) => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        alert(JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))));
      }}
      style={{ display: 'flex', gap: 12, alignItems: 'center' }}
    >
      <Switch {...args} name="notifications" />
      <button type="submit">Submit</button>
    </form>
  ),
};
