import type { Meta, StoryObj } from '@storybook/react';
import { useRef } from 'react';
import { Button } from '../Button/Button';
import { ToastProvider, useToast } from './Toast';

function Demo() {
  const { toast, clear } = useToast();
  const count = useRef(0);
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Button onClick={() => toast({ title: 'Draft saved' })}>Info</Button>
      <Button
        onClick={() =>
          toast({ title: 'Invite sent', description: 'maria@example.com', variant: 'success' })
        }
      >
        Success
      </Button>
      <Button
        onClick={() =>
          toast({
            title: 'Upload failed',
            description: 'The file is larger than 25 MB.',
            variant: 'error',
          })
        }
      >
        Error
      </Button>
      <Button
        onClick={() =>
          toast({
            title: 'Conversation archived',
            action: { label: 'Undo', onClick: () => toast({ title: 'Restored' }) },
          })
        }
      >
        With action
      </Button>
      <Button
        onClick={() => {
          for (let i = 0; i < 5; i++)
            toast({ title: `Queued toast ${++count.current}`, duration: 2500 });
        }}
      >
        Burst of 5 (limit 3)
      </Button>
      <Button variant="ghost" onClick={clear}>
        Clear all
      </Button>
    </div>
  );
}

const meta = {
  title: 'Components/Toast',
  component: ToastProvider,
  args: { children: <Demo />, limit: 3, position: 'bottom-right' },
  argTypes: {
    position: { control: 'inline-radio', options: ['top-right', 'bottom-right', 'bottom-center'] },
  },
} satisfies Meta<typeof ToastProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const TopRight: Story = { args: { position: 'top-right' } };
