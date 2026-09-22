import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {seedSnapshot} from '../lib/seed.ts';
import {reconcileArchive} from '../lib/archive.ts';
import {applyCorrections} from '../lib/overrides.ts';
import {classify,deriveEvents} from '../lib/classify.ts';

const seed=seedSnapshot();
const post=id=>seed.posts.find(p=>p.id===id);
const raw=(text,extra={})=>({id:'test',author:{screen_name:'thsottiaux'},text,url:'https://x.com/thsottiaux/status/test',created_at:'2026-09-22T00:00:00Z',...extra});

test('July banked grants retain their actual scopes and a separate full-reset announcement',()=>{
    assert.equal(post('2076418567143408112').resetType,'banked');
    assert.match(post('2076418567143408112').scope,/500k/);
    assert.equal(post('2076735790567338203').resetType,'banked');
    assert.equal(post('2076365965915467978').category,'scheduled');
    const july12=seed.events.filter(e=>e.date==='2026-07-12');
    assert.deepEqual(new Set(july12.map(e=>e.type)),new Set(['banked','regular']));
    assert.equal(july12.find(e=>e.type==='regular').basis,'announcement');
});

test('June banked launch and combined grants are represented without relabelling old balances',()=>{
    assert.equal(post('2065225362544726371').author,'OpenAI');
    assert.equal(post('2067399435009622521').resetType,'both');
    assert.equal(post('2071740419030053227').resetType,'both');
    assert.equal(post('2071740419030053227').category,'scheduled');
    assert.equal(post('2071381664853319742').resetType,'regular');
});

test('banked announcement and later delivery produce one event on the confirmation date',()=>{
    const event=seed.events.find(e=>e.id==='2090964822422949999');
    assert.equal(event.date,'2026-08-22');assert.equal(event.basis,'confirmation');
    assert.ok(event.postIds.includes('2090766694897619318'));
    assert.ok(event.postIds.includes('2090964822422949999'));
    assert.equal(seed.events.filter(e=>e.postIds.includes('2090766694897619318')).length,1);
});

test('existing database snapshots receive archive updates idempotently without faking collection health',()=>{
    const old={posts:[{...post('2076735790567338203'),resetType:'regular',provenance:'history'}],events:[],checkedAt:'2026-09-22T10:00:00Z',historyCheckedAt:null,coverageStart:null,replyCoverageStart:'2026-09-07T00:00:00Z',error:null};
    const migrated=reconcileArchive(old);
    assert.equal(migrated.posts.find(p=>p.id==='2076735790567338203').resetType,'banked');
    assert.equal(migrated.checkedAt,old.checkedAt);
    assert.equal(migrated.replyCoverageStart,'2026-08-10T13:01:17.000Z');
    assert.deepEqual(reconcileArchive(migrated),migrated);
    assert.equal(applyCorrections(old.posts)[0].resetType,'banked');
});

test('new banked delivery language confirms, while promises and hypothetical delivery do not',()=>{
    for(const text of ['We have added a banked reset to everyone.','Added a banked reset to 500k users. Tomorrow we will do another.','The banked reset has landed.','Reset has been propagated to accounts.',"I've reset usage limits."]){
        assert.equal(classify(raw(text)).category,'confirmed',text);
    }
    for(const text of ['We will add a banked reset tomorrow.','A usage reset is landing in the next hour.','We might have reset other rate limits.','We have not added a banked reset.','If we have added a banked reset, you will see it.']){
        assert.notEqual(classify(raw(text)).category,'confirmed',text);
    }
});

test('quoted banked requests cannot turn an explicit full reset into a banked grant',()=>{
    const p=classify(raw('We have reset usage limits.',{quote:raw('A banked reset too maybe?')}));
    assert.equal(p.resetType,'regular');
    const balance=post('2071381664853319742');
    assert.equal(classify(raw(balance.text)).resetType,'regular');
    const archive=JSON.parse(readFileSync('data/archive.json','utf8'));
    assert.equal(new Set(archive.posts.map(p=>p.id)).size,archive.posts.length);
    assert.ok(deriveEvents(archive.posts).every(e=>e.postIds.length>0));
});
