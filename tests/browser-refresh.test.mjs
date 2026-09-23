import {test} from 'node:test';
import assert from 'node:assert/strict';
import {checkLive,newestSnapshot} from '../lib/browser-refresh.ts';
import {classify,deriveEvents} from '../lib/classify.ts';
import {lastReset} from '../lib/reset-clocks.ts';
const empty={posts:[],events:[],checkedAt:null,historyCheckedAt:null,coverageStart:null,replyCoverageStart:null,error:null};
const raw=text=>({id:'sample-rollout',author:{screen_name:'thsottiaux'},text,url:'https://x.com/thsottiaux/status/sample-rollout',created_at:'2026-09-23T12:00:00Z'});
test('manual check requests the live reply-inclusive source, derives an announcement and advances the displayed clock',async()=>{
    const original=globalThis.fetch;const requests=[];
    globalThis.fetch=async(url,options)=>{
        requests.push({url:String(url),options});
        return Response.json({code:200,results:[raw('We are granting another banked reset to all accounts.')],cursor:{bottom:null}});
    };
    try {
        const snapshot=await checkLive(empty);
        assert.equal(requests.length,1);
        assert.match(requests[0].url,/api\.fxtwitter\.com.*with_replies=true/);
        assert.equal(requests[0].options.cache,'no-store');
        const post=snapshot.posts.find(p=>p.id==='sample-rollout');
        assert.equal(post.category,'scheduled');assert.equal(post.eventBasis,'announcement');
        assert.equal(snapshot.events.find(e=>e.postIds.includes(post.id)).basis,'announcement');
        assert.equal(lastReset(snapshot.posts).id,post.id);
        assert.ok(Date.now()-Date.parse(snapshot.checkedAt)<5000);
    }finally{globalThis.fetch=original;}
});
test('cached shared data cannot roll back a newer direct source check',()=>{
    const current={...empty,checkedAt:'2026-09-23T12:00:00Z'};
    assert.equal(newestSnapshot(current,{...empty,checkedAt:'2026-09-23T11:55:00Z'}),current);
    const newer={...empty,checkedAt:'2026-09-23T12:05:00Z'};
    assert.equal(newestSnapshot(current,newer),newer);
});
test('manual source errors reject, rather than reporting a cached snapshot as a successful check',async()=>{
    const original=globalThis.fetch;globalThis.fetch=async()=>new Response('',{status:503});
    try {await assert.rejects(()=>checkLive(empty),/503/);}finally{globalThis.fetch=original;}
});
test('promises, denials and hypothetical grants cannot advance the reset clock',()=>{
    for(const wording of ['We will grant a banked reset tomorrow.','We are not loading a banked reset.','If we are loading a banked reset, we will announce it.','We are loading a banked reset tomorrow.']) {
        const post=classify(raw(wording));
        assert.notEqual(post?.eventBasis,'announcement',wording);
        assert.equal(deriveEvents(post?[post]:[]).length,0,wording);
        assert.equal(lastReset(post?[post]:[]),undefined,wording);
    }
});
