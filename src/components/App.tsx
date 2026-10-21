import { useState, useCallback, useRef, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { motion, AnimatePresence, MotionConfig, animate, useMotionValue, useSpring, useTransform, type MotionValue } from 'motion/react';
import Navigation from './Navigation';
import { useBGM } from '@/hooks/useBGM';
import HeroSection from './sections/HeroSection';
import AboutSection from './sections/AboutSection';
import ProjectsSection from './sections/ProjectsSection';
import SkillsSection from './sections/SkillsSection';
import GallerySection from './sections/GallerySection';
import Cursor from './effects/Cursor';
import { TYPE_MS, DELETE_MS } from '@/lib/typewriter';

interface Project {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  link?: string;
  github?: string;
  order: number;
}

interface AppProps {
  projects: Project[];
}

// `watermark` is the typewriter word in the bottom band; `name` labels the right rail.
// Each section is a sheet fed into the typewriter: soft charcoal, or paper with its own muted tint (Morandi)
const SHEET = { charcoal: '#1D1E20', paper: '#EDE9E2', sage: '#E5E7E1' };
const SECTIONS = [
  { id: 'home', name: 'HOMEPAGE', watermark: '', bg: SHEET.charcoal, isDark: true }, // hero types its own title
  { id: 'about', name: 'ABOUT', watermark: 'ABOUT', bg: SHEET.paper, isDark: false },
  { id: 'projects', name: 'WORKS', watermark: 'WORKS', bg: SHEET.charcoal, isDark: true },
  { id: 'skills', name: 'SKILLS', watermark: 'SKILLS', bg: SHEET.sage, isDark: false },
  { id: 'gallery', name: 'GALLERY', watermark: 'GALLERY', bg: SHEET.charcoal, isDark: true },
] as const;

// Each typed letter is struck onto the sheet: it lands with a hair of weight and settles (CSS `strike`, once per letter,
// so backspacing never replays it). `still` mounts letters without it (the hand-over from the sheet's copy).
const Letter = ({ ch, still }: { ch: string; still?: boolean }) => {
  const quiet = useRef(still).current; // decided when the letter is mounted — flipping the class later would replay it on every letter
  return <span className={quiet ? 'inline-block' : 'strike'}>{ch}</span>;
};
const Letters = ({ text, still }: { text: string; still?: boolean }) => (
  <>{[...text].map((ch, i) => <Letter key={i} ch={ch} still={still} />)}</>
);

const pad2 = (n: number) => String(n).padStart(2, '0');

const delay = (ms: number) => new Promise<void>(r => setTimeout(r, ms));
const nextFrame = () => new Promise<void>(r => requestAnimationFrame(() => r()));

// Page turn = paper feed: the written sheet rolls up out of the machine, the next blank sheet follows it in
const FEED_MS = 950;
const FEED_EASE = [0.65, 0, 0.35, 1] as const; // a platen: eases off the stop, glides, eases onto the next line
const WM_AT = 0.5; // the new word starts typing on the incoming sheet this far into the feed (0 = together, 1 = after)
const WM_CLASS = 'absolute left-(--mx) -bottom-[0.11em] -ml-[0.03em] font-bebas text-[46vw] md:text-[min(46vh,30vw)] leading-[0.8] whitespace-nowrap';

// Can this section's own scroll container move further in `dir` (1 = down, -1 = up)?
const hasRoom = (el: HTMLElement | null | undefined, dir: number) => {
  if (!el || el.scrollHeight <= el.clientHeight + 2) return false;
  return dir > 0 ? el.scrollTop + el.clientHeight < el.scrollHeight - 2 : el.scrollTop > 0;
};

/* ── Section Dots — MD3 expressive stretch ─────────────────────── */
function SectionDots({ current, total, isDark }: { current: number; total: number; isDark: boolean }) {
  const DOT = 4, GAP = 12, STEP = DOT + GAP;
  const IH = 20; // indicator height at rest
  const PAD = (IH - DOT) / 2; // vertical padding so indicator doesn't clip
  const containerH = total * DOT + (total - 1) * GAP + 2 * PAD;

  const prevRef = useRef(current);
  const dir = current - prevRef.current;
  useEffect(() => { prevRef.current = current; }, [current]);

  const topTarget = current * STEP;
  const bottomTarget = containerH - topTarget - IH;

  // Leading edge arrives first, trailing edge follows — creates the stretch
  const lead = { type: 'spring' as const, stiffness: 300, damping: 25 };
  const trail = { type: 'spring' as const, stiffness: 300, damping: 35, mass: 2 };

  return (
    <div className="relative">
      <div className="relative" style={{ width: 6, height: containerH }}>
        {/* Static background dots */}
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className="absolute left-1/2 -translate-x-1/2 transition-colors duration-500"
            style={{
              width: DOT,
              height: DOT,
              top: PAD + i * STEP,
              backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
            }}
          />
        ))}
        {/* Active indicator — edges spring independently */}
        <motion.div
          className="absolute inset-x-0 bg-[#8FC6C1]"
          initial={false}
          animate={{ top: topTarget, bottom: bottomTarget }}
          transition={{
            top: dir > 0 ? trail : lead,
            bottom: dir < 0 ? trail : lead,
          }}
        />
      </div>
    </div>
  );
}

