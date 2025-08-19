
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(async () => {
  const plugins = [react()];
  if (process.env.ANALYZE === '1') {
    const { visualizer } = await import('rollup-plugin-visualizer');
    plugins.push(visualizer({ open: true }));
  }
  return { plugins };
});
