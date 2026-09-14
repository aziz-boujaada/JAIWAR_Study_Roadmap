import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/JAIWAR_Study_Roadmap/' : '/',
  plugins: [react(), tailwindcss()],
}));
