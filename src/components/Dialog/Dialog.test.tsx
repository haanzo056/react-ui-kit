import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { useState } from 'react';
import { Button } from '../Button/Button';
import { Dialog } from './Dialog';

function Harness({ closeOnOverlayClick = true }: { closeOnOverlayClick?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open</Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Delete project"
        description="This cannot be undone."
        closeOnOverlayClick={closeOnOverlayClick}
        footer={
          <>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="danger">Delete</Button>
          </>
        }
      />
    </>
  );
}

describe('Dialog', () => {
  it('renders into a portal with dialog semantics', async () => {
    const { container } = render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));

    const dialog = screen.getByRole('dialog', { name: 'Delete project' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleDescription('This cannot be undone.');
    expect(container).not.toContainElement(dialog);
  });

  it('moves focus inside and traps Tab', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('button', { name: 'Open' }));

    const close = screen.getByRole('button', { name: 'Close' });
    const cancel = screen.getByRole('button', { name: 'Cancel' });
    const del = screen.getByRole('button', { name: 'Delete' });

    await waitFor(() => expect(close).toHaveFocus());
    await user.tab();
    expect(cancel).toHaveFocus();
    await user.tab();
    expect(del).toHaveFocus();
    await user.tab();
    expect(close).toHaveFocus();
    await user.tab({ shift: true });
    expect(del).toHaveFocus();
  });

  it('closes on Escape and restores focus to the trigger', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const trigger = screen.getByRole('button', { name: 'Open' });
    await user.click(trigger);
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('closes on overlay click but not on content click', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('button', { name: 'Open' }));

    await user.click(screen.getByText('This cannot be undone.'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByTestId('dialog-overlay'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('can ignore overlay clicks', async () => {
    const user = userEvent.setup();
    render(<Harness closeOnOverlayClick={false} />);
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await user.click(screen.getByTestId('dialog-overlay'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('locks body scroll while open', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(document.body.style.overflow).toBe('hidden');
    await user.keyboard('{Escape}');
    expect(document.body.style.overflow).toBe('');
  });

  it('has no axe violations', async () => {
    render(<Dialog open onOpenChange={() => {}} title="Settings" description="Update prefs" />);
    expect(await axe(document.body)).toHaveNoViolations();
  });
});
