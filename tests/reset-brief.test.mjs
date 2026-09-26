import test from 'node:test';
import assert from 'node:assert/strict';
import { resetBrief } from '../lib/reset-brief.ts';
import { lastReset } from '../lib/reset-clocks.ts';
import { classify } from '../lib/classify.ts';

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

test('a new delay reply replaces the old date and retains its own source',()=>{
 const parent={id:'parent',text:'The Codex reset is coming Tuesday.',url:promise.url,created_at:at,author:{screen_name:'thsottiaux'}};
 const delay=classify({id:'delay',text:'It is delayed until tomorrow.',url:'https://x.com/thsottiaux/status/delay',created_at:'2026-09-22T08:00:00Z',author:{screen_name:'thsottiaux'},replying_to:{status:'parent'}},parent);
 assert.equal(delay.category,'correction');
 assert.deepEqual(resetBrief([delay,promise],now),{text:'reset expected wednesday',url:delay.url});
 assert.equal(resetBrief([delay],now).text,'reset expected wednesday');
 assert.equal(resetBrief([delay,promise],Date.parse('2026-09-23T12:00:00Z')).text,'reset expected wednesday');
 assert.equal(resetBrief([delay,promise],Date.parse('2026-09-24T12:00:00Z')).text,'awaiting reset confirmation');
 const delivered={...delay,id:'done',category:'confirmed',at:'2026-09-23T09:00:00Z'};
 assert.equal(resetBrief([delivered,delay,promise],Date.parse(delivered.at)).text,'next reset undetermined');
});
test('replacement dates, uncertain delays and later cancellations stay distinct',()=>{
 const delay={...promise,id:'delay',category:'correction',at:'2026-09-22T08:00:00Z'};
 assert.equal(resetBrief([{...delay,text:'Reset moved from Tuesday to Wednesday.'},promise],now).text,'reset expected wednesday');
 assert.equal(resetBrief([{...delay,text:'Reset delayed, maybe until tomorrow.'},promise],now).text,'reset timing undetermined');
 assert.equal(resetBrief([{...delay,text:'Reset delayed. No new date yet.'},promise],now).text,'reset timing undetermined');
 const cancelled={...delay,id:'cancel',at:'2026-09-22T08:05:00Z',text:'Reset cancelled.'};
 assert.equal(resetBrief([cancelled,{...delay,text:'Reset delayed until tomorrow.'},promise],now).text,'reset cancelled');
 assert.equal(resetBrief([{...promise,id:'new',at:'2026-09-22T08:09:00Z',text:'Reset coming Thursday.'},cancelled],now).text,'reset expected thursday');
});

test('a contracted future reset promise updates the top outlook',()=>{
 const announcement=classify({
  id:'future-reset',author:{screen_name:'thsottiaux'},created_at:'2026-09-26T00:07:13.000Z',url:'https://x.com/thsottiaux/status/future-reset',
  text:'o yes… we’re back in action and we’ll reset usage limits for all paid users across codex and ChatGPT work'
 });
 assert.equal(announcement.category,'scheduled');
 assert.equal(resetBrief([announcement],Date.parse('2026-09-26T00:08:00Z')).text,'reset expected, timing undetermined');
 assert.equal(lastReset([announcement]),undefined);
});
