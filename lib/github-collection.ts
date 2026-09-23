import { collectTimeline, getJson } from './collector';
import { clean } from './classify';
import { reconcileArchive } from './archive';
import type { Post, Snapshot } from './types';

type History = {code?:number;data:{id:string;source:{url:string;author?:string};announced_at:string;text:string;reset_type:Post['resetType']}[];meta:{generated_at:string}};
const defaults = { timeline: collectTimeline, history: () => getJson<History>('https://codex-resets.com/api/v1/resets?limit=100') };
type Sources = {timeline:typeof collectTimeline;history?:()=>Promise<History>};

export async function collectSnapshot(before: Snapshot, sources:Sources = defaults, started = new Date().toISOString()) {
    const issues: string[] = [];
    try {
        const newest = await sources.timeline(before.checkedAt, 3);
        let backlog: Awaited<ReturnType<typeof collectTimeline>> | null = null;
        let backlogFailed = false;
        if (before.pendingCursor || before.catchupBoundary) {
            try { backlog = await sources.timeline(before.catchupBoundary ?? before.checkedAt, 3, before.pendingCursor); }
            catch { backlogFailed = true; issues.push('Older replies temporarily unavailable; retrying catch-up'); }
        }
        const posts = new Map(before.posts.map(p => [p.id, p]));
        // Latest lookup wins if a post is also in the historical page.
        for (const p of [...(backlog?.posts ?? []), ...newest.posts]) {
            const old = posts.get(p.id);
            posts.set(p.id, {...p, eventId: old?.eventId??p.eventId, eventBasis: p.eventBasis??(p.category==='confirmed'?'confirmation':old?.eventBasis)});
        }
        let historyCheckedAt = before.historyCheckedAt;
        let historyError: string | null = before.historyError??null;
        if(sources.history)try {
            const history = await sources.history();
            if (!Array.isArray(history.data)) throw Error('Invalid history response');
            for (const r of history.data) {
                const id = r.source.url.match(/status\/(\d+)/)?.[1] ?? r.id;
                if (!posts.has(id)) posts.set(id, {id,author:r.source.author ?? 'thsottiaux',at:r.announced_at,text:r.text,url:r.source.url,summary:clean(r.text).slice(0,240),category:'confirmed',resetType:r.reset_type,provenance:'history'});
            }
            historyCheckedAt = history.meta.generated_at;
            historyError = null;
        } catch (error) { historyError = `Historical source unavailable: ${String(error).slice(0,150)}`; }
        const pendingCursor = backlogFailed ? null : backlog && !backlog.caughtUp ? backlog.cursor : !newest.caughtUp ? newest.cursor : null;
        const catchupBoundary = backlogFailed || pendingCursor ? before.catchupBoundary ?? before.checkedAt : null;
        if (pendingCursor) issues.push('Reply catch-up in progress');
        const snapshot = reconcileArchive({...before, posts:[...posts.values()], checkedAt:started,lastAttemptAt:started,historyCheckedAt,historyError,
            replyCoverageStart:[before.replyCoverageStart,newest.oldest,backlog?.oldest].filter((v):v is string => !!v).sort()[0] ?? null,
            pendingCursor,catchupBoundary,error:issues.length ? issues.join('; ') : null});
        return {snapshot,raw:[...newest.raw,...(backlog?.raw ?? [])],status:issues.length || historyError ? 'partial' : 'ok'};
    } catch (error) {
        return {snapshot:{...before,lastAttemptAt:started,error:String(error).slice(0,250)},raw:[],status:'failed'};
    }
}
