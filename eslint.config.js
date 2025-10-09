// Flat config para Angular + ESLint 9
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import angular from '@angular-eslint/eslint-plugin'
import angularTemplate from '@angular-eslint/eslint-plugin-template'

export default [
  // Ignorar rutas (reemplaza a .eslintignore)
  {
    ignores: ['dist', 'node_modules', 'coverage']
  },

  // Reglas base JS
  js.configs.recommended,

  // TypeScript + Angular (código .ts)
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        // Si usas "project": añade tsconfig.path aquí.
        // project: ['./tsconfig.app.json']
      }
    },
    plugins: {
      '@angular-eslint': angular,
    },
    rules: {
      // Reglas recomendadas Angular para TS
      ...angular.configs['recommended'].rules,
    }
  },

  // Templates Angular (.html)
  {
    files: ['**/*.html'],
    plugins: {
      '@angular-eslint/template': angularTemplate,
    },
    rules: {
      ...angularTemplate.configs['recommended'].rules,
    }
  }
]
