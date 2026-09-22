import {test} from 'node:test';
import assert from 'node:assert/strict';
import {lastResetOfType,elapsedParts} from '../lib/reset-clocks.ts';
import {classify} from '../lib/classify.ts';

test('new banked confirmation does not restart the full-reset clock',()=>{
 const full={id:'1',category:'confirmed',resetType:'regular',at:'2026-09-10T08:30:00Z'};
 const bank={id:'2',category:'confirmed',resetType:'banked',at:'2026-09-12T11:40:00Z'};
 const promise={id:'3',category:'scheduled',resetType:'regular',at:'2026-09-22T06:00:00Z'};
 assert.equal(lastResetOfType([promise,bank,full],'regular').id,'1');
 assert.equal(lastResetOfType([promise,bank,full],'banked').id,'2');
 assert.deepEqual(elapsedParts(bank.at,Date.parse('2026-09-13T13:42:00Z')),{days:1,hours:2,minutes:2});
});
test('combined confirmation updates both clocks; absent banked history stays absent',()=>{
 const both={id:'1',category:'confirmed',resetType:'both',at:'2026-09-12T11:40:00Z'};
 assert.equal(lastResetOfType([both],'regular'),both);
 assert.equal(lastResetOfType([both],'banked'),both);
 assert.equal(lastResetOfType([{...both,resetType:'regular'}],'banked'),undefined);
});
test('short banked delivery reply inherits reset type from parent context',()=>{
 const parent={id:'1',text:'Is a banked reset coming?',author:{screen_name:'reader'}};
 const reply={id:'2',text:'Done.',url:'https://x.com/thsottiaux/status/2',created_at:'2026-09-22T08:00:00Z',author:{screen_name:'thsottiaux'},replying_to:{status:'1'}};
 const p=classify(reply,parent);
 assert.equal(p.category,'confirmed');assert.equal(p.resetType,'banked');
});
