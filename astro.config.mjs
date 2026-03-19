// @ts-check
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from 'astro/config'
import tsconfigPaths from 'vite-tsconfig-paths'

import react from '@astrojs/react';

import vue from '@astrojs/vue';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss(), tsconfigPaths()],
  },

  integrations: [react(), vue()],
  image: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'takshashilascs.com' },
    ],
  },
})