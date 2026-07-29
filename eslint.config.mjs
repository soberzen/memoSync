import { defineConfig } from 'eslint/config';
import eslint from '@eslint/js';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import globals from 'globals';
import typescript from 'typescript-eslint';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import eslintPluginReact from 'eslint-plugin-react';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import eslintConfigPrettier from 'eslint-config-prettier';

const ignores = [
  'dist',
  'build',
  '**/*.js',
  '**/*.mjs',
  '**/*.d.ts',
  'eslint.config.js',
  'commitlint.config.js',
];

// 1. 前端 Next.js 配置
const frontendConfig = [
  ...nextVitals,
  ...nextTs,
  {
    files: ['apps/frontend/web/**/*.{ts,tsx}'],
    plugins: {
      react: eslintPluginReact,
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
    },
  },
];

// 2. 公共包配置
const commonConfig = {
  files: ['packages/**/*.{js,jsx,ts,tsx}'],
  plugins: {
    react: eslintPluginReact,
    'react-hooks': pluginReactHooks,
  },
  languageOptions: {
    globals: {
      ...globals.browser,
    },
  },
  rules: {
    ...pluginReactHooks.configs.recommended.rules,
    'react/react-in-jsx-scope': 'off',
  },
};

// 3. 后端配置
const backenConfig = {
  files: ['apps/backend/**/*.ts'],
  languageOptions: {
    globals: {
      ...globals.node,
      ...globals.jest,
    },
    parser: typescript.parser,
  },
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'no-console': 'error',
  },
};

export default defineConfig([
  { ignores },
  eslint.configs.recommended,
  typescript.configs.recommended,
  ...frontendConfig,
  backenConfig,
  commonConfig,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      unicorn: eslintPluginUnicorn,
    },
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'unicorn/no-empty-file': 'error',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  eslintConfigPrettier,
]);
