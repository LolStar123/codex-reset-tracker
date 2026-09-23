import {build} from 'esbuild';
import {spawnSync} from 'node:child_process';
const suites=['classification','collector','history','reset-brief','reset-clocks','github-collection'];
for (const suite of suites) {
    const outfile=`output/tests/${suite}.cjs`;
    await build({entryPoints:[`tests/${suite}.test.mjs`],outfile,bundle:true,platform:'node',format:'cjs'});
    const result=spawnSync(process.execPath,['--test',outfile],{stdio:'inherit'});
    if (result.status!==0) process.exit(result.status??1);
}
