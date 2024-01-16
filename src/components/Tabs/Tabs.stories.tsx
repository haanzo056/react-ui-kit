import type { Meta, StoryObj } from '@storybook/react';
import { Input } from '../Input/Input';
import { Tab, TabList, TabPanel, Tabs } from './Tabs';

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  args: { defaultValue: 'profile', children: null },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const content = (
  <>
    <TabList aria-label="Account settings">
      <Tab value="profile">Profile</Tab>
      <Tab value="security">Security</Tab>
      <Tab value="billing" disabled>
        Billing
      </Tab>
      <Tab value="notifications">Notifications</Tab>
    </TabList>
    <TabPanel value="profile">
      <Input label="Display name" defaultValue="Andrew" />
    </TabPanel>
    <TabPanel value="security">Two-factor authentication is enabled.</TabPanel>
    <TabPanel value="billing">Billing is managed by your organization.</TabPanel>
    <TabPanel value="notifications">You'll get a weekly summary email.</TabPanel>
  </>
);

export const Default: Story = { args: { children: content } };
export const ManualActivation: Story = { args: { children: content, activationMode: 'manual' } };
export const Vertical: Story = { args: { children: content, orientation: 'vertical' } };
