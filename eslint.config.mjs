import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  ...compat.extends(
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:storybook/recommended',
    'plugin:prettier/recommended'
  ),
  {
    files: ['**/*.ts', '**/*.tsx'],
    ignores: ['**/node_modules/**', '**/coverage/**', '**/dist/**', '**/src/gql/**'],
    plugins: {
      'simple-import-sort': simpleImportSort,
    },

    languageOptions: {
      parser: tsParser,
      ecmaVersion: 5,
      sourceType: 'script',

      parserOptions: {
        project: ['./tsconfig.json'],
      },
    },

    rules: {
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      'eslint-comments/disable-enable-pair': 'off',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'import/named': 'off',
      'import/order': 'off',

      // "import/no-extraneous-dependencies": ["error", {
      //     devDependencies: true,
      // }],

      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-expect-error': 'allow-with-description',
          'ts-ignore': 'allow-with-description',
          'ts-nocheck': 'allow-with-description',
          'ts-check': 'allow-with-description',
          minimumDescriptionLength: 3,
        },
      ],

      'jest/no-deprecated-functions': 'off',

      // Ban common DOM/JS sinks used for runtime code/HTML injection.
      'no-restricted-syntax': [
        'error',
        {
          selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
          message: 'dangerouslySetInnerHTML is banned',
        },
        {
          selector: "AssignmentExpression[left.property.name='innerHTML']",
          message: 'innerHTML assignment is banned',
        },
        {
          selector: "AssignmentExpression[left.property.name='outerHTML']",
          message: 'outerHTML assignment is banned',
        },
        {
          selector: "CallExpression[callee.property.name='insertAdjacentHTML']",
          message: 'insertAdjacentHTML is banned',
        },
        {
          selector:
            "CallExpression[callee.object.name='document'][callee.property.name=/^writeln?$/]",
          message: 'document.write/writeln is banned',
        },
        {
          selector: "JSXAttribute[name.name='srcdoc']",
          message: 'iframe srcdoc is banned',
        },
        {
          selector: "CallExpression[callee.property.name='createContextualFragment']",
          message: 'createContextualFragment is banned',
        },
        {
          selector:
            "CallExpression[callee.name=/^(setTimeout|setInterval)$/][arguments.0.type='Literal']",
          message: 'String-form setTimeout/setInterval is banned',
        },
        {
          selector: "CallExpression[callee.name='eval']",
          message: 'eval is banned',
        },
        {
          selector: "NewExpression[callee.name='Function']",
          message: 'Function constructor is banned',
        },
      ],
    },
  },
];
