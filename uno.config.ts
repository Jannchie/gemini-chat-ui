import fs from 'node:fs'
import { defineConfig, presetTypography, presetUno } from 'unocss'
import { rokuPreset } from '@roku-ui/preset'

const file = fs.readFileSync('node_modules/@roku-ui/vue/dist/index.js', 'utf-8')

export default defineConfig({
  content: {
    inline: [file],
  },
  presets: [
    rokuPreset(),
    presetTypography({
      cssExtend: {
        h1: {
          'font-size': '1.5rem',
          'margin-bottom': '1rem',
          'margin-top': '0rem',
        },
        h2: {
          'font-size': '1.25rem',
          'margin-bottom': '0.75rem',
          'margin-top': '0rem',
        },
        h3: {
          'font-size': '1.125rem',
          'margin-bottom': '0.5rem',
          'margin-top': '0rem',
        },
        h4: {
          'font-size': '1rem',
          'margin-bottom': '0.5rem',
          'margin-top': '0rem',
        },
        p: {
          'margin-bottom': '1rem',
          'margin-top': '0rem',
        },
      },
    }),
  ],
})
