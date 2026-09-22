import type { Post } from './types';

export function lastResetOfType(posts: Post[], kind: 'regular' | 'banked') {
    return posts.filter(p => p.category === 'confirmed' &&
        (p.resetType === kind || p.resetType === 'both' || kind === 'regular' && !p.resetType))
        .sort((a,b) => b.at.localeCompare(a.at))[0];
}

export function elapsedParts(at: string, now: number) {
    const minutes = Math.max(0, Math.floor((now - Date.parse(at)) / 60000));
    return { days: Math.floor(minutes / 1440), hours: Math.floor(minutes % 1440 / 60), minutes: minutes % 60 };
}
