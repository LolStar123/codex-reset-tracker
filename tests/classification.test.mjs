import {test} from 'node:test';
import assert from 'node:assert/strict';
import {classify,deriveEvents} from '../lib/classify.ts';
import {awaitingConfirmation} from '../lib/status.ts';

const raw=(text,extra={})=>({id:'100',text,url:'https://x.com/thsottiaux/status/100',created_at:'2026-09-22T04:00:00Z',author:{screen_name:'thsottiaux'},...extra});
const parent=raw('Will Codex usage limits reset tomorrow?',{id:'99',author:{screen_name:'reader'}});
test('keyword-free timing reply retains its parent and is scheduled',()=>{
    const p=classify(raw('Tomorrow.',{replying_to:{status:'99',screen_name:'reader'}}),parent);
    assert.equal(p.category,'scheduled');assert.equal(p.parent.text,parent.text);assert.equal(deriveEvents([p]).length,0);
});
test('done with verified reset context confirms; done without context does not',()=>{
    assert.equal(classify(raw('Done.',{replying_to:{status:'99'}}),parent).category,'confirmed');
    assert.equal(classify(raw('Done.')),null);
});
test('vague and playful replies never confirm a reset',()=>{
    for(const text of ['Soon.','Spidey sense','My condolences','Maybe tomorrow'])assert.notEqual(classify(raw(text),parent).category,'confirmed');
});
test('missing parent is labelled and a hint stays a hint',()=>{
    const p=classify(raw('Maybe a reset tomorrow.',{replying_to:{status:'missing'}}));
    assert.equal(p.parentMissing,true);assert.equal(p.category,'hint');assert.equal(deriveEvents([p]).length,0);
});
test('denied and cancelled resets do not fill the calendar',()=>{
    for(const text of ['No reset tomorrow.','The reset is cancelled.','We have not reset limits.']){
        const p=classify(raw(text));assert.notEqual(p.category,'confirmed');assert.equal(deriveEvents([p]).length,0);
    }
});
test('full and banked together produce one combined calendar event',()=>{
    const p=classify(raw('We have reset usage. A full reset and a banked reset for all users.'));
    assert.equal(p.resetType,'both');assert.equal(deriveEvents([p])[0].type,'both');
});
test('same reset repeated in a confirmation is deduplicated',()=>{
    const a=classify(raw('We have reset usage limits.'));
    const b=classify(raw('Reset all propagated.',{id:'101'}));
    assert.equal(deriveEvents([a,b]).length,1);assert.equal(deriveEvents([a,b])[0].postIds.length,2);
});
test('other authors and unrelated release chatter are excluded',()=>{
    assert.equal(classify(raw('We have reset usage',{author:{screen_name:'other'}})),null);
    assert.equal(classify(raw('We released a new model today')),null);
});
test('a missed promise expires without becoming a confirmed event',()=>{
    const p=classify(raw('I promised a reset for Tuesday.'));
    assert.equal(awaitingConfirmation(p,Date.parse('2026-09-22T20:00:00Z')),false);
    assert.equal(awaitingConfirmation(p,Date.parse('2026-09-25T20:00:00Z')),true);
    assert.equal(deriveEvents([p]).length,0);
});
