import type { Category, Post, ResetEvent } from './types';

export type RawPost = {
    id: string; text: string; url: string; created_at: string; created_timestamp?: number;
    author: {screen_name: string}; replying_to?: {status: string; screen_name: string; url?: string} | null;
    quote?: RawPost; reposted_by?: unknown;
};
export function clean(text:string) { return text.replace(/https:\/\/t\.co\/\S+/g,'').replace(/^(?:@[\w]+\s*)+/,'').trim(); }
const resetWord = /\bresets?\b|\bresetting\b|\breseting\b|\bbanked\b/i;
const delivery = /\b(?:have|has|had|just) (?:now )?reset\b|\b(?:limits|usage) (?:have been |has been |are |is )?reset\b|\ball reset\b|reset (?:all )?propagated|\breset (?:is )?(?:done|complete|applied)\b|\bbutton pressed\b/i;
const future = /\b(?:will|going to|promis\w*|incoming|coming|tomorrow|tonight|later|next hour|next few hours|lands?|landing|tuesday|monday|wednesday|thursday|friday|saturday|sunday)\b/i;
const denials = /\b(?:no|not|never|isn't|isn’t|wasn't|wasn’t|hasn't|hasn’t|haven't|haven’t|didn't|didn’t|won't|won’t)\b/i;

export function classify(raw:RawPost, parent?:RawPost):Post|null {
    if(raw.author?.screen_name.toLowerCase()!=='thsottiaux' || raw.reposted_by) return null;
    const text=clean(raw.text), context=clean(parent?.text??raw.quote?.text??'');
    if(!text) return null;
    const direct=resetWord.test(text), contextual=resetWord.test(context);
    const tokenHint=/\bburn (?:those |your )?tokens\b/i.test(text) && /\b(?:drop|reset|usage|left)\b/i.test(context);
    const usageClarification=/\b(?:limits?|usage|credits?|consum\w*)\b/i.test(text) && /\b(?:limits?|usage|reset|banked)\b/i.test(context);
    const contextualAnswer=contextual && (/\b(?:tomorrow|tonight|later|coming|tuesday|monday|wednesday|thursday|friday|saturday|sunday|yes|no|done|soon|everyone|all plans|plus|pro|banked|schedule|applied|delayed|cancelled)\b/i.test(text));
    const unrelatedAside=/neck tattoos|filmed this weekend|love this community|most folks have been very nice/i.test(text);
    if(unrelatedAside || (!direct&&!tokenHint&&!usageClarification&&!contextualAnswer&&!contextual)) return null;
    // Replies containing no new reset information do not inherit the parent's claim.
    let category:Category='hint';
    if(/\b(?:cancelled|canceled|postponed|delayed|not happening|no reset|won't (?:be )?reset|will not reset|correction)\b/i.test(text)) category='correction';
    else if((direct||contextual) && (delivery.test(text) || contextual && /^(?:yes[,.!]?\s*)?(?:done|it is done|it's done|it’s done)[.!]?$/i.test(text)) && !denials.test(text.split(/[.!?]/)[0])) category='confirmed';
    else if((direct||contextual) && future.test(text) && /\b(?:will|promis\w*|coming|lands?|landing|tomorrow|tonight|tuesday|monday|wednesday|thursday|friday|saturday|sunday)\b/i.test(text) && !/\b(?:might|maybe|perhaps|hope|wish|could|would|not|no)\b/i.test(text)) category='scheduled';
    else if(usageClarification || /\b(?:schedule|eligible|expiry|expire|affected|applying|applied|another one|only|credits)\b/i.test(text)) category='clarification';
    const banked=/\bbanked|reset bank\b/i.test(text);
    const both=banked&&/\b(?:full reset|hard reset|double reset|also.*reset|not only)\b/i.test(text);
    const scopeMatch=text.match(/\ball (?:paid (?:users|plans|subscriptions)|users|accounts)|\b(?:Plus,? Pro and Business|plus (?:and|&) pro)\b/i);
    const weekday=text.match(/\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b/i)?.[0];
    const timing=category==='scheduled' ? weekday ? `${weekday[0].toUpperCase()+weekday.slice(1).toLowerCase()}. Reset incoming.` : /tomorrow/i.test(text)?'Reset expected tomorrow':/tonight/i.test(text)?'Reset expected tonight':undefined : undefined;
    // Summaries are source excerpts, not model-written claims. Context remains one click away.
    let summary=text;
    if(category==='scheduled' && /promised a reset for/i.test(text)) summary='A reset is promised for '+(weekday??'the announced day')+'. No exact time has been confirmed.';
    if(text.length>210) {
        const sentences=text.split(/(?<=[.!?])\s+|\n+/).filter(Boolean);
        const relevant=sentences.filter(s=>resetWord.test(s));
        summary=(relevant[0]??sentences[0]??text).slice(0,260);
        if(summary.length===260) summary=summary.slice(0,summary.lastIndexOf(' '))+'…';
    }
    return {id:raw.id,author:raw.author.screen_name,text:raw.text,url:raw.url,at:new Date(raw.created_timestamp?raw.created_timestamp*1000:raw.created_at).toISOString(),
        parentId:raw.replying_to?.status,parent:parent?{author:parent.author.screen_name,text:parent.text,url:parent.url}:raw.quote?{author:raw.quote.author.screen_name,text:raw.quote.text,url:raw.quote.url}:undefined,
        parentMissing:!!raw.replying_to&&!parent,category,summary,resetType:both?'both':banked?'banked':'regular',scope:scopeMatch?.[0],timing,provenance:'direct'};
}

export function deriveEvents(posts:Post[]):ResetEvent[] {
    const events:ResetEvent[]=[];
    for(const p of [...posts].sort((a,b)=>a.at.localeCompare(b.at))) {
        if(p.category!=='confirmed') continue;
        const date=p.at.slice(0,10);
        // Same-day same-type confirmations describe one reset unless separately identified.
        const existing=events.find(e=>e.date===date && (e.type===p.resetType || e.type==='both' || p.resetType==='both'));
        if(existing){existing.postIds.push(p.id);if(p.resetType==='both')existing.type='both';}
        else events.push({id:p.eventId??p.id,date,type:p.resetType??'regular',postIds:[p.id],basis:p.provenance==='history'?'announcement':'confirmation'});
    }
    return events;
}
