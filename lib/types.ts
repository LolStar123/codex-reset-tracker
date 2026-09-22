export type Category = 'confirmed' | 'scheduled' | 'hint' | 'clarification' | 'correction';
export type Post = {
    id: string; author: string; text: string; url: string; at: string;
    parentId?: string; parent?: { author: string; text: string; url: string };
    parentMissing?: boolean; category: Category; summary: string;
    resetType?: 'regular' | 'banked' | 'both'; scope?: string;
    timing?: string; provenance: 'direct' | 'history'; eventId?: string;
};
export type ResetEvent = {
    id: string; date: string; type: 'regular' | 'banked' | 'both';
    postIds: string[]; basis: 'announcement' | 'confirmation';
};
export type Snapshot = {
    posts: Post[]; events: ResetEvent[]; checkedAt: string | null;
    historyCheckedAt: string | null; coverageStart: string | null;
    replyCoverageStart: string | null; error: string | null;
    pendingCursor?: string | null; catchupBoundary?: string | null; lastAttemptAt?: string;
};
