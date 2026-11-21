import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

const background = '#1f3a68' // matches the icon's tile

export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset: {
    ...minimal2023Preset,
    maskable: { ...minimal2023Preset.maskable, resizeOptions: { background } },
    apple: { ...minimal2023Preset.apple, resizeOptions: { background } },
  },
  images: ['public/icon.svg'],
})
