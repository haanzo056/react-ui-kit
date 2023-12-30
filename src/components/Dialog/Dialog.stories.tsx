import type { Meta, StoryObj } from '@storybook/react';
import { useRef, useState } from 'react';
import { Button } from '../Button/Button';
import { Input } from '../Input/Input';
import { Dialog, type DialogProps } from './Dialog';

function DialogDemo(props: Partial<DialogProps>) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open dialog</Button>
      <Dialog
        title="Rename project"
        description="Project names are visible to everyone in the workspace."
        {...props}
        open={open}
        onOpenChange={setOpen}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setOpen(false)}>
              Save
            </Button>
          </>
        }
      >
        {props.children ?? <Input label="Name" defaultValue="Marketing site" />}
      </Dialog>
    </>
  );
}

const meta = {
  title: 'Components/Dialog',
  component: DialogDemo,
} satisfies Meta<typeof DialogDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Small: Story = { args: { size: 'sm' } };
export const NoOverlayClose: Story = { args: { closeOnOverlayClick: false } };

export const AlertDialog: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const cancelRef = useRef<HTMLButtonElement>(null);
    return (
      <>
        <Button variant="danger" onClick={() => setOpen(true)}>
          Delete account
        </Button>
        {/* Destructive confirmations should focus the safe option first. */}
        <Dialog
          role="alertdialog"
          open={open}
          onOpenChange={setOpen}
          title="Delete account?"
          description="All projects and billing history will be removed. This can't be undone."
          size="sm"
          hideCloseButton
          closeOnOverlayClick={false}
          initialFocus={cancelRef}
          footer={
            <>
              <Button ref={cancelRef} onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={() => setOpen(false)}>
                Delete
              </Button>
            </>
          }
        />
      </>
    );
  },
};

export const LongContent: Story = {
  args: {
    children: Array.from({ length: 30 }, (_, i) => (
      <p key={i}>Paragraph {i + 1}. The dialog body scrolls; the page behind it does not.</p>
    )),
  },
};
