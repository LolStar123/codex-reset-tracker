'use client';
import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { elapsedParts, lastReset } from '@/lib/reset-clocks';
import type { Post } from '@/lib/types';

export function ResetClocks({ posts, renderedAt }: { posts: Post[]; renderedAt: number }) {
    const [now,setNow]=useState(renderedAt);
    useEffect(()=>{
        const tick=()=>setNow(Date.now());
        const frame=requestAnimationFrame(tick);
        const timer=setInterval(tick,1000);
        const visible=()=>{if(!document.hidden)tick();};
        document.addEventListener('visibilitychange',visible);
        return()=>{cancelAnimationFrame(frame);clearInterval(timer);document.removeEventListener('visibilitychange',visible);};
    },[]);
    const post=useMemo(()=>lastReset(posts),[posts]);
    const e=post?elapsedParts(post.at,now):null;
    const kind=post?.resetType==='banked'?'banked':post?.resetType==='both'?'full + banked':'full';
    return <div className="reset-clocks" aria-label="Latest confirmed reset">
            <div className="reset-clock">
                <div className="clock-label">{post?<a href={post.url} target="_blank" rel="noreferrer" className="clock-source" title={`${kind} reset · ${new Date(post.at).toLocaleString('en-GB',{timeZone:'UTC'})} UTC`}>last reset was<ArrowUpRight size={12}/></a>:'last reset was'}</div>
                <div className="clock-digits" role="timer" aria-live="off" aria-label={e?`${e.days} days ${e.hours} hours ${e.minutes} minutes ${e.seconds} seconds ago`:'No confirmation available'}>
                    {e?<><span className="clock-days">{e.days}<small>{e.days===1?'day ago':'days ago'}</small></span><span className="clock-time">{String(e.hours).padStart(2,'0')}<i>:</i>{String(e.minutes).padStart(2,'0')}<i>:</i><span className="clock-seconds">{String(e.seconds).padStart(2,'0')}</span></span></>:'Not recorded'}
                </div>
            </div>
    </div>;
}
