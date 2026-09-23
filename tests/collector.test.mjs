import {test} from 'node:test';
import assert from 'node:assert/strict';
import {collectTimeline,getJson} from '../lib/collector.ts';
import {resetBrief} from '../lib/reset-brief.ts';
const raw=(id,text,author='thsottiaux',extra={})=>({id,text,url:`https://x.com/${author}/status/${id}`,created_at:'2026-09-22T04:00:00Z',author:{screen_name:author},...extra});
test('a banked grant being loaded is incoming, not a completed reset',async()=>{
    const original=globalThis.fetch;
    const post=raw('loading','Not only are the models improved. We are loading a banked reset into all accounts of our Plus, Pro and Business users.');
    globalThis.fetch=async()=>Response.json({code:200,results:[post],cursor:{bottom:null}});
    try {
        const result=await collectTimeline(null,1);
        assert.equal(result.posts[0].category,'scheduled');
        assert.equal(result.posts[0].resetType,'banked');
        assert.equal(result.posts[0].eventBasis,'announcement');
        assert.equal(resetBrief(result.posts,Date.parse(post.created_at)).text,'awaiting rollout confirmation');
    }finally{globalThis.fetch=original;}
});
test('collector includes replies, retrieves missing context and resumes pagination',async()=>{
    const original=globalThis.fetch;const urls=[];
    globalThis.fetch=async url=>{
        urls.push(String(url));const u=new URL(url);
        if(u.pathname.includes('/2/status/'))return Response.json({code:200,status:raw('99','When will Codex usage reset?','reader')});
        if(u.searchParams.get('cursor')==='page2')return Response.json({code:200,results:[raw('98','We have reset usage.')],cursor:{bottom:null}});
        return Response.json({code:200,results:[raw('100','Tomorrow.','thsottiaux',{replying_to:{status:'99',screen_name:'reader'}})],cursor:{bottom:'page2'}});
    };
    try {
        const first=await collectTimeline(null,1);
        assert.equal(first.caughtUp,false);assert.equal(first.cursor,'page2');assert.equal(first.posts[0].category,'scheduled');assert.equal(first.posts[0].parent.author,'reader');
        assert.ok(urls[0].includes('with_replies=true'));
        const second=await collectTimeline(null,2,first.cursor);
        assert.equal(second.caughtUp,true);assert.equal(second.cursor,null);assert.equal(second.posts[0].id,'98');
    }finally{globalThis.fetch=original;}
});
test('upstream failure is not treated as an empty successful collection',async()=>{
    const original=globalThis.fetch;globalThis.fetch=async()=>new Response('Unavailable',{status:503});
    try{await assert.rejects(()=>getJson('https://api.fxtwitter.com/test'),/503/);}finally{globalThis.fetch=original;}
});
test('an unavailable parent stays explicitly missing',async()=>{
    const original=globalThis.fetch;
    globalThis.fetch=async url=>String(url).includes('/2/status/')?new Response('',{status:404}):Response.json({code:200,results:[raw('100','Maybe a reset tomorrow','thsottiaux',{replying_to:{status:'99'}})],cursor:{bottom:null}});
    try{const result=await collectTimeline(null,1);assert.equal(result.posts[0].parentMissing,true);assert.equal(result.posts[0].category,'hint');}finally{globalThis.fetch=original;}
});
test('a newly collected delay reply changes the forecast without manual editing',async()=>{
    const original=globalThis.fetch;
    const parent=raw('200','The Codex reset is coming Tuesday.');
    const delay=raw('201','It is delayed until tomorrow.','thsottiaux',{replying_to:{status:'200'},created_at:'2026-09-22T09:00:00Z'});
    globalThis.fetch=async url=>String(url).includes('/2/status/')?Response.json({code:200,status:parent}):Response.json({code:200,results:[delay],cursor:{bottom:null}});
    try {
        const result=await collectTimeline('2026-09-22T08:00:00Z');
        assert.equal(result.posts[0].id,'201');
        assert.equal(result.posts[0].category,'correction');
        assert.deepEqual(resetBrief(result.posts,Date.parse('2026-09-22T09:01:00Z')),{text:'reset expected wednesday',url:delay.url});
    }finally{globalThis.fetch=original;}
});
