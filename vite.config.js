import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/card.js',
      name: 'FullCalendarHassCard',
      fileName: 'fullcalendar-hass-card'
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        assetFileNames: `fullcalendar-hass-card.[ext]`
      }
    }
  }
});