import type { Meta, StoryObj } from '@storybook/react';
import { useMemo, useState } from 'react';
import { Input } from '../Input/Input';
import { DataTable, type Column } from './DataTable';

interface Invoice {
  id: string;
  customer: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  issued: Date;
}

const customers = [
  'Acme Co',
  'Globex',
  'Initech',
  'Umbrella',
  'Hooli',
  'Stark Industries',
  'Wayne Ent',
];
const statuses: Invoice['status'][] = ['paid', 'pending', 'overdue'];

// Deterministic so stories and visual snapshots don't change between reloads.
const invoices: Invoice[] = Array.from({ length: 47 }, (_, i) => ({
  id: `INV-${String(1000 + i)}`,
  customer: customers[(i * 7) % customers.length]!,
  amount: ((i * 7919) % 50000) / 10 + 50,
  status: statuses[(i * 5) % 3]!,
  issued: new Date(2025, (i * 3) % 12, ((i * 11) % 27) + 1),
}));

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const date = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' });

const columns: Column<Invoice>[] = [
  { id: 'id', header: 'Invoice', accessor: 'id', sortable: true, width: '8rem' },
  { id: 'customer', header: 'Customer', accessor: 'customer', sortable: true },
  {
    id: 'amount',
    header: 'Amount',
    accessor: 'amount',
    sortable: true,
    align: 'end',
    cell: (row) => currency.format(row.amount),
  },
  {
    id: 'status',
    header: 'Status',
    accessor: 'status',
    // Sort by severity rather than alphabetically.
    compare: (a, b) => statuses.indexOf(a.status) - statuses.indexOf(b.status),
    sortable: true,
  },
  {
    id: 'issued',
    header: 'Issued',
    accessor: 'issued',
    sortable: true,
    cell: (row) => date.format(row.issued),
  },
];

const meta = {
  title: 'Components/DataTable',
  component: DataTable<Invoice>,
  args: {
    data: invoices,
    columns,
    getRowId: (row) => row.id,
    caption: 'Invoices',
    pageSize: 10,
  },
} satisfies Meta<typeof DataTable<Invoice>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const SortedByAmount: Story = {
  args: { defaultSort: { columnId: 'amount', direction: 'desc' } },
};
export const Empty: Story = { args: { data: [], emptyMessage: 'No invoices yet' } };

export const WithFilter: Story = {
  render: (args) => {
    const [query, setQuery] = useState('');
    const filtered = useMemo(
      () => invoices.filter((inv) => inv.customer.toLowerCase().includes(query.toLowerCase())),
      [query],
    );
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ maxWidth: 280 }}>
          <Input
            label="Filter by customer"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <DataTable {...args} data={filtered} />
      </div>
    );
  },
};
