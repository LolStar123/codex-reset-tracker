import { readFile, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';
import { collectSnapshot } from '../lib/github-collection';
import type { Snapshot } from '../lib/types';

const directory = process.argv[2] || 'state';
async function read(name: string) { return JSON.parse((await readFile(path.join(directory,name),'utf8')).replace(/^\uFEFF/,'')); }
async function write(name: string, value: unknown) {
    const target = path.join(directory,name);
    await writeFile(target + '.tmp', JSON.stringify(value,null,2) + '\n');
    await rename(target + '.tmp',target);
}
// A missing or corrupt state is an error, never a reason to discard collected history.
const before = await read('snapshot.json') as Snapshot;
if (!Array.isArray(before.posts) || !Array.isArray(before.events)) throw Error('Invalid saved snapshot');
const result = await collectSnapshot(before);
const raw = new Map<string,unknown>((await read('raw-posts.json')).map((p: {id:string}) => [p.id,p]));
for (const post of result.raw) raw.set(post.id,post);
const receipt = {startedAt:result.snapshot.lastAttemptAt,finishedAt:new Date().toISOString(),status:result.status,checkedAt:result.snapshot.checkedAt,
    posts:result.snapshot.posts.length,events:result.snapshot.events.length,newPosts:result.snapshot.posts.filter(p=>!before.posts.some(old=>old.id===p.id)).length,error:result.snapshot.error};
await write('raw-posts.json',[...raw.values()]);
await write('runs.json',[...(await read('runs.json')),receipt].slice(-2016));
await write('snapshot.json',result.snapshot);
console.log(JSON.stringify(receipt));
if (result.status === 'failed') process.exitCode = 1;
