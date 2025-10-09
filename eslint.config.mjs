// eslint.config.mjs
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import angular from '@angular-eslint/eslint-plugin'
import angularTemplate from '@angular-eslint/eslint-plugin-template'

export default [
  // Ignorados (reemplaza a .eslintignore)
  { ignores: ['dist', 'node_modules', 'coverage'] },

  // Reglas base de JS
  js.configs.recommended,

  // TypeScript (.ts)
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        // Si quieres type-aware rules, agrega:
        // project: ['./tsconfig.app.json']
      }
    },
    plugins: {
      '@angular-eslint': angular
    },
    rules: {
      ...angular.configs['recommended'].rules
    }
  },

  // Templates Angular (.html)
  {
    files: ['**/*.html'],
    plugins: {
      '@angular-eslint/template': angularTemplate
    },
    rules: {
      ...angularTemplate.configs['recommended'].rules
    }
  }
]
