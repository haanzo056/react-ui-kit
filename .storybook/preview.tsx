import type { Decorator, Preview } from '@storybook/react';
import { useEffect } from 'react';
import '../src/styles/tokens.css';

const withTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme as 'light' | 'dark';
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.body.style.background = 'var(--ui-color-bg)';
    document.body.style.color = 'var(--ui-color-text)';
  }, [theme]);
  return <Story />;
};

const preview: Preview = {
  decorators: [withTheme],
  globalTypes: {
    theme: {
      description: 'Color theme',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'mirror',
        items: ['light', 'dark'],
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    layout: 'padded',
    controls: { expanded: true },
    backgrounds: { disable: true },
  },
};

export default preview;
