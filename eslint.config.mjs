import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      // Allow explicit any in infrastructure/api boundary code
      '@typescript-eslint/no-explicit-any': 'warn',
      // Allow unused vars prefixed with _
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // Enforce consistent imports
      'import/no-duplicates': 'error',
      // React 19 — no need to import React
      'react/react-in-jsx-scope': 'off',
      // Allow empty interfaces for extension patterns
      '@typescript-eslint/no-empty-interface': 'off',
      // Prefer const
      'prefer-const': 'error',
      // No console.log in production code (warn to allow during dev)
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    },
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'public/**',
      'skills/**',
      'puck-builder-mcp/**',
      'docs/**',
      'scripts/**',
      '*.config.js',
      '*.config.mjs',
    ],
  },
];

export default eslintConfig;
