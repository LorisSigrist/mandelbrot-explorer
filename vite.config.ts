import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: 'src/mandelbrot-explorer.ts',
      formats: ['es', 'umd'],
      name: "mandelbrot-explorer"
    },
    rollupOptions: {
      external: /^lit/
    }
  }
})