/* ── Right rail — Arknights-style section index ─────────────────── */
// Masked vertical roll; direction follows travel (forward rolls up, back rolls down). Module-level: an inline component would remount every render.
const rollVariants = {
  initial: (d: number) => ({ y: d > 0 ? '100%' : '-100%' }),
  animate: { y: '0%' },
  exit: (d: number) => ({ y: d > 0 ? '-100%' : '100%' }),
};
function Roll({ k, dir, children, delay = 0, className = '', box = '' }: { k: number; dir: number; children: React.ReactNode; delay?: number; className?: string; box?: string }) {
  return (
    <div className={`relative overflow-hidden ${box}`}>
      <AnimatePresence mode="popLayout" initial={false} custom={dir}>
        <motion.div key={k} custom={dir} variants={rollVariants} initial="initial" animate="animate" exit="exit" className={className} transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}>
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
function RightRail({ index, isDark, progress }: { index: number; isDark: boolean; progress: MotionValue<number> }) {
  // Rolls follow the direction of travel: forward rolls up, going back rolls down
  const prevRef = useRef(index);
  const dirRef = useRef(1);
  if (index !== prevRef.current) {
    dirRef.current = index > prevRef.current ? 1 : -1;
    prevRef.current = index;
  }
  const dir = dirRef.current;
  return (
    <div
      className={`fixed top-(--nav-h) bottom-0 right-0 w-(--rail) z-30 hidden lg:block border-l pointer-events-none transition-colors duration-500 ${
        isDark ? 'border-white/10' : 'border-black/10'
      }`}
    >
      {/* How far the active section has scrolled inside itself (empty when it fits on one screen) */}
      <motion.span className="absolute -left-px top-0 bottom-0 w-px bg-[#8FC6C1] origin-top" style={{ scaleY: progress }} />
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-6">
        {/* Number rolls like a counter; its lower part is cropped (AK) */}
        <Roll k={index} dir={dir} box="h-[4.2rem]" className="font-bebas text-[6.5rem] leading-[0.8] text-[#8FC6C1]">{pad2(index)}</Roll>
        <Roll k={index} dir={dir} delay={0.06} box="mt-2" className={`font-bebas text-[18px] tracking-[0.14em] transition-colors duration-500 ${isDark ? 'text-white' : 'text-[#0A0A0A]'}`}>
          {SECTIONS[index].name}
        </Roll>
        <div className="mt-10">
          <SectionDots current={index} total={SECTIONS.length} isDark={isDark} />
        </div>
      </div>
    </div>
  );
}

/* ── Top progress bar ───────────────────────────────────────────── */
function SectionProgress({ current, total }: { current: number; total: number }) {
  const progress = ((current + 1) / total) * 100;
  return (
    <div className="fixed top-0 left-0 right-0 z-55 h-0.5 bg-transparent lg:hidden"> {/* lg+ has the right rail */}
      <motion.div
        className="h-full bg-[#8FC6C1]"
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

/* ── Main App ────────────────────────────────────────────────────── */
export default function App({ projects }: AppProps) {
  const { playing: bgmPlaying, toggle: toggleBGM, analyserRef: bgmAnalyserRef } = useBGM();
  const [activeIndex, setActiveIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [contentReady, setContentReady] = useState(false);
  const [sectionVisible, setSectionVisible] = useState(true);

  // Shared watermark state
  const [watermarkText, setWatermarkText] = useState('');
  const [watermarkProminent, setWatermarkProminent] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(false);
  const watermarkRef = useRef(''); // live text, so a retype can start from whatever is shown
  const showWatermark = useCallback((text: string) => {
    watermarkRef.current = text;
    setWatermarkText(text);
  }, []);

  // Watermark drifts sideways as the active section scrolls (Endfield-style scroll-linked type)
  const drift = useMotionValue(0);
  const driftSmooth = useSpring(drift, { stiffness: 120, damping: 24 });
  // How far the active section has scrolled inside itself → rail line
  const scrollProgress = useMotionValue(0);
  const scrollProgressSmooth = useSpring(scrollProgress, { stiffness: 200, damping: 30 });
  // Rubber-band pull on the active layer while the wheel pushes against a section edge
  const pull = useMotionValue(0);
  const pullSmooth = useSpring(pull, { stiffness: 260, damping: 28 });
  const pullTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  // Where there is a neighbouring sheet the pull moves the whole paper instead, and the next sheet's edge shows behind it
  const paper = useMotionValue(0);
  const paperSmooth = useSpring(paper, { stiffness: 260, damping: 28 });
  // Eased in-section wheel scrolling (target + rAF), instead of jumping scrollTop by the raw delta
  const scrollTarget = useRef<number | null>(null);
  const scrollRaf = useRef(0);
  const wheelGestureInside = useRef(false); // this wheel gesture already scrolled the section's own content

  // Phones scroll natively like Endfield's H5 site; fullpage transitions are desktop/tablet only
  const [isMobile, setIsMobile] = useState(false);
  const isMobileRef = useRef(false);
  const [seen, setSeen] = useState<boolean[]>(() => SECTIONS.map(() => false));

  // Section the frame (rail) shows — flips with the background, before the content swaps in
  const [frameIndex, setFrameIndex] = useState(0);
  // The nav bar sits at the top edge, so it changes sheet when the paper's edge has passed *it*, not at the midpoint like the rail
  const [navIndex, setNavIndex] = useState(0);
  // The paper: bg + watermark + section layers move as one sheet (y); `feed` is the blank sheet riding in behind it
  const sheetY = useMotionValue(0);
  const paperY = useTransform([sheetY, paperSmooth], ([a, b]: number[]) => a + b);
  const [feed, setFeed] = useState<{ to: number; dir: number } | null>(null);
  const [feedText, setFeedText] = useState(''); // what is typed on the incoming sheet while it is still moving
  const [wmDeleting, setWmDeleting] = useState(false); // the old word is being backspaced on the sheet that is leaving
  const [wmSnap, setWmSnap] = useState(false); // the watermark takes the new sheet's tone at once when it hands over from the feed copy

  // Shared background state
  const [bgColor, setBgColor] = useState<string>(SECTIONS[0].bg);
  const [bgIsDark, setBgIsDark] = useState<boolean>(SECTIONS[0].isDark);

  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const wheelAccum = useRef(0);
  const lastWheelTime = useRef(0);

  // Refs for live values — avoids stale closures in event handlers
  const activeIndexRef = useRef(0);
  const lockedRef = useRef(false); // true during transition + cooldown

  // Keep ref in sync with state
  useEffect(() => { activeIndexRef.current = activeIndex; }, [activeIndex]);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => {
      isMobileRef.current = mq.matches;
      setIsMobile(mq.matches);
    };
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // Dismiss loader after progress completes, then trigger entrance animations
  useEffect(() => {
    let cancelled = false;

    function tryDismiss() {
      if (cancelled) return;
      if (!(window as any).__loaderDone) {
        requestAnimationFrame(tryDismiss);
        return;
      }
      // Progress hit 100% — hold a beat, then start exit
      setTimeout(() => {
        if (cancelled) return;
        const el = document.getElementById('loader');
        if (el) {
          el.classList.add('loader-exit');
          let done = false;
          const finish = () => {
            if (done) return;
            done = true;
            el.remove();
            setContentReady(true);
          };
          el.addEventListener('transitionend', finish, { once: true });
          setTimeout(finish, 1500); // exit takes ~0.8s; if transitionend never fires the page must not stay blank
        } else {
          setContentReady(true);
        }
      }, 300);
    }

    requestAnimationFrame(tryDismiss);
    return () => { cancelled = true; };
  }, []);

  /* ── Navigate ────────────────────────────────────────────────── */
  const navigateToSection = useCallback(async (targetIndex: number) => {
    if (lockedRef.current) return;
    if (targetIndex === activeIndexRef.current || targetIndex < 0 || targetIndex >= SECTIONS.length) return;

    const currentIndex = activeIndexRef.current;
    const toWatermark = SECTIONS[targetIndex].watermark;

    lockedRef.current = true;
    cancelAnimationFrame(scrollRaf.current); scrollRaf.current = 0; scrollTarget.current = null;
    pull.set(0);
    clearTimeout(pullTimer.current);
    sheetY.set(paperSmooth.get()); paper.jump(0); paperSmooth.jump(0); // the roll carries on from where the paper was pulled to
    typeToken.current++; // cancel a phone-side retype that may still be running
    setTransitioning(true);
    wheelAccum.current = 0;

    // Phase 1: Paper feed. The written sheet — content, watermark and all — rolls up out of the machine and the
    // next blank sheet follows it in from below (going back reverse-feeds: down, new sheet from above).
    // The machine (nav, rail, bottom rule) stays put and takes the new paper's tone as it passes the middle.
    const dir = targetIndex > currentIndex ? 1 : -1;
    const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    flushSync(() => setFeed({ to: targetIndex, dir }));
    await nextFrame();
    const roll = animate(sheetY, -dir * window.innerHeight, { duration: calm ? 0 : FEED_MS / 1000, ease: FEED_EASE });

    // As the feed starts the old word is backspaced away (done well before the sheet is out of sight)
    const deleting = (async () => {
      if (!watermarkRef.current) return;
      if (!calm) {
        setWatermarkProminent(true);
        setWmDeleting(true);
        setCursorVisible(true);
        while (watermarkRef.current) {
          showWatermark(watermarkRef.current.slice(0, -1));
          await delay(DELETE_MS);
        }
        setWmDeleting(false);
      }
      showWatermark('');
    })();

    // The new word is typed while its sheet is still coming in: on the sheet's own copy first, then (after the hand-over
    // below) on the real watermark — one run of keystrokes, no pause between the feed and the typing.
    let typed = '';
    let handedOver = false;
    // forward the old sheet's tail leaves the top last (~0.95 of the travel); back, the new sheet covers the top first
    setTimeout(() => setNavIndex(targetIndex), calm ? 0 : FEED_MS * (dir > 0 ? 0.77 : 0.2));
    const typing = (async () => {
      if (!toWatermark) return;
      await delay(calm ? 0 : FEED_MS * WM_AT);
      await deleting;
      setCursorVisible(true);
      for (let i = 0; i <= toWatermark.length; i++) {
        typed = toWatermark.slice(0, i);
        if (handedOver) showWatermark(typed); else setFeedText(typed);
        await delay(TYPE_MS);
      }
    })();

    await delay(calm ? 0 : FEED_MS * 0.5);
    setFrameIndex(targetIndex);
    setBgIsDark(SECTIONS[targetIndex].isDark);
    await roll;

    // Phase 2: The blank sheet is the page now — swap everything underneath it, then drop the sheet back to 0 (no visible change).
    // The real watermark takes over from the sheet's copy exactly where the typing is.
    handedOver = true;
    flushSync(() => {
      setContentReady(false);
      setSectionVisible(false);
      showWatermark(typed);
      setFeedText('');
      setWmSnap(true);
      setWatermarkProminent(!!toWatermark);
      setBgColor(SECTIONS[targetIndex].bg);
      activeIndexRef.current = targetIndex;
      setActiveIndex(targetIndex);
      setFeed(null);
    });
    nextFrame().then(() => setWmSnap(false));
    drift.jump(0);
    driftSmooth.jump(0);
    const wrapper = sectionRefs.current[targetIndex];
    if (wrapper) wrapper.scrollTop = 0;
    sheetY.jump(0);

    // Phase 3: Let the typing finish, then the watermark settles back
    await typing;
    if (toWatermark) {
      await delay(250);
      setCursorVisible(false);
      setWatermarkProminent(false);
      await delay(150);
    } else {
      setCursorVisible(false); // home has no word, so no caret
    }

    // Phase 4: Content is set on the page
    setSectionVisible(true);
    await delay(300);

    // Phase 5: Content entrance animations
    setContentReady(true);
    setTransitioning(false);

    // Post-transition cooldown — absorbs trackpad momentum
    wheelAccum.current = 0;
    setTimeout(() => { lockedRef.current = false; }, 600);
  }, [drift, driftSmooth, pull, paper, paperSmooth, sheetY, showWatermark]); // stable — uses refs and motion values, not state

  /* ── Scroll-linked watermark drift (desktop: active section's own scroll) ── */
  useEffect(() => {
    if (isMobile) return;
    const el = sectionRefs.current[activeIndex];
    if (!el) return;
    const onScroll = () => {
      drift.set(-el.scrollTop * 0.5);
      const max = el.scrollHeight - el.clientHeight;
      scrollProgress.set(max > 2 ? el.scrollTop / max : 0);
    };
    onScroll();
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [activeIndex, isMobile, drift, scrollProgress]);

  /* ── Mobile: native scroll drives the active section ─────────── */
  const typeToken = useRef(0);
  const retypeWatermark = useCallback(async (to: string) => {
    const token = ++typeToken.current;
    const alive = () => token === typeToken.current; // a newer section took over
    setWatermarkProminent(true);
    setCursorVisible(true);
    while (watermarkRef.current && alive()) {
      showWatermark(watermarkRef.current.slice(0, -1));
      await delay(DELETE_MS);
    }
    for (let i = 1; i <= to.length && alive(); i++) {
      showWatermark(to.slice(0, i));
      await delay(TYPE_MS);
    }
    await delay(300);
    if (!alive()) return;
    setCursorVisible(false);
    setWatermarkProminent(false);
  }, [showWatermark]);

  useEffect(() => {
    if (!isMobile) return;
    const els = sectionRefs.current.filter(Boolean) as HTMLDivElement[];

    // Active = the section crossing the middle of the viewport
    const active = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const i = els.indexOf(entry.target as HTMLDivElement);
        if (!entry.isIntersecting || i === activeIndexRef.current) continue;
        activeIndexRef.current = i;
        setActiveIndex(i);
        setFrameIndex(i);
        setBgColor(SECTIONS[i].bg);
        setBgIsDark(SECTIONS[i].isDark);
        retypeWatermark(SECTIONS[i].watermark);
      }
    }, { rootMargin: '-50% 0px -50% 0px' });

    // Reveal = entrance animations play once, when a section first scrolls into view
    const reveal = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const i = els.indexOf(entry.target as HTMLDivElement);
        setSeen(prev => prev.map((v, j) => v || j === i));
        reveal.unobserve(entry.target);
      }
    }, { threshold: 0.15 });

    els.forEach(el => { active.observe(el); reveal.observe(el); });

    const onScroll = () => {
      const el = sectionRefs.current[activeIndexRef.current];
      if (el) drift.set(Math.min(0, el.getBoundingClientRect().top) * 0.3);
      // the bar takes the colour of whichever section is under it (not the one at mid-screen)
      let under = 0;
      els.forEach((e, i) => { if (e.getBoundingClientRect().top <= 32) under = i; });
      setNavIndex(under);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      active.disconnect();
      reveal.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, [isMobile, retypeWatermark, drift]);

  /* ── Wheel handler with accumulator ──────────────────────────── */
  useEffect(() => {
    const THRESHOLD = 80;

    const handleWheel = (e: WheelEvent) => {
      if (isMobileRef.current || e.ctrlKey) return; // ctrl+wheel / pinch is the browser's zoom, not a page turn
      e.preventDefault(); // Always prevent — we handle all scrolling manually

      if (lockedRef.current) return;

      // Normalize delta (Firefox uses deltaMode 1 = lines)
      let delta = e.deltaY;
      if (e.deltaMode === 1) delta *= 40;
      else if (e.deltaMode === 2) delta *= window.innerHeight;

      const now = Date.now();
      if (now - lastWheelTime.current > 200) {
        wheelAccum.current = 0;
        wheelGestureInside.current = false; // a pause starts a new gesture
      }
      lastWheelTime.current = now;

      const idx = activeIndexRef.current;
      const wrapper = sectionRefs.current[idx];

      // Handle internal section scroll (eased toward a target, clamped to the section)
      if (wrapper && delta !== 0 && hasRoom(wrapper, Math.sign(delta))) {
        wheelGestureInside.current = true;
        wheelAccum.current = 0;
        pull.set(0);
        paper.set(0);
        const max = wrapper.scrollHeight - wrapper.clientHeight;
        scrollTarget.current = Math.min(max, Math.max(0, (scrollTarget.current ?? wrapper.scrollTop) + delta));
        if (!scrollRaf.current) {
          const step = () => {
            const d = (scrollTarget.current ?? wrapper.scrollTop) - wrapper.scrollTop;
            if (Math.abs(d) < 1) {
              if (scrollTarget.current !== null) wrapper.scrollTop = scrollTarget.current;
              scrollTarget.current = null;
              scrollRaf.current = 0;
              return;
            }
            // at least 1px a frame, or integer scrollTop would round small steps to nothing
            wrapper.scrollTop += Math.abs(d * 0.2) < 1 ? Math.sign(d) : d * 0.2;
            scrollRaf.current = requestAnimationFrame(step);
          };
          scrollRaf.current = requestAnimationFrame(step);
        }
        return;
      }

      // Momentum from a gesture that was scrolling the section must not carry on into the next page
      if (wheelGestureInside.current) return;

      // At boundary or no internal scroll — accumulate for page transition, and pull the layer against it
      wheelAccum.current += delta;
      const pulled = Math.max(-24, Math.min(24, -wheelAccum.current * 0.3));
      const dir = Math.sign(wheelAccum.current);
      if (dir && idx + dir >= 0 && idx + dir < SECTIONS.length) {
        // push the paper out and let the next blank sheet's edge show where it left
        setFeed((f) => (f && f.dir === dir ? f : { to: idx + dir, dir }));
        paper.set(pulled);
        pull.set(0);
      } else {
        pull.set(pulled);
        paper.set(0);
      }
      clearTimeout(pullTimer.current);
      pullTimer.current = setTimeout(() => {
        wheelAccum.current = 0; pull.set(0); paper.set(0);
        // the edge goes once the paper has settled back (a page turn that started meanwhile owns `feed`)
        setTimeout(() => { if (!lockedRef.current && wheelAccum.current === 0) setFeed(null); }, 400);
      }, 220);

      if (wheelAccum.current > THRESHOLD) {
        wheelAccum.current = 0;
        navigateToSection(idx + 1);
      } else if (wheelAccum.current < -THRESHOLD) {
        wheelAccum.current = 0;
        navigateToSection(idx - 1);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [navigateToSection, pull, paper]);

  /* ── Keyboard handler ────────────────────────────────────────── */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isMobileRef.current || lockedRef.current) return;

      const idx = activeIndexRef.current;
      if (e.key === ' ' && (e.target as HTMLElement).closest('button, a')) return;

      const dir = ['ArrowDown', 'PageDown', ' '].includes(e.key) ? 1
        : ['ArrowUp', 'PageUp'].includes(e.key) ? -1 : 0;
      if (dir) {
        e.preventDefault();
        const wrapper = sectionRefs.current[idx];
        if (wrapper && hasRoom(wrapper, dir)) {
          wrapper.scrollBy({ top: dir * wrapper.clientHeight * 0.8, behavior: 'smooth' });
        } else {
          navigateToSection(idx + dir);
        }
      } else if (e.key === 'Home') {
        e.preventDefault();
        navigateToSection(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        navigateToSection(SECTIONS.length - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigateToSection]);

  /* ── Touch handler ───────────────────────────────────────────── */
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let startTime = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startTime = Date.now();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isMobileRef.current || lockedRef.current) return;

      const deltaX = Math.abs(e.changedTouches[0].clientX - startX);
      const deltaY = startY - e.changedTouches[0].clientY;
      const absDeltaY = Math.abs(deltaY);
      const deltaTime = Date.now() - startTime;
      const idx = activeIndexRef.current;

      // Must be a decisive vertical swipe: far enough, fast enough, mostly vertical
      if (absDeltaY < 120 || deltaTime > 400 || deltaX > absDeltaY * 0.5) return;

      // Section still has internal scroll room in the swipe direction
      if (hasRoom(sectionRefs.current[idx], Math.sign(deltaY))) return;

      if (deltaY > 0) {
        navigateToSection(idx + 1);
      } else {
        navigateToSection(idx - 1);
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [navigateToSection]);

  /* ── Nav callback ────────────────────────────────────────────── */
  const handleNavigate = useCallback((sectionId: string) => {
    const idx = SECTIONS.findIndex(s => s.id === sectionId);
    if (idx < 0) return;
    if (isMobileRef.current) sectionRefs.current[idx]?.scrollIntoView({ behavior: 'smooth' });
    else navigateToSection(idx);
  }, [navigateToSection]);

  /* ── Custom event listener (HeroButtons etc.) ────────────────── */
  useEffect(() => {
    const handler = (e: Event) => {
      handleNavigate((e as CustomEvent).detail);
    };
    window.addEventListener('navigate-section', handler);
    return () => window.removeEventListener('navigate-section', handler);
  }, [handleNavigate]);

  /* ── Render ──────────────────────────────────────────────────── */
  return (
    <MotionConfig reducedMotion="user">
      <div className={isMobile ? 'relative' : 'fixed inset-0 overflow-hidden'}>
        {/* ── The paper ── bg, watermark and section layers are one sheet (desktop: moved by `sheetY` on a page turn).
            Phones: `contents`, so nothing changes for the native-scroll layout. */}
        <motion.div className={isMobile ? 'contents' : 'absolute inset-0'} style={isMobile ? undefined : { y: paperY }}>
        {/* Sheet colour — swaps instantly: a page turn hides the change under the incoming sheet */}
        <div className="fixed inset-0 z-0" style={{ backgroundColor: bgColor }} />

        {/* Typewriter watermark — the design's centrepiece: half the viewport tall, behind the
            content, starting on the page margin and bled off the bottom edge */}
        <div className={`fixed inset-0 ${isMobile ? 'z-3' : 'z-1'} pointer-events-none select-none overflow-hidden`} aria-hidden="true">
          <motion.div
            className={WM_CLASS}
            style={{ x: driftSmooth }}
            animate={{
              // tone of the sheet it is printed on (not the frame, which flips while the sheet is still leaving)
              color: SECTIONS[activeIndex].isDark
                ? (watermarkProminent ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.045)')
                : (watermarkProminent ? 'rgba(0,0,0,0.13)' : 'rgba(0,0,0,0.04)')
            }}
            transition={{ duration: wmSnap ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <Letters text={watermarkText} still={wmSnap} />
            <AnimatePresence>
              {cursorVisible && (!feed || wmDeleting) && (
                <motion.span
                  className="inline-block w-[0.045em] h-[0.66em] ml-[0.05em]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <span className="block w-full h-full bg-[#8FC6C1] animate-blink" />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Section Layers — transparent bg, content only */}
        {SECTIONS.map((section, i) => {
          const isActive = i === activeIndex;
          // Desktop: the active layer is shown; phones: every section stacks and reveals once seen
          const ready = contentReady && (isMobile ? seen[i] : isActive);
          return (
            <motion.div
              key={section.id}
              ref={(el) => { sectionRefs.current[i] = el; }}
              className={isMobile ? 'relative z-2 scroll-mt-16' : `absolute inset-0 z-2 section-scroll ${
                isActive ? 'overflow-y-auto' : 'overflow-hidden pointer-events-none'
              }`}
              animate={{
                opacity: isMobile || (isActive && sectionVisible) ? 1 : 0,
              }}
              // a layer that stops being the page goes at once (its sheet has already left); `transition-all` children would
              // otherwise keep `visibility` through the fade and ghost onto the new sheet
              transition={isActive ? { duration: 0.35, ease: [0.22, 1, 0.36, 1] } : { duration: 0 }}
              style={{
                '--sheet': section.bg, // veils inside the section (frosted cover, vignette) take their own paper's colour
                ...(isMobile ? { backgroundColor: section.bg } : { visibility: isActive ? 'visible' : 'hidden', y: isActive ? pullSmooth : 0 }),
              } as unknown as React.CSSProperties}
            >
              {i === 0 && <HeroSection isReady={ready} />}
              {i === 1 && <AboutSection isReady={ready} />}
              {i === 2 && <ProjectsSection projects={projects} isReady={ready} />}
              {i === 3 && <SkillsSection isReady={ready} />}
              {i === 4 && <GallerySection isReady={ready} />}
            </motion.div>
          );
        })}

        {/* Paper grain lies over the sections (not under them): frosted veils blur whatever is beneath, and blurred grain
            would show as a smooth patch in the paper */}
        <div className="grain fixed inset-0 z-2 pointer-events-none max-md:hidden" aria-hidden="true" />

        {/* The next blank sheet, fed in right behind the current one (below going forward, above going back) */}
        {feed && !isMobile && (
          <div
            className="absolute inset-x-0 h-full z-3 pointer-events-none"
            style={{
              top: feed.dir > 0 ? '100%' : '-100%',
              backgroundColor: SECTIONS[feed.to].bg,
              boxShadow: `0 ${feed.dir > 0 ? -1 : 1}px 0 rgba(0,0,0,0.06), 0 ${feed.dir > 0 ? -16 : 16}px 36px -14px rgba(0,0,0,0.3)`,
            }}
          >
            <div className="grain absolute inset-0" aria-hidden="true" />
            {/* the word being typed on this sheet as it arrives (same box as the real watermark, which takes over at the stop) */}
            <div className="absolute inset-0 overflow-hidden">
              <div className={WM_CLASS} style={{ color: SECTIONS[feed.to].isDark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.13)' }}>
                <Letters text={feedText} />
                {cursorVisible && !wmDeleting && (
                  <span className="inline-block w-[0.045em] h-[0.66em] ml-[0.05em]">
                    <span className="block w-full h-full bg-[#8FC6C1] animate-blink" />
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
        </motion.div>

        {/* ── The machine ── stays put while paper moves through it */}
        {/* Bottom hairline + AK-style scroll hint (desktop/tablet) */}
        {!isMobile && (
          <div
            className={`fixed inset-x-0 bottom-0 h-(--band) z-1 pointer-events-none border-t transition-colors duration-500 ${
              bgIsDark ? 'border-white/10' : 'border-black/10'
            }`}
          >
            {frameIndex < SECTIONS.length - 1 && (
              <div className={`absolute left-1/2 -translate-x-1/2 bottom-5 flex flex-col items-center gap-1.5 transition-colors duration-500 ${bgIsDark ? 'text-white/40' : 'text-black/40'}`}>
                <span className="font-bebas text-[12px] leading-none tracking-[0.2em]">SCROLL</span>
                <svg width="18" height="8" viewBox="0 0 18 8" className="animate-bounce" aria-hidden="true">
                  <path d="M1 1l8 6 8-6" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
            )}
          </div>
        )}

        <RightRail index={frameIndex} isDark={bgIsDark} progress={scrollProgressSmooth} />

        <Navigation currentSection={SECTIONS[activeIndex].id} isDark={SECTIONS[navIndex].isDark} onNavigate={handleNavigate} bgmPlaying={bgmPlaying} onBGMToggle={toggleBGM} bgmAnalyser={bgmAnalyserRef} sheet={SECTIONS[navIndex].bg} />
        <SectionProgress current={activeIndex} total={SECTIONS.length} />

        <Cursor />
      </div>
    </MotionConfig>
  );
}
