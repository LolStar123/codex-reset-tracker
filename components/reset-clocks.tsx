'use client';
import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { elapsedParts, latestResetUpdate } from '@/lib/reset-clocks';
import type { Post } from '@/lib/types';

export function ResetClocks({ posts, renderedAt }: { posts: Post[]; renderedAt: number }) {
    const reduce=useReducedMotion();
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
    const label=post?.category==='correction'?'reset updated':announced?'reset announced':post?.category==='scheduled'?'reset incoming':'last reset was';
    const kind=post?.resetType==='banked'?'banked':post?.resetType==='both'?'full + banked':'full';
    return <div className="reset-clocks" aria-label="Latest reset update">
            <div className="reset-clock">
                <div className="clock-label">{post?<a href={post.url} target="_blank" rel="noreferrer" className="clock-source" title={`${kind} reset update · ${new Date(post.at).toLocaleString('en-GB',{timeZone:'UTC'})} UTC`}>{label}<ArrowUpRight size={12}/></a>:'last reset was'}</div>
                <div className="clock-digits" role="timer" aria-live="off" aria-label={e?`${e.days} days ${e.hours} hours ${e.minutes} minutes ${e.seconds} seconds ago`:'No confirmation available'}>
                    {e?<><motion.span className="clock-days" initial={false} animate={{y:0,scale:1,rotate:-1}} whileHover={reduce?undefined:{y:-7,scale:1.045,rotate:1.5}} transition={{type:'spring',stiffness:380,damping:13,mass:.65}}>{e.days}<small>{e.days===1?'day ago':'days ago'}</small></motion.span><span className="clock-time">{String(e.hours).padStart(2,'0')}<i>:</i>{String(e.minutes).padStart(2,'0')}<i>:</i><span className="clock-seconds">{String(e.seconds).padStart(2,'0')}</span></span></>:'Not recorded'}
                </div>
            </div>
    </div>;
}
