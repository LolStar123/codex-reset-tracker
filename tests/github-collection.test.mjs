import {test} from 'node:test';
import assert from 'node:assert/strict';
import {collectSnapshot} from '../lib/github-collection.ts';
import {seedSnapshot} from '../lib/seed.ts';
const time = '2026-09-23T12:00:00.000Z';
const page = (posts=[]) => ({posts,raw:[],oldest:time,caughtUp:true,cursor:null});
const history = async () => ({data:[],meta:{generated_at:time}});
test('source failure retains all history and last successful check',async()=>{
    const before=seedSnapshot();
    const result=await collectSnapshot(before,{timeline:async()=>{throw Error('Source returned 503');},history},time);
    assert.equal(result.status,'failed');
    assert.deepEqual(result.snapshot.posts,before.posts);
    assert.deepEqual(result.snapshot.events,before.events);
    assert.equal(result.snapshot.checkedAt,before.checkedAt);
    assert.equal(result.snapshot.lastAttemptAt,time);
});
test('duplicate confirmations do not duplicate posts or calendar events',async()=>{
    const before=seedSnapshot();
    const post={id:'test-confirm',author:'thsottiaux',text:'We have reset usage.',url:'https://x.com/thsottiaux/status/test-confirm',at:time,summary:'We have reset usage.',category:'confirmed',resetType:'regular',provenance:'direct'};
    const sources={timeline:async()=>page([post]),history};
    const first=await collectSnapshot(before,sources,time);
    const second=await collectSnapshot(first.snapshot,sources,time);
    assert.equal(second.status,'ok');
    assert.equal(second.snapshot.posts.filter(p=>p.id===post.id).length,1);
    assert.deepEqual(second.snapshot.events,first.snapshot.events);
    assert.ok(second.snapshot.events.some(e=>e.postIds.includes(post.id)));
});
test('expired catch-up cursors do not block current updates and restart from saved boundary',async()=>{
    const before={...seedSnapshot(),pendingCursor:'expired',catchupBoundary:'2026-08-01T00:00:00Z'};
    let calls=0;
    const first=await collectSnapshot(before,{timeline:async()=>{if(calls++)throw Error('404');return page();},history},time);
    assert.equal(first.status,'partial');
    assert.equal(first.snapshot.checkedAt,time);
    assert.equal(first.snapshot.pendingCursor,null);
    assert.equal(first.snapshot.catchupBoundary,before.catchupBoundary);
    const requests=[];
    await collectSnapshot(first.snapshot,{timeline:async(...args)=>{requests.push(args);return page();},history},time);
    assert.equal(requests[1][0],before.catchupBoundary);
    assert.equal(requests[1][2],null);
});
test('history outage preserves current source updates and reports partial health',async()=>{
    const result=await collectSnapshot(seedSnapshot(),{timeline:async()=>page(),history:async()=>{throw Error('503');}},time);
    assert.equal(result.status,'partial');
    assert.equal(result.snapshot.checkedAt,time);
    assert.equal(result.snapshot.error,null);
    assert.match(result.snapshot.historyError,/Historical source unavailable.*503/);
});
