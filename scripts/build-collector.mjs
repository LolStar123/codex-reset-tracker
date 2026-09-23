import { build } from 'esbuild';
await build({entryPoints:['scripts/github-collect.ts'],outfile:'dist-collector/collect.mjs',bundle:true,platform:'node',format:'esm',target:'node24'});
