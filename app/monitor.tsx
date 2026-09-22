'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { BounceButton, ResetKey } from '@/components/reset-key';
import { ArrowUpRight, ChevronDown, Moon, Sun, Terminal, X, CircleHelp } from 'lucide-react';
import { clean } from '@/lib/classify';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TooltipProvider } from '@/components/ui/tooltip';
import { GitHubActivity, type Contribution } from '@/components/rare-ui/github-activity';
import { ResetClocks } from '@/components/reset-clocks';
import type { Post, Snapshot } from '@/lib/types';
import { resetBrief } from '@/lib/reset-brief';
import { ResetBrief } from '@/components/reset-brief';

const LABELS = { confirmed: 'Reset', scheduled: 'Incoming', hint: 'Trickle', clarification: 'Note', correction: 'Correction' };
const DAY = 86400000;
function dateLabel(value: string, full = false) {
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', ...(full ? { year: 'numeric' } : {}), timeZone: 'UTC' }).format(new Date(value));
}
function relative(value: string, now: number) {
    const m = Math.max(0, Math.floor((now - Date.parse(value)) / 60000));
    return m < 1 ? 'just now' : m < 60 ? `${m}m ago` : m < 1440 ? `${Math.floor(m / 60)}h ago` : `${Math.floor(m / 1440)}d ago`;
}
function PostRow({ post, now }: { post: Post; now: number }) {
    const [expanded, setExpanded] = useState(false);
    const reduce = useReducedMotion();
    return <article className={`post-row ${post.category}${post.parentId?' is-reply':''}`} id={`post-${post.id}`}>
        <div className="post-stamp" aria-hidden="true"><span>{new Date(post.at).getUTCDate().toString().padStart(2,'0')}</span><small>{new Intl.DateTimeFormat('en-GB',{month:'short',timeZone:'UTC'}).format(new Date(post.at))}</small></div>
        <div className="post-main">
            <div className="post-top"><span className={`badge ${post.category}`}>{post.eventBasis==='announcement'?'Announced':LABELS[post.category]}{post.resetType==='banked'?' / banked':post.resetType==='both'?' / full + banked':''}</span><time dateTime={post.at} title={`${dateLabel(post.at,true)} · ${new Date(post.at).toISOString().slice(11,16)} UTC`}>{relative(post.at,now)}</time></div>
            <h3 className={expanded?'post-quote expanded':'post-quote'}>{clean(post.text)}</h3>
            <div className="post-bottom"><BounceButton className="text-button" onClick={() => setExpanded(!expanded)} aria-expanded={expanded} aria-controls={`detail-${post.id}`}>{expanded ? 'Less' : post.parentId ? 'View context' : 'Read post'}<ChevronDown size={13} className={expanded ? 'turned' : ''}/></BounceButton><a href={post.url} target="_blank" rel="noreferrer" className="source-link" aria-label={`Open ${LABELS[post.category].toLowerCase()} on X`}>on X<ArrowUpRight size={14}/></a></div>
            <AnimatePresence initial={false}>{expanded && <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} transition={{duration:reduce?0:.22}} className="post-detail" id={`detail-${post.id}`}>
                {post.parent && <blockquote><span>Replying to @{post.parent.author}</span><p>{post.parent.text}</p><a href={post.parent.url} target="_blank" rel="noreferrer">Parent post <ArrowUpRight size={12}/></a></blockquote>}
                {post.scope && <p>{post.scope}</p>}
                {post.eventBasis==='announcement' && <p>Recorded announcement. This post does not confirm when delivery completed.</p>}
                {post.parentMissing && <p className="context-missing">The parent post is unavailable. Context is incomplete.</p>}
                <div className="detail-meta">{dateLabel(post.at,true)} · {new Date(post.at).toISOString().slice(11,16)} UTC{post.provenance === 'history' && <> · History from <a href="https://codex-resets.com" target="_blank" rel="noreferrer">Codex Resets</a></>}</div>
            </motion.div>}</AnimatePresence>
        </div>
    </article>;
}

