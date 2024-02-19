import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { DataTable, type Column } from './DataTable';
import { sortRows } from './sortRows';

interface User {
  id: number;
  name: string;
  age: number | null;
  joined: Date;
}

const users: User[] = [
  { id: 1, name: 'Mara', age: 34, joined: new Date('2021-03-01') },
  { id: 2, name: 'alex', age: 28, joined: new Date('2023-07-15') },
  { id: 3, name: 'Zoe', age: null, joined: new Date('2020-01-10') },
  { id: 4, name: 'Bo', age: 41, joined: new Date('2022-11-30') },
];

const columns: Column<User>[] = [
  { id: 'name', header: 'Name', accessor: 'name', sortable: true },
  { id: 'age', header: 'Age', accessor: 'age', sortable: true, align: 'end' },
  {
    id: 'joined',
    header: 'Joined',
    accessor: 'joined',
    sortable: true,
    cell: (u) => u.joined.toISOString().slice(0, 10),
  },
];

const bodyNames = () =>
  screen
    .getAllByRole('row')
    .slice(1)
    .map((row) => within(row).getAllByRole('cell')[0]?.textContent);

describe('sortRows', () => {
  it('sorts case-insensitively and keeps empty values last in both directions', () => {
    const asc = sortRows(users, (u) => u.age, 'asc').map((u) => u.name);
    const desc = sortRows(users, (u) => u.age, 'desc').map((u) => u.name);
    expect(asc).toEqual(['alex', 'Mara', 'Bo', 'Zoe']);
    expect(desc).toEqual(['Bo', 'Mara', 'alex', 'Zoe']);
  });

  it('compares numbers inside strings naturally', () => {
    const rows = ['item10', 'item2', 'item1'];
    expect(sortRows(rows, (r) => r, 'asc')).toEqual(['item1', 'item2', 'item10']);
  });
});

describe('DataTable', () => {
  it('renders a captioned table', () => {
    render(
      <DataTable data={users} columns={columns} getRowId={(u) => String(u.id)} caption="Users" />,
    );
    expect(screen.getByRole('table', { name: 'Users' })).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader')).toHaveLength(3);
  });

  it('cycles sort asc → desc → none and sets aria-sort', async () => {
    const user = userEvent.setup();
    render(
      <DataTable data={users} columns={columns} getRowId={(u) => String(u.id)} caption="Users" />,
    );
    const header = screen.getByRole('columnheader', { name: 'Name' });
    const button = within(header).getByRole('button');

    expect(header).toHaveAttribute('aria-sort', 'none');
    await user.click(button);
    expect(header).toHaveAttribute('aria-sort', 'ascending');
    expect(bodyNames()).toEqual(['alex', 'Bo', 'Mara', 'Zoe']);

    await user.click(button);
    expect(header).toHaveAttribute('aria-sort', 'descending');
    expect(bodyNames()).toEqual(['Zoe', 'Mara', 'Bo', 'alex']);

    await user.click(button);
    expect(header).toHaveAttribute('aria-sort', 'none');
    expect(bodyNames()).toEqual(['Mara', 'alex', 'Zoe', 'Bo']);
  });

  it('sorts dates by value, not by rendered text', async () => {
    const user = userEvent.setup();
    render(
      <DataTable data={users} columns={columns} getRowId={(u) => String(u.id)} caption="Users" />,
    );
    await user.click(screen.getByRole('button', { name: 'Joined' }));
    expect(bodyNames()).toEqual(['Zoe', 'Mara', 'Bo', 'alex']);
  });

  it('paginates and resets to page 1 when sorting', async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        data={users}
        columns={columns}
        getRowId={(u) => String(u.id)}
        caption="Users"
        pageSize={2}
      />,
    );
    expect(bodyNames()).toEqual(['Mara', 'alex']);
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(bodyNames()).toEqual(['Zoe', 'Bo']);
    expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Name' }));
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
  });

  it('clamps the page when data shrinks', () => {
    const { rerender } = render(
      <DataTable
        data={users}
        columns={columns}
        getRowId={(u) => String(u.id)}
        caption="Users"
        pageSize={2}
        defaultPage={2}
      />,
    );
    expect(bodyNames()).toEqual(['Zoe', 'Bo']);
    rerender(
      <DataTable
        data={users.slice(0, 2)}
        columns={columns}
        getRowId={(u) => String(u.id)}
        caption="Users"
        pageSize={2}
        defaultPage={2}
      />,
    );
    expect(bodyNames()).toEqual(['Mara', 'alex']);
  });

  it('shows the empty message', () => {
    render(
      <DataTable
        data={[]}
        columns={columns}
        getRowId={(u) => String(u.id)}
        caption="Users"
        emptyMessage="Nobody here"
      />,
    );
    expect(screen.getByRole('cell', { name: 'Nobody here' })).toHaveAttribute('colspan', '3');
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <DataTable
        data={users}
        columns={columns}
        getRowId={(u) => String(u.id)}
        caption="Users"
        pageSize={2}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
