import test from 'node:test';
import assert from 'node:assert/strict';
import { resetBrief } from '../lib/reset-brief.ts';
import { lastReset } from '../lib/reset-clocks.ts';

const at='2026-09-22T06:00:00.000Z';
const now=Date.parse('2026-09-22T08:10:00Z');
const promise={id:'promise',category:'scheduled',resetType:'regular',at,text:'I promised a reset for Tuesday.',url:'https://x.com/thsottiaux/status/promise'};
test('weekday promises give no invented hourly countdown and expire honestly',()=>{
 assert.equal(resetBrief([promise],now).text,'reset expected tuesday');
 assert.equal(resetBrief([promise],Date.parse('2026-09-23T12:00:00Z')).text,'awaiting reset confirmation');
 assert.equal(resetBrief([],now).text,'next reset undetermined');
});
test('explicit hourly window counts down, never becomes confirmation',()=>{
 const timed={...promise,text:'We will reset within 4 hours.'};
 assert.equal(resetBrief([timed],now).text,'reset expected within 2h');
 assert.equal(resetBrief([timed],now+4*3600000).text,'awaiting reset confirmation');
});
test('single clock selects the newest confirmation of any type, ignores promises',()=>{
 const full={...promise,id:'full',category:'confirmed',at:'2026-09-20T12:00:00Z'};
 const bank={...full,id:'bank',resetType:'banked',at:'2026-09-21T12:00:00Z'};
 assert.equal(lastReset([promise,full,bank]).id,'bank');
 assert.equal(lastReset([promise]),undefined);
});
test('banked delivery does not erase a pending full reset, full delivery does',()=>{
 const bank={...promise,id:'bank',category:'confirmed',resetType:'banked',at:'2026-09-22T07:00:00Z'};
 assert.match(resetBrief([bank,promise],now).text,/expected tuesday/);
 assert.equal(resetBrief([{...bank,resetType:'regular'},promise],now).text,'next reset undetermined');
});
test('corrections and collection failure take precedence over optimistic wording',()=>{
 const cancellation={...promise,id:'cancel',category:'correction',at:'2026-09-22T07:00:00Z',text:'The reset is cancelled.'};
 assert.equal(resetBrief([cancellation,promise],now).text,'reset cancelled');
 assert.match(resetBrief([promise],now,true).text,/source check delayed/);
});
