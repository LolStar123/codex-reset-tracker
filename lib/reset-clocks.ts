import type { Post } from './types';

export function lastReset(posts: Post[]) {
    return posts.filter(p => p.category === 'confirmed' || p.eventBasis === 'announcement').sort((a,b) => b.at.localeCompare(a.at))[0];
}

export function latestResetUpdate(posts: Post[]) {
    return posts.filter(p => ['confirmed','scheduled','correction'].includes(p.category) || p.eventBasis === 'announcement')
        .sort((a,b) => b.at.localeCompare(a.at))[0];
}

export function lastResetOfType(posts: Post[], kind: 'regular' | 'banked') {
    return posts.filter(p => p.category === 'confirmed' &&
        (p.resetType === kind || p.resetType === 'both' || kind === 'regular' && !p.resetType))
        .sort((a,b) => b.at.localeCompare(a.at))[0];
}

export function elapsedParts(at: string, now: number) {
    const seconds = Math.max(0, Math.floor((now - Date.parse(at)) / 1000));
    return { days: Math.floor(seconds / 86400), hours: Math.floor(seconds % 86400 / 3600), minutes: Math.floor(seconds % 3600 / 60), seconds: seconds % 60 };
}
