import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-a11y'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
  // GitHub Pages serves the site from /<repo>/, set in the deploy workflow.
  viteFinal: (viteConfig) => {
    if (process.env.STORYBOOK_BASE) viteConfig.base = process.env.STORYBOOK_BASE;
    return viteConfig;
  },
};

export default config;
