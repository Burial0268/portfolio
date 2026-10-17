// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: ['bzsr-devenvlaptop02.taila30f9f.ts.net']
    },
    ssr: {
      noExternal: ['motion', '@applemusic-like-lyrics/react', '@applemusic-like-lyrics/core']
    },
    build: {
      rollupOptions: {
        output: {
          // rolldown (Vite 8) only accepts the function form
          manualChunks: (id) => (id.includes('node_modules/motion') ? 'motion' : undefined)
        }
      }
    }
  },

  integrations: [react()]
});
