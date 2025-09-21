import { defineConfig, transformerDirectives, presetTypography, presetWind4, presetAttributify } from 'unocss'

export default defineConfig({
  presets: [
    presetWind4(),
    presetTypography(),
    presetAttributify(),
  ],
  transformers: [
    transformerDirectives()
  ],
  shortcuts: {
    'underline-link': `relative after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-1px after:bg-neutral-200 after:scale-0 after:origin-left hover:after:scale-100 after:transition-transform after:duration-300`
  }
})