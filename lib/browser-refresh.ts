import type { Snapshot } from './types';

// Delayed GitHub snapshots must never replace a newer successful source check.
export function newestSnapshot(current:Snapshot,incoming:Snapshot):Snapshot {
    if(!Array.isArray(incoming.posts)||!Array.isArray(incoming.events))throw Error('Invalid monitor response');
    const currentAt=Date.parse(current.lastAttemptAt??current.checkedAt??'1970-01-01');
    const incomingAt=Date.parse(incoming.lastAttemptAt??incoming.checkedAt??'1970-01-01');
    return incomingAt>=currentAt?incoming:current;
}

export async function checkLive(before:Snapshot):Promise<Snapshot> {
    const [{collectSnapshot},{collectTimeline}]=await Promise.all([import('./github-collection'),import('./collector')]);
    // The browser reads the public timeline directly. Shared history stays in GitHub.
    // Do not let the separate history provider's CORS policy block a manual check.
    const result=await collectSnapshot(before,{timeline:collectTimeline});
    if(result.status==='failed')throw Error(result.snapshot.error??'Source check failed');
    return result.snapshot;
}
