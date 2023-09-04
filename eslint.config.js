import js from '@eslint/js';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'storybook-static', 'coverage', '!.storybook'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser },
    },
    plugins: {
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.flatConfigs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
  {
    files: ['**/*.test.{ts,tsx}', '**/*.stories.tsx', '.storybook/**'],
    rules: {
      // Storybook's `render` and decorators are components in practice,
      // the rule just can't tell from the name.
      'react-hooks/rules-of-hooks': 'off',
      'jsx-a11y/no-autofocus': 'off',
    },
  },
  {
    files: ['*.config.{js,ts}', 'vitest.setup.ts'],
    languageOptions: { globals: { ...globals.node } },
  },
);
