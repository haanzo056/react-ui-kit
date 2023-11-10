import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { Tooltip } from '../Tooltip/Tooltip';
import { IconButton } from './IconButton';

const Gear = () => (
  <svg viewBox="0 0 16 16" width="16" height="16">
    <circle cx="8" cy="8" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
);

const meta = {
  title: 'Components/IconButton',
  component: IconButton,
  args: { 'aria-label': 'Settings', icon: <Gear />, onClick: fn() },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 8 }}>
      <IconButton {...args} variant="ghost" />
      <IconButton {...args} variant="secondary" />
      <IconButton {...args} variant="primary" />
      <IconButton {...args} variant="danger" />
    </div>
  ),
};

// Icon-only buttons are a good place for a tooltip, but the aria-label is
// still what gives the button its name.
export const WithTooltip: Story = {
  render: (args) => (
    <Tooltip content="Settings">
      <IconButton {...args} />
    </Tooltip>
  ),
};
