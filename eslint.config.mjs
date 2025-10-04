import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // needs to be in its own object to act as global ignore
    ignores: ['build', '.prettierrc.js', 'config-overrides.js'],
  }
);
