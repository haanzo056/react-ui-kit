import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta = {
  title: 'Components/Input',
  component: Input,
  args: { label: 'Email', placeholder: 'you@example.com', type: 'email' },
  decorators: [(Story) => <div style={{ maxWidth: 320 }}>{Story()}</div>],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithHint: Story = { args: { hint: 'We only use this for receipts.' } };
export const WithError: Story = {
  args: { error: 'Enter a valid email address', defaultValue: 'nope' },
};
export const Required: Story = { args: { required: true } };
export const Disabled: Story = { args: { disabled: true, defaultValue: 'locked@example.com' } };
export const HiddenLabel: Story = {
  args: { label: 'Search', hideLabel: true, type: 'search', placeholder: 'Search…' },
};
