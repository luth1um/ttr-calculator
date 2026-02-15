import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

export default defineConfig(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // eslint-plugin-react-hooks
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },
  {
    // needs to be in its own object to act as global ignore
    ignores: ['dist', '.prettierrc.js', 'config-overrides.js'],
  }
);
