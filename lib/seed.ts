import history from '@/data/history.json';
import timeline from '@/data/timeline.json';
import { classify, clean, deriveEvents, type RawPost } from './classify';
import type { Post, Snapshot } from './types';

export function seedSnapshot():Snapshot {
    const posts=new Map<string,Post>();
    for(const r of history.data) {
        const id=r.source.url.match(/status\/(\d+)/)?.[1]??r.id;
        const text=clean(r.text);
        posts.set(id,{id,author:'thsottiaux',url:r.source.url,at:r.announced_at,text:r.text,summary:text.length>240?text.slice(0,237)+'…':text,category:'confirmed',resetType:r.reset_type as Post['resetType'],provenance:'history'});
    }
    const raw=timeline.posts as RawPost[];
    const byId=new Map(raw.map(p=>[p.id,p]));
    for(const r of raw){const p=classify(r,r.replying_to?byId.get(r.replying_to.status):undefined);if(p){const old=posts.get(p.id);posts.set(p.id,old?{...p,category:old.category,resetType:old.resetType}:p);}}
    const ordered=[...posts.values()].sort((a,b)=>b.at.localeCompare(a.at));
    return {posts:ordered,events:deriveEvents(ordered),checkedAt:timeline.fetchedAt,historyCheckedAt:history.meta.generated_at,coverageStart:ordered.at(-1)?.at??null,replyCoverageStart:raw.filter(p=>p.author.screen_name==='thsottiaux').map(p=>new Date(p.created_at).toISOString()).sort()[0]??null,error:null};
}
