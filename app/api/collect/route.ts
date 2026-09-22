import { readMonitor } from '@/lib/store';

// Sites authenticates this private route. The scheduler credential stays server-side.
export async function POST() {
    const snapshot=await readMonitor();
    const failed=!snapshot.checkedAt || snapshot.lastAttemptAt!==snapshot.checkedAt;
    return Response.json({
        checkedAt:snapshot.checkedAt,
        lastAttemptAt:snapshot.lastAttemptAt??null,
        latestPostAt:snapshot.posts[0]?.at??null,
        postCount:snapshot.posts.length,
        resetCount:snapshot.events.length,
        status:failed?'failed':snapshot.error?'partial':'ok',
        error:snapshot.error,
    },{status:failed?503:200,headers:{'Cache-Control':'private, no-store'}});
}
