import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Tab, TabList, TabPanel, Tabs, type TabsProps } from './Tabs';

function renderTabs(props: Partial<TabsProps> = {}) {
  return render(
    <Tabs defaultValue="account" {...props}>
      <TabList aria-label="Settings">
        <Tab value="account">Account</Tab>
        <Tab value="billing" disabled>
          Billing
        </Tab>
        <Tab value="team">Team</Tab>
      </TabList>
      <TabPanel value="account">Account panel</TabPanel>
      <TabPanel value="billing">Billing panel</TabPanel>
      <TabPanel value="team">Team panel</TabPanel>
    </Tabs>,
  );
}

describe('Tabs', () => {
  it('wires tabs to panels', () => {
    renderTabs();
    const tab = screen.getByRole('tab', { name: 'Account' });
    const panel = screen.getByRole('tabpanel', { name: 'Account' });
    expect(tab).toHaveAttribute('aria-selected', 'true');
    expect(tab).toHaveAttribute('aria-controls', panel.id);
    expect(panel).toHaveTextContent('Account panel');
  });

  it('uses a roving tabindex', () => {
    renderTabs();
    expect(screen.getByRole('tab', { name: 'Account' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('tab', { name: 'Team' })).toHaveAttribute('tabindex', '-1');
  });

  it('arrow keys move and activate, skipping disabled tabs', async () => {
    const user = userEvent.setup();
    renderTabs();
    await user.tab();
    expect(screen.getByRole('tab', { name: 'Account' })).toHaveFocus();

    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Team' })).toHaveFocus();
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Team panel');

    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Account' })).toHaveFocus();

    await user.keyboard('{End}');
    expect(screen.getByRole('tab', { name: 'Team' })).toHaveFocus();
    await user.keyboard('{Home}');
    expect(screen.getByRole('tab', { name: 'Account' })).toHaveFocus();
  });

  it('manual activation waits for Enter', async () => {
    const user = userEvent.setup();
    renderTabs({ activationMode: 'manual' });
    await user.tab();
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('tab', { name: 'Team' })).toHaveFocus();
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Account panel');

    await user.keyboard('{Enter}');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Team panel');
  });

  it('vertical orientation uses up/down', async () => {
    const user = userEvent.setup();
    renderTabs({ orientation: 'vertical' });
    expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical');
    await user.tab();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('tab', { name: 'Team' })).toHaveFocus();
  });

  it('throws a helpful error outside <Tabs>', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Tab value="x">X</Tab>)).toThrow('<Tab> must be rendered inside <Tabs>');
    vi.mocked(console.error).mockRestore();
  });

  it('has no axe violations', async () => {
    const { container } = renderTabs();
    expect(await axe(container)).toHaveNoViolations();
  });
});
