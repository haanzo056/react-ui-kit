import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from './Textarea';

const meta = {
  title: 'Components/Textarea',
  component: Textarea,
  args: { label: 'Description' },
  decorators: [(Story) => <div style={{ maxWidth: 400 }}>{Story()}</div>],
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithCount: Story = {
  args: { showCount: true, maxLength: 140, hint: 'Shown on your profile' },
};
export const AutoResize: Story = {
  args: {
    autoResize: true,
    defaultValue: 'Type a few lines and the field grows with the content.',
  },
};
export const WithError: Story = { args: { error: 'Description is required', required: true } };
