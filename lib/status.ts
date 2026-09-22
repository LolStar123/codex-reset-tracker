import type { Post } from './types';

// A time window is only used to expire a promise, never as a claimed execution time.
export function awaitingConfirmation(post:Post,now:number):boolean {
    if(post.category!=='scheduled')return false;
    const at=Date.parse(post.at);
    const text=post.text.toLowerCase();
    if(/next (?:hour|few hours)|tonight|today/.test(text)) return now-at>48*3600000;
    if(/tomorrow/.test(text))return now-at>72*3600000;
    const names=['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    const day=names.findIndex(d=>text.includes(d));
    if(day>=0) {
        const sourceDay=new Date(at).getUTCDay();
        const distance=(day-sourceDay+7)%7;
        // Give ambiguous author timezone wording a full extra day before expiring.
        return now-at>(distance+2)*86400000;
    }
    return now-at>7*86400000;
}
