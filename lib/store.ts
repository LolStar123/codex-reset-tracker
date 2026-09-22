import { env } from 'cloudflare:workers';
import { seedSnapshot } from './seed';
import { collectTimeline, getJson } from './collector';
import { deriveEvents, clean } from './classify';
import type { Post, Snapshot } from './types';
import { applyCorrections } from './overrides';
type HistoryResponse = {code?:number;data:{id:string;source:{url:string;author?:string};announced_at:string;text:string;reset_type:Post['resetType']}[];meta:{generated_at:string}};

let active:Promise<void>|null=null;
export async function readMonitorPage() { const snapshot=await readMonitor(); return {snapshot,renderedAt:Date.now()}; }
function database() { if(!env.DB)throw Error('Monitor database unavailable');return env.DB; }
export async function readMonitor(refresh=true):Promise<Snapshot> {
    const seed=seedSnapshot();
    try {
        const db=database();
        let state=await db.prepare('SELECT value FROM monitor_state WHERE key = ?').bind('snapshot').first<{value:string}>();
        if(!state) {
            await persist(seed);
            state={value:JSON.stringify(seed)};
        }
        const snapshot:Snapshot=JSON.parse(state.value);
        snapshot.posts=applyCorrections(snapshot.posts);snapshot.events=deriveEvents(snapshot.posts);
        // A failed upstream call backs off; healthy collectors can check each minute.
        const retryAfter=snapshot.lastAttemptAt&&snapshot.lastAttemptAt!==snapshot.checkedAt?300000:55000;
        if(refresh&&(!snapshot.lastAttemptAt&&!snapshot.checkedAt||Date.now()-Date.parse(snapshot.lastAttemptAt??snapshot.checkedAt??'1970-01-01')>retryAfter)) {
            if(!active)active=syncMonitor(snapshot).finally(()=>{active=null;});
            await active;
            const current=await db.prepare('SELECT value FROM monitor_state WHERE key = ?').bind('snapshot').first<{value:string}>();
            if(current){const next:Snapshot=JSON.parse(current.value);next.posts=applyCorrections(next.posts);next.events=deriveEvents(next.posts);return next;}
        }
        return snapshot;
    } catch(error) {console.error('Monitor read:',String(error));return {...seed,error:'Live data is unavailable. Showing the last bundled collection.'};}
}
async function persist(snapshot:Snapshot) {
    const db=database();
    const statements=snapshot.posts.map(p=>db.prepare('INSERT INTO posts (id, published_at, category, value) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET published_at=excluded.published_at, category=excluded.category, value=excluded.value').bind(p.id,p.at,p.category,JSON.stringify(p)));
    statements.push(db.prepare('DELETE FROM reset_events'));
    statements.push(...snapshot.events.map(e=>db.prepare('INSERT INTO reset_events (id,event_date,value) VALUES (?,?,?)').bind(e.id,e.date,JSON.stringify(e))));
    statements.push(db.prepare('INSERT INTO monitor_state (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').bind('snapshot',JSON.stringify(snapshot)));
    await db.batch(statements);
}
export async function syncMonitor(previous?:Snapshot) {
    const db=database();const before=previous??await readMonitor(false);const started=new Date().toISOString();
    // Database lease prevents concurrent collectors in separate Worker isolates.
    const leaseValue=String(Date.now()+180000);
    const lease=await db.prepare('INSERT INTO monitor_state (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value WHERE CAST(monitor_state.value AS INTEGER) < ?').bind('lease',leaseValue,Date.now()).run();
    if(!lease.meta.changes)return;
    try {
        const newest=await collectTimeline(before.checkedAt,3);
        const backlog=before.pendingCursor?await collectTimeline(before.catchupBoundary??before.checkedAt,3,before.pendingCursor):null;
        const timeline={...newest,posts:[...newest.posts,...(backlog?.posts??[])],raw:[...newest.raw,...(backlog?.raw??[])]};
        const pending=backlog&&!backlog.caughtUp?backlog.cursor:!newest.caughtUp?newest.cursor:null;
        const uniqueRaw=[...new Map(timeline.raw.map(p=>[p.id,p])).values()];
        for(let i=0;i<uniqueRaw.length;i+=50)await db.batch(uniqueRaw.slice(i,i+50).map(p=>db.prepare('INSERT INTO raw_posts (id,author,value,collected_at) VALUES (?,?,?,?) ON CONFLICT(id) DO UPDATE SET value=excluded.value,collected_at=excluded.collected_at').bind(p.id,p.author.screen_name,JSON.stringify(p),started)));
        const posts=new Map(before.posts.map(p=>[p.id,p]));
        for(const p of timeline.posts){const old=posts.get(p.id);posts.set(p.id,old?.provenance==='history'?{...p,category:old.category,resetType:old.resetType}:p);}
        let historyTime=before.historyCheckedAt;let historyError=false;
        try {
            const history=await getJson<HistoryResponse>('https://codex-resets.com/api/v1/resets?limit=100');
            for(const r of history.data) {
                const id=r.source.url.match(/status\/(\d+)/)?.[1]??r.id;
                const existing=posts.get(id);
                if(!existing)posts.set(id,{id,author:r.source.author??'thsottiaux',at:r.announced_at,text:r.text,url:r.source.url,summary:clean(r.text).slice(0,240),category:'confirmed',resetType:r.reset_type,provenance:'history'});
            }
            historyTime=history.meta.generated_at;
        }catch{historyError=true;}
        const ordered=[...posts.values()].sort((a,b)=>b.at.localeCompare(a.at));
        const snapshot:Snapshot={posts:ordered,events:deriveEvents(ordered),checkedAt:started,lastAttemptAt:started,historyCheckedAt:historyTime,coverageStart:ordered.at(-1)?.at??before.coverageStart,replyCoverageStart:[before.replyCoverageStart,timeline.oldest,backlog?.oldest].filter((v):v is string=>!!v).sort()[0]??null,error:historyError?'Historical source unavailable':pending?'Reply catch-up in progress':null,pendingCursor:pending,catchupBoundary:pending?before.catchupBoundary??before.checkedAt:null};
        await persist(snapshot);
        await db.prepare('INSERT INTO collection_runs (started_at,finished_at,status,post_count,error) VALUES (?,?,?,?,?)').bind(started,new Date().toISOString(),snapshot.error?'partial':'ok',timeline.posts.length,snapshot.error).run();
    }catch(error) {
        const message=String(error).slice(0,250);
        await persist({...before,error:message,lastAttemptAt:started});
        await db.prepare('INSERT INTO collection_runs (started_at,finished_at,status,post_count,error) VALUES (?,?,?,?,?)').bind(started,new Date().toISOString(),'failed',0,message).run();
    }finally{await db.prepare('DELETE FROM monitor_state WHERE key = ? AND value = ?').bind('lease',leaseValue).run();}
}
