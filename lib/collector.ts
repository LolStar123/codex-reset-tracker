import { classify, type RawPost } from './classify';
import type { Post } from './types';

type ProviderEnvelope = { code?: number };
type TimelinePage = ProviderEnvelope & { results: (RawPost | {type:'thread';statuses:RawPost[]})[]; cursor?:{bottom?:string} };
type Lookup = ProviderEnvelope & {status?:RawPost};
export async function getJson<T extends ProviderEnvelope>(url:string):Promise<T> {
    const headers:Record<string,string>={Accept:'application/json'};
    if(typeof window==='undefined')headers['User-Agent']='ResetMonitor/1.0';
    const response=await fetch(url,{headers,cache:'no-store',signal:AbortSignal.timeout(20000)});
    if(response.status===204) return {code:204,results:[]} as unknown as T;
    if(!response.ok) throw new Error(`Source returned ${response.status}`);
    const data=await response.json() as T;
    if(data.code && data.code!==200)throw new Error(`Source returned code ${data.code}`);
    return data;
}
export async function collectTimeline(since:string|null,maxPages=3,startCursor?:string|null):Promise<{posts:Post[];raw:RawPost[];oldest:string|null;caughtUp:boolean;cursor:string|null}> {
    const all=new Map<string,RawPost>();let cursor:string|undefined=startCursor??undefined;let caughtUp=false;
    for(let page=0;page<maxPages;page++) {
        const url=new URL('https://api.fxtwitter.com/2/profile/thsottiaux/statuses');
        url.searchParams.set('count','100');url.searchParams.set('with_replies','true');
        if(cursor)url.searchParams.set('cursor',cursor);
        const data=await getJson<TimelinePage>(url.toString());
        if(!Array.isArray(data.results))throw Error('Timeline response is missing posts');
        const rows:RawPost[]=data.results.flatMap(p=>'statuses' in p?p.statuses:[p]);
        for(const p of rows) if(p.id&&p.text&&p.author?.screen_name)all.set(p.id,p);
        const own=rows.filter(p=>p.author?.screen_name==='thsottiaux');
        const oldest=own.map(p=>Date.parse(p.created_at)).sort((a,b)=>a-b)[0];
        const next=data.cursor?.bottom;
        if(!rows.length||!next||next===cursor||(since&&oldest<=Date.parse(since)-86400000)){caughtUp=true;break;}
        cursor=next;
    }
    // Parent rows often accompany replies. Fetch missing parents before relevance filtering.
    const own=[...all.values()].filter(p=>p.author.screen_name==='thsottiaux'&&!p.reposted_by);
    const missing=[...new Set(own.map(p=>p.replying_to?.status).filter((id):id is string=>!!id&&!all.has(id)))];
    for(let i=0;i<missing.length;i+=4) {
        const results=await Promise.allSettled(missing.slice(i,i+4).map(id=>getJson<Lookup>(`https://api.fxtwitter.com/2/status/${id}`)));
        for(const r of results)if(r.status==='fulfilled'&&r.value.status?.author)all.set(r.value.status.id,r.value.status);
    }
    const posts=own.map(p=>classify(p,p.replying_to?all.get(p.replying_to.status):undefined)).filter((p):p is Post=>!!p);
    return {posts,raw:[...all.values()],oldest:own.map(p=>new Date(p.created_at).toISOString()).sort()[0]??null,caughtUp,cursor:caughtUp?null:cursor??null};
}
