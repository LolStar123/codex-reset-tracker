'use client';
import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Layers, RotateCcw } from 'lucide-react';
import { elapsedParts, lastResetOfType } from '@/lib/reset-clocks';
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
    const full=useMemo(()=>lastResetOfType(posts,'regular'),[posts]);
    const banked=useMemo(()=>lastResetOfType(posts,'banked'),[posts]);
    return <div className="reset-clocks" aria-label="Separate reset clocks">
        {[{kind:'regular',label:'Last full reset',post:full,Icon:RotateCcw},{kind:'banked',label:'Last banked reset',post:banked,Icon:Layers}].map(({kind,label,post,Icon})=>{
            const e=post?elapsedParts(post.at,now):null;
            return <div className={`reset-clock ${kind}`} key={kind}>
                <div className="clock-label"><Icon size={16}/>{label}<span>since source confirmation</span></div>
                <div className="clock-digits" role="timer" aria-live="off" aria-label={e?`${e.days} days ${e.hours} hours ${e.minutes} minutes ${e.seconds} seconds ago`:'No confirmation available'}>
                    {e?<><span className="clock-days">{e.days}<small>d</small></span><span className="clock-time">{String(e.hours).padStart(2,'0')}<i>:</i>{String(e.minutes).padStart(2,'0')}<i>:</i><span className="clock-seconds">{String(e.seconds).padStart(2,'0')}</span></span></>:'Not recorded'}
                </div>
                {post?<a href={post.url} target="_blank" rel="noreferrer" className="clock-source"><span>{new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(post.at))}</span><span>{post.at.slice(11,19)} UTC<ArrowUpRight size={13}/></span></a>:<span className="clock-source">No banked reset confirmed yet</span>}
            </div>;
        })}
    </div>;
}
