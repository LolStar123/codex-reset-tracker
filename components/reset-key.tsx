'use client';
import { motion, useReducedMotion, type HTMLMotionProps } from 'motion/react';
import { RotateCcw, ArrowDownLeft } from 'lucide-react';

export function BounceButton(props: HTMLMotionProps<'button'>) {
    const reduce = useReducedMotion();
    return <motion.button type="button" tabIndex={0} initial={false}
        whileHover={reduce ? undefined : { y: -3, scale: 1.04 }}
        whileTap={reduce ? undefined : { y: 2, scale: .94 }}
        transition={{ type: 'spring', stiffness: 450, damping: 18 }} {...props}/>;
}

export function ResetKey({ checking, failed, onCheck }: { checking: boolean; failed: boolean; onCheck: () => void }) {
    const reduce = useReducedMotion();
    return <div className={`reset-toy ${checking ? 'is-checking' : ''}`}>
        <div className="key-orbit" aria-hidden="true"><i/><i/><i/><i/></div>
        <div className="key-shadow" aria-hidden="true"/>
        <div className="key-float">
            <motion.button className="reset-key" tabIndex={0} initial={false} onClick={onCheck} disabled={checking}
                aria-label="Check for new resets" aria-busy={checking}
                whileHover={reduce ? undefined : { rotate: -5, y: -9, scale: 1.06 }}
                whileTap={reduce ? undefined : { y: 12, scale: .94, rotate: 1 }}
                transition={{ type: 'spring', stiffness: 320, damping: 14 }}>
                <span className="key-face"><span className="key-code">&gt;_</span><RotateCcw className={checking ? 'spinning' : ''} size={66} strokeWidth={1.5}/><span className="key-label">check<span>↵</span></span></span>
            </motion.button>
        </div>
        <span className="key-note"><ArrowDownLeft size={25}/>{checking ? 'checking the replies…' : failed ? 'try that again' : 'give it a press'}</span>
    </div>;
}
