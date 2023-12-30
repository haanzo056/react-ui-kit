import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../Button/Button';
import { Tooltip } from './Tooltip';

const meta = {
  title: 'Components/Tooltip',
  component: Tooltip,
  args: { content: 'Copies the link to your clipboard', children: <Button>Copy link</Button> },
  decorators: [(Story) => <div style={{ padding: 60 }}>{Story()}</div>],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sides: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
        <Tooltip key={side} content={`On the ${side}`} side={side}>
          <Button>{side}</Button>
        </Tooltip>
      ))}
    </div>
  ),
};

export const NoDelay: Story = { args: { delay: 0 } };
export const Disabled: Story = { args: { disabled: true } };
