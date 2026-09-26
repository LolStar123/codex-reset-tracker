import archive from '@/data/archive.json';
import {applyCorrections} from './overrides';
import {deriveEvents,reclassifyStoredPost} from './classify';
import type {Post,Snapshot} from './types';

// Reconcile bundled research into an already populated database as well as a fresh install.
// Never move the live check timestamp or imply that targeted July lookups cover all replies.
export function reconcileArchive(snapshot:Snapshot):Snapshot {
    const posts=new Map(snapshot.posts.map(p=>[p.id,p]));
    for(const post of archive.posts as Post[]) {
        const existing=posts.get(post.id);
        if(!existing||existing.provenance==='history')posts.set(post.id,post);
        else if(post.eventId)posts.set(post.id,{...existing,eventId:post.eventId});
    }
    const ordered=applyCorrections([...posts.values()].map(reclassifyStoredPost)).sort((a,b)=>b.at.localeCompare(a.at));
    return {...snapshot,posts:ordered,events:deriveEvents(ordered),
        coverageStart:ordered.at(-1)?.at??snapshot.coverageStart,
        replyCoverageStart:[snapshot.replyCoverageStart,archive.timelineCoverageStart].filter((v):v is string=>!!v).sort()[0]??null};
}
