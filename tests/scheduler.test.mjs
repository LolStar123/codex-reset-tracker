import test from 'node:test';
import assert from 'node:assert/strict';
import { collect } from '../scheduler/worker.mjs';

const env={MONITOR_URL:'https://monitor.example',MONITOR_ACCESS:'test-only'};
test('cloud job uses the private collector and returns health metadata only',async()=>{
    const receipt={checkedAt:new Date().toISOString(),latestPostAt:null,status:'ok',postCount:2,resetCount:1,secret:'not logged'};
    const result=await collect(env,async(url,options)=>{
        assert.equal(url.href,'https://monitor.example/api/collect');
        assert.equal(options.method,'POST');
        assert.equal(options.redirect,'error');
        assert.equal(options.headers['OAI-Sites-Authorization'],'Bearer test-only');
        return Response.json(receipt);
    });
    assert.equal(result.status,'ok');assert.ok(!('secret' in result));
});
test('auth errors, stale source data and source failures fail the scheduled run',async()=>{
    await assert.rejects(collect(env,async()=>new Response('',{status:401})),/HTTP 401/);
    await assert.rejects(collect(env,async()=>Response.json({checkedAt:'2020-01-01',status:'ok'})),/recent/);
    await assert.rejects(collect(env,async()=>Response.json({checkedAt:new Date().toISOString(),status:'failed'})),/failed/);
});
test('missing credentials and non-HTTPS destinations make no request',async()=>{
    const forbidden=()=>{throw Error('Unexpected network request');};
    await assert.rejects(collect({...env,MONITOR_ACCESS:''},forbidden),/credential/);
    await assert.rejects(collect({...env,MONITOR_URL:'http://monitor.example'},forbidden),/HTTPS/);
});
