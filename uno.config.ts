import { defineConfig, transformerDirectives, presetTypography, presetUno } from 'unocss'

export default defineConfig({
  presets: [presetUno(), presetTypography()],
  transformers: [transformerDirectives()],
  shortcuts: {
    'text-muted': 'text-neutral-400 dark:text-neutral-500',
    'style-cd': 'text-muted font-mono',
    'text-primary': 'text-neutral-800 dark:text-neutral-200',
    'text-secondary': 'text-neutral-600 dark:text-neutral-400',
    'text-tertiary': 'text-neutral-400 dark:text-neutral-500',
    'text-quaternary': 'text-neutral-300 dark:text-neutral-700'
  },
  rules: [[/^font-slim/, () => ({ 'font-family': 'Roboto Condensed' })]],
  theme: {
    fontFamily: {
      sans: '"Roboto", "Inter", sans-serif',
      mono: '"Roboto Mono", monospace',
      slim: '"Roboto Condensed", sans-serif'
    }
  }
})
