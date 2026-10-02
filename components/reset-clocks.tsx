'use client';
import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { elapsedParts, latestResetUpdate } from '@/lib/reset-clocks';
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
    const post=useMemo(()=>latestResetUpdate(posts),[posts]);
    const e=post?elapsedParts(post.at,now):null;
    const announced=post?.eventBasis==='announcement';
    const label=post?.category==='correction'?'Reset timing updated':announced?'Reset announced':post?.category==='scheduled'?'Reset planned':'Reset reported';
    const kind=post?.resetType==='banked'?'banked':post?.resetType==='both'?'full + banked':'full';
    return <div className="reset-clocks" aria-label="Latest reset update">
            <div className="reset-clock">
                <div className="clock-label">{post?<a href={post.url} target="_blank" rel="noreferrer" className="clock-source">{label}<ArrowUpRight size={12}/></a>:'No reset recorded'}</div>
                <div className="clock-digits" role="timer" aria-live="off" aria-label={e?`${e.days} days ${e.hours} hours ${e.minutes} minutes ${e.seconds} seconds ago`:'No confirmation available'}>
                    {e?<><span className="clock-days">{e.days}<small>{e.days===1?'day ago':'days ago'}</small></span><span className="clock-time">{String(e.hours).padStart(2,'0')}<i>:</i>{String(e.minutes).padStart(2,'0')}<i>:</i><span className="clock-seconds">{String(e.seconds).padStart(2,'0')}</span></span></>:'Not recorded'}
                </div>
                {post && <div className="clock-provenance"><span className="clock-kind">{kind} reset</span><time dateTime={post.at}>{new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',timeZone:'UTC'}).format(new Date(post.at))} UTC</time></div>}
            </div>
    </div>;
}
