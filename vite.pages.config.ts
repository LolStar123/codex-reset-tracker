import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

const repository = process.env.GITHUB_REPOSITORY || 'LolStar123/codex-reset-tracker';
const base = process.env.PAGES_BASE || `/${repository.split('/')[1]}/`;
export default defineConfig({
    root: 'pages',
    base,
    publicDir: '../public',
    plugins: [react()],
    resolve: { alias: { '@': fileURLToPath(new URL('.', import.meta.url)) } },
    define: {
        __MONITOR_BASE__: JSON.stringify(base),
        __MONITOR_ENDPOINT__: JSON.stringify(`https://raw.githubusercontent.com/${repository}/monitor-data/snapshot.json`),
    },
    css: { postcss: fileURLToPath(new URL('.', import.meta.url)) },
    build: { outDir: '../dist-pages', emptyOutDir: true },
});
