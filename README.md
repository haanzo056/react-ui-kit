# ui-kit

[![CI](https://github.com/haanzo056/react-ui-kit/actions/workflows/ci.yml/badge.svg)](https://github.com/haanzo056/react-ui-kit/actions/workflows/ci.yml) [![Storybook](https://img.shields.io/badge/Storybook-live-FF4785?logo=storybook&logoColor=white)](https://haanzo056.github.io/react-ui-kit/) ![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white) ![License](https://img.shields.io/github/license/haanzo056/react-ui-kit)

A small React component library I use as a base for side projects. The focus is on getting keyboard and screen reader behaviour right for the handful of components every app ends up needing, not on covering everything.

Components: Button, IconButton, Input, Textarea, Select, Checkbox, Switch, Dialog, Tooltip, Tabs, Toast, DataTable.
Hooks: `useControllableState`, `useFocusTrap`, `useId`, `useMediaQuery`, plus `useSelect` if you want the select logic without the markup.

Storybook is deployed to GitHub Pages from `main`: **[haanzo056.github.io/react-ui-kit](https://haanzo056.github.io/react-ui-kit/)**.

## Install

```sh
npm install @kondratiyk/ui-kit
```

React 17 or 18 as a peer. Import the tokens and component styles once at the root of your app:

```tsx
import '@kondratiyk/ui-kit/tokens.css';
import '@kondratiyk/ui-kit/styles.css';
```

```tsx
import { Button, Dialog, ToastProvider, useToast } from '@kondratiyk/ui-kit';

function DeleteButton() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)}>
        Delete
      </Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        role="alertdialog"
        title="Delete project?"
        description="This can't be undone."
        footer={
          <Button
            variant="danger"
            onClick={() => {
              setOpen(false);
              toast({ title: 'Project deleted', variant: 'success' });
            }}
          >
            Delete
          </Button>
        }
      />
    </>
  );
}
```

`DataTable` is generic over the row type, so `accessor` only accepts keys whose values are sortable:

```tsx
const columns: Column<User>[] = [
  { id: 'name', header: 'Name', accessor: 'name', sortable: true },
  {
    id: 'joined',
    header: 'Joined',
    accessor: 'joined',
    sortable: true,
    cell: (u) => fmt(u.joined),
  },
];

<DataTable data={users} columns={columns} getRowId={(u) => u.id} caption="Team members" />;
```

## Styling and theming

Components are styled with plain CSS modules on top of CSS custom properties (`--ui-*`, see `src/styles/tokens.css`).

I went with CSS modules over vanilla-extract because esbuild (and therefore tsup) handles them natively via the `local-css` loader, so the build stays a single tsup call with no extra plugin, and consumers get one static CSS file with no runtime. vanilla-extract would give typed tokens, but the tokens here are few enough that it didn't seem worth the build complexity.

To theme, override the variables:

```css
:root {
  --ui-color-accent: #0f766e;
  --ui-color-accent-hover: #115e59;
  --ui-radius-md: 2px;
}
```

A dark theme ships in the tokens file and is enabled with `data-theme="dark"` on any ancestor, usually `<html>`. Durations drop to 0 under `prefers-reduced-motion`.

## Accessibility notes

- Select follows the APG "select-only combobox" pattern: focus stays on the trigger and `aria-activedescendant` tracks the highlighted option. Arrow keys, Home/End, PageUp/PageDown, type-ahead and Escape all work; Tab commits the highlighted option like a native select.
- Dialog traps focus, restores it to whatever opened it, locks page scroll and only the top-most dialog reacts to Escape. For destructive confirmations use `role="alertdialog"` and pass `initialFocus` pointing at the cancel button.
- Tooltip opens on hover and keyboard focus (not on mouse-click focus), stays open while hovered and closes on Escape, per WCAG 1.4.13. It is a description, not a label: icon-only buttons still need `aria-label`, which `IconButton` enforces at the type level.
- Toasts go into a polite live region that is mounted up front; errors use `role="alert"`. Timers pause on hover and focus.
- Tabs use a roving tabindex and support automatic or manual activation.
- DataTable puts `aria-sort` on the header cell and the click target is a real button inside it.
- Every component has a jest-axe check. axe in jsdom can't evaluate colour contrast, so that is checked by hand in Storybook with the a11y addon, in both themes.

## Development

```sh
npm install
npm run storybook   # localhost:6006
npm test
npm run build       # dist/: ESM, CJS, .d.ts, index.css, tokens.css
```

Releases use changesets: `npx changeset` on your branch, and `npm run release` after the version PR is merged.

## Not done yet

- Tooltip has no collision detection, so it can render off-screen near viewport edges. Probably worth switching to floating-ui.
- Select has no multi-select or search/filter mode. Options aren't virtualised, so very long lists (1000+) will be slow.
- DataTable: no row selection, column resizing or server-side sort/pagination helpers (controlled `sort`/`page` props work, but you wire the fetching yourself).
- Dialog relies on `aria-modal` instead of making the rest of the page `inert`.
- No RTL testing yet. Arrow key direction in Tabs assumes LTR.
- The React 17 path (the `useId` fallback) isn't covered in CI.

## License

MIT
