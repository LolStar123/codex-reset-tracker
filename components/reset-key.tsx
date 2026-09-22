'use client';
import { motion, useReducedMotion, type HTMLMotionProps } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { RotateCcw, ArrowDownLeft, Volume2, VolumeX } from 'lucide-react';
import { playKeyThock } from '@/lib/key-sound';

export function BounceButton(props: HTMLMotionProps<'button'>) {
    const reduce = useReducedMotion();
    return <motion.button type="button" tabIndex={0} initial={false}
        whileHover={reduce ? undefined : { y: -3, scale: 1.04 }}
        whileTap={reduce ? undefined : { y: 2, scale: .94 }}
        transition={{ type: 'spring', stiffness: 450, damping: 18 }} {...props}/>;
}

export function ResetKey({ checking, failed, onCheck }: { checking: boolean; failed: boolean; onCheck: () => void }) {
    const reduce = useReducedMotion();
    const [pressed,setPressed]=useState(false);
    const [muted,setMuted]=useState(false);
    const started=useRef(0);
    const releaseTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
    useEffect(()=>{
        const frame=requestAnimationFrame(()=>setMuted(localStorage.getItem('reset-monitor-muted')==='true'));
        return()=>{cancelAnimationFrame(frame);if(releaseTimer.current)clearTimeout(releaseTimer.current);};
    },[]);
    function press() {
        if(checking)return;
        if(releaseTimer.current)clearTimeout(releaseTimer.current);
        started.current=performance.now();setPressed(true);
        if(!muted)playKeyThock();
    }
    function release() {
        if(releaseTimer.current)clearTimeout(releaseTimer.current);
        releaseTimer.current=setTimeout(()=>setPressed(false),Math.max(0,110-(performance.now()-started.current)));
    }
    function toggleSound() {setMuted(!muted);localStorage.setItem('reset-monitor-muted',String(!muted));}
    return <div className={`reset-toy ${checking ? 'is-checking' : ''} ${pressed?'is-pressed':''}`}>
        <img className="tibo-key-buddy" src="/images/tibo-chibi.webp" alt="Chibi Tibo with his laptop" width={400} height={600}/>
        <div className="key-orbit" aria-hidden="true"><i/><i/><i/><i/></div>
        <div className="key-shadow" aria-hidden="true"/>
        <div className="key-float"><div className="key-housing">
            <motion.button className="reset-key" tabIndex={0} initial={false} onClick={()=>{release();onCheck();}} disabled={checking}
                data-pressed={pressed}
                onPointerDown={event=>{if(event.button===0){event.currentTarget.setPointerCapture(event.pointerId);press();}}}
                onPointerUp={release} onPointerCancel={release} onBlur={release}
                onKeyDown={event=>{if((event.key===' '||event.key==='Enter')&&!event.repeat)press();}}
                onKeyUp={event=>{if(event.key===' '||event.key==='Enter')release();}}
                aria-label="Check for new resets" aria-busy={checking}
                animate={{y:!reduce&&pressed?17:0}}
                whileHover={reduce||pressed ? undefined : { y: -2 }}
                transition={pressed?{duration:.065,ease:'easeOut'}:{type:'spring',stiffness:520,damping:24,mass:.75}}>
                <span className="key-face"><span className="key-code">&gt;_</span><RotateCcw className={checking ? 'spinning' : ''} size={66} strokeWidth={1.5}/><span className="key-label">check<span>↵</span></span></span>
            </motion.button>
        </div></div>
        <span className="key-note"><ArrowDownLeft size={25}/>{checking ? 'checking the replies…' : failed ? 'try that again' : 'give it a press'}</span>
        <BounceButton className="key-sound-toggle" onClick={toggleSound} aria-label={muted?'Enable key sound':'Mute key sound'} aria-pressed={!muted}>{muted?<VolumeX size={15}/>:<Volume2 size={15}/>}</BounceButton>
    </div>;
}
