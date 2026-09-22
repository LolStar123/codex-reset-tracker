'use client';
import { useEffect, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

function TypedLine({text}:{text:string}) {
    const [length,setLength]=useState(0);
    useEffect(()=>{
        let frame=0;
        const started=performance.now();
        const media=matchMedia('(prefers-reduced-motion: reduce)');
        const tick=()=>{
            const count=media.matches?text.length:Math.min(text.length,Math.floor((performance.now()-started)/24));
            setLength(count);
            if(count<text.length)frame=requestAnimationFrame(tick);
        };
        frame=requestAnimationFrame(tick);
        return()=>cancelAnimationFrame(frame);
    },[text]);
    return <><span className="sr-only">{text}</span><span aria-hidden="true">{text.slice(0,length)}<span className="brief-cursor">_</span></span></>;
}

export function ResetBrief({text,url}:{text:string;url?:string}) {
    return <div className="reset-brief" aria-label="Reset outlook">
        <p aria-live="polite"><TypedLine key={text} text={text}/></p>
        {url&&<a href={url} target="_blank" rel="noreferrer" className="brief-source" aria-label="Source for reset outlook"><ArrowUpRight size={14}/></a>}
    </div>;
}