export default function Monitor({ initial, renderedAt }: { initial: Snapshot; renderedAt: number }) {
    const [data,setData] = useState(initial);
    const [now,setNow] = useState(renderedAt);
    const [dark,setDark] = useState(true);
    const [filter,setFilter] = useState('all');
    const [year,setYear] = useState('recent');
    const [selected,setSelected] = useState<string|null>(null);
    const [count,setCount] = useState(3);
    const [refreshing,setRefreshing] = useState(false);
    const [refreshError,setRefreshError] = useState(false);
    const scroll = useRef<HTMLDivElement>(null);
    const refreshLock = useRef(false);
    async function refresh() {
        if (refreshLock.current) return;
        refreshLock.current = true; setRefreshing(true);
        try { const r = await fetch('/api/monitor',{cache:'no-store'}); if(!r.ok) throw Error('Unavailable'); setData(await r.json()); setRefreshError(false); setNow(Date.now()); }
        catch { setRefreshError(true); }
        finally { refreshLock.current = false; setRefreshing(false); }
    }
    useEffect(() => {
        const saved = localStorage.getItem('reset-monitor-theme');
        const isDark = saved ? saved === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
        // Synchronize a stored browser preference after hydration, then track system changes.
        const themeMedia = matchMedia('(prefers-color-scheme: dark)');
        const applyTheme = () => { const savedTheme = localStorage.getItem('reset-monitor-theme'); const value = savedTheme ? savedTheme === 'dark' : themeMedia.matches; setDark(value); document.documentElement.dataset.theme = value ? 'dark' : 'light'; };
        const themeFrame = requestAnimationFrame(applyTheme);
        document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
        themeMedia.addEventListener('change',applyTheme);
        const clock = setInterval(() => setNow(Date.now()),30000);
        const poll = setInterval(() => { if(!document.hidden) void refresh(); },30000);
        const onVisible=()=>{if(!document.hidden)void refresh();};
        document.addEventListener('visibilitychange',onVisible);
        return () => { cancelAnimationFrame(themeFrame); themeMedia.removeEventListener('change',applyTheme); document.removeEventListener('visibilitychange',onVisible); clearInterval(clock); clearInterval(poll); };
    },[]);
    useEffect(() => {
        const el=scroll.current;if(!el)return;
        const position=()=>{el.scrollLeft=el.scrollWidth;};
        position();const observer=new ResizeObserver(position);observer.observe(el);
        return()=>observer.disconnect();
    },[year]);
    const stale = !data.checkedAt || now-Date.parse(data.checkedAt)>20*60000 || !!data.error || refreshError;
    const brief=resetBrief(data.posts,now,stale);
    const eventsByDay = useMemo(() => {
        const map = new Map<string,typeof data.events>();
        for(const e of data.events) map.set(e.date,[...(map.get(e.date)??[]),e]);
        return map;
    },[data.events]);
    const today = new Date(now).toISOString().slice(0,10);
    const days = useMemo(() => {
        const end = year==='recent' ? new Date(`${today}T00:00:00Z`) : new Date(`${year}-12-31T00:00:00Z`);
        const start = year==='recent' ? new Date(end.getTime()-364*DAY) : new Date(`${year}-01-01T00:00:00Z`);
        start.setUTCDate(start.getUTCDate()-start.getUTCDay());
        const result:string[]=[];
        for(let t=start.getTime();t<=end.getTime();t+=DAY) result.push(new Date(t).toISOString().slice(0,10));
        return result;
    },[year,today]);
    const years = [...new Set([today.slice(0,4),...data.events.map(e=>e.date.slice(0,4))])].sort().reverse();
    const visible = data.posts.filter(p => {
        if(selected && !p.at.startsWith(selected) && !(eventsByDay.get(selected)??[]).some(e=>e.postIds.includes(p.id))) return false;
        return filter==='all' || (filter==='resets' ? ['confirmed','scheduled'].includes(p.category) : !['confirmed','scheduled'].includes(p.category));
    });
    function selectDay(day:string) { setSelected(selected===day?null:day);setFilter('all');setCount(3); }
    function toggleTheme() { setDark(!dark);document.documentElement.dataset.theme=!dark?'dark':'light';localStorage.setItem('reset-monitor-theme',!dark?'dark':'light'); }
    return <TooltipProvider delayDuration={100}><main className="monitor-shell">
        <header className="site-header"><Link className="wordmark" href="/" aria-label="Codex reset tracker home"><span className="logo"><Terminal size={20}/></span><span>codex <small className="tracker-name">reset tracker</small></span></Link><div className="header-actions"><BounceButton className="icon-button" onClick={toggleTheme} aria-label={dark?'Switch to light theme':'Switch to dark theme'}>{dark?<Sun size={19}/>:<Moon size={19}/>}</BounceButton></div></header>
        <section className="hero" aria-label="Reset Monitor">
            <h1 className="sr-only">Codex reset tracker</h1><div className="hero-info"><ResetClocks posts={data.posts} renderedAt={renderedAt}/><ResetBrief text={brief.text} url={brief.url}/></div>
            <ResetKey checking={refreshing} failed={refreshError} onCheck={refresh}/>
        </section>
        <section className="activity-section" aria-labelledby="activity-title"><div className="section-heading"><h2 id="activity-title">activity</h2><Select value={year} onValueChange={v=>{setYear(v);setSelected(null);}}><SelectTrigger aria-label="Activity period" className="year-select"><SelectValue>{year==='recent'?'Past year':year}</SelectValue></SelectTrigger><SelectContent>{['recent',...years].map(y=><SelectItem key={y} value={y}>{y==='recent'?'Past year':y}</SelectItem>)}</SelectContent></Select></div>
            <div className="calendar-frame"><div className="day-labels" aria-hidden="true"><span>Mon</span><span>Wed</span><span>Fri</span></div><div className="calendar-scroll" ref={scroll} tabIndex={0} aria-label="Reset calendar, scroll to see older dates">
                <GitHubActivity className="reset-activity" hideHeading showMonths months={13} cellSize={12} selectedDate={selected} onDayClick={selectDay} accent="var(--green-fill)" contributions={days.map(day=>{
                    const events=eventsByDay.get(day)??[];
                    const unavailable=day>today||!data.coverageStart||day<data.coverageStart.slice(0,10);
                    const banked=events.some(e=>e.type==='banked'||e.type==='both');
                    const full=events.some(e=>e.type==='regular'||e.type==='both');
                    return {date:day,count:events.length,level:events.length?4:0,banked,unavailable,label:`${dateLabel(day,true)}: ${unavailable?'outside recorded history':events.length?`${full?'Full reset':''}${banked?full?' and banked reset':'Banked reset':''}`:'No recorded reset'}`} as Contribution;
                })}/>
            </div></div>
            <div className="calendar-caption"><span>UTC</span><div className="calendar-legend"><span><i className="legend-cell"/>No reset</span><span><i className="legend-cell filled"/>Full</span><span><i className="legend-cell filled banked"/>Banked</span></div></div>
            {selected&&<div className="date-filter"><span>{dateLabel(selected,true)}</span><span>{visible.length} {visible.length===1?'update':'updates'}</span><button onClick={()=>setSelected(null)} aria-label="Clear date filter"><X size={14}/>Clear date</button></div>}
        </section>
        <section className="feed-section" aria-labelledby="updates-title"><Tabs value={filter} onValueChange={v=>{setFilter(v);setCount(3);}}><div className="section-heading feed-heading"><h2 id="updates-title"><a className="tibo-avatar" href="https://x.com/thsottiaux" target="_blank" rel="noreferrer" aria-label="Tibo on X"><img src="/images/tibo-avatar.jpg" alt="" width={36} height={36}/></a>notes</h2><TabsList className="feed-tabs"><TabsTrigger value="all">All</TabsTrigger><TabsTrigger value="resets">Resets</TabsTrigger><TabsTrigger value="trickles">Trickles</TabsTrigger></TabsList></div>
            {['all','resets','trickles'].map(tab=><TabsContent value={tab} key={tab} className="feed-content"><div aria-live="polite">{visible.length?visible.slice(0,count).map(p=><PostRow key={p.id} post={p} now={now}/>):<div className="empty-state"><img className="tibo-empty" src="/images/tibo-scribble.webp" alt="Tibo with his laptop" width={400} height={600}/><h3>{selected?'Nothing recorded on this day.':'No updates here yet.'}</h3><p>{selected?'Choose another day or clear the date filter.':'Relevant replies and reset updates will appear as they are found.'}</p>{selected&&<BounceButton className="text-button" onClick={()=>setSelected(null)}>Clear date filter</BounceButton>}</div>}</div>{visible.length>count&&<BounceButton className="load-older" onClick={()=>setCount(c=>c+6)} aria-label="Load older updates">more<ChevronDown size={15}/></BounceButton>}</TabsContent>)}
        </Tabs></section>
        <footer className="site-footer"><span>unofficial</span><details className="sources-details"><summary><CircleHelp size={12}/>sources</summary><p>Posts and replies by <a href="https://x.com/thsottiaux" target="_blank" rel="noreferrer">@thsottiaux</a>, retrieved through <a href="https://docs.fxembed.com/api/introduction/" target="_blank" rel="noreferrer">FxEmbed</a>. Illustration is unofficial fan art. Not affiliated with OpenAI. The archive also includes the banked-reset launch from <a href="https://x.com/OpenAI/status/2065225362544726371" target="_blank" rel="noreferrer">@OpenAI</a>. Historical reset data from <a href="https://codex-resets.com" target="_blank" rel="noreferrer">Codex Resets</a>.</p><p>Calendar dates use the source announcement or confirmation date in UTC. Empty days mean no recorded reset, not proof that none happened. Hints never count as confirmed resets.</p><p>{data.replyCoverageStart?`Replies collected back to ${dateLabel(data.replyCoverageStart,true)}. `:''}Older June and July posts were checked individually; earlier reply history is incomplete. Public-source coverage can have gaps. Missing context is labelled. Confirmed means the source reports delivery. It does not verify your account balance. The last-reset clock uses the newest full or banked source confirmation. The outlook condenses source wording; an hourly estimate appears only when a source gives an explicit time window.</p></details></footer>
    </main></TooltipProvider>;
}
