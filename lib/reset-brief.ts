import type { Post } from './types';

const DAY=86400000;
const weekdays=['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
const kinds=(post:Post)=>post.resetType==='both'?['regular','banked']:[post.resetType??'regular'];

// A short source-based brief. Only an explicit relative deadline can produce hours.
export function resetBrief(posts:Post[],now:number,stale=false):{text:string;url?:string} {
    if(stale)return {text:'source check delayed'};
    const ordered=[...posts].sort((a,b)=>b.at.localeCompare(a.at));
    const pending=ordered.find(p=>(p.category==='scheduled'||p.category==='correction')&&!kinds(p).every(kind=>ordered.some(c=>c.category==='confirmed'&&c.at>=p.at&&kinds(c).includes(kind))));
    if(!pending)return {text:'next reset undetermined'};
    const correction=pending.category==='correction';
    const wording=pending.text.toLowerCase();
    // A replacement date belongs to the correction, never to its older parent.
    const replacement=wording.match(/\b(?:delayed|postponed|moved|rescheduled|pushed(?: back)?)\b[^.!?]*?\b(?:to|until|for)\s+([^.!?]+)/)?.[1];
    if(correction&&!replacement&&/\b(?:cancelled|canceled|not happening|no reset|won.t|will not)\b/.test(wording))return {text:'reset cancelled',url:pending.url};
    if(correction&&/\b(?:might|maybe|perhaps|hope|possibly|could)\b/.test(wording))return {text:'reset timing undetermined',url:pending.url};
    const text=replacement??wording;
    const at=Date.parse(pending.at);
    const subject=pending.resetType==='banked'?'banked reset':'reset';
    if(pending.eventBasis==='announcement')return {text:'awaiting rollout confirmation',url:pending.url};
    const hours=text.match(/\b(?:within|in(?: the)? next)\s+(\d+(?:\.\d+)?)\s+hours?\b/);
    if(hours) {
        const left=at+Number(hours[1])*3600000-now;
        return {text:left>0?`${subject} expected within ${Math.ceil(left/3600000)}h`:'awaiting reset confirmation',url:pending.url};
    }
    const sourceDay=new Date(at);sourceDay.setUTCHours(0,0,0,0);
    const mentionedDays=[...text.matchAll(/\b(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/g)];
    const weekday=weekdays.indexOf(mentionedDays.at(-1)?.[1]??'');
    const offset=/\btomorrow\b/.test(text)?1:/\b(?:today|tonight)\b/.test(text)?0:weekday>=0?(weekday-sourceDay.getUTCDay()+7)%7:null;
    if(offset!==null) {
        const date=sourceDay.getTime()+offset*DAY;
        if(now>=date+DAY)return {text:'awaiting reset confirmation',url:pending.url};
        const day=weekdays[new Date(date).getUTCDay()];
        return {text:`${subject} expected ${day}`,url:pending.url};
    }
    if(now-at>7*DAY)return {text:'awaiting reset confirmation',url:pending.url};
    return {text:correction?'reset timing undetermined':`${subject} expected, timing undetermined`,url:pending.url};
}
