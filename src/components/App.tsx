import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence, MotionConfig, useMotionValue, useSpring } from 'motion/react';
import Navigation from './Navigation';
import { useBGM } from '@/hooks/useBGM';
import HeroSection from './sections/HeroSection';
import AboutSection from './sections/AboutSection';
import ProjectsSection from './sections/ProjectsSection';
import SkillsSection from './sections/SkillsSection';
import GallerySection from './sections/GallerySection';
import Cursor from './effects/Cursor';

interface Project {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  link?: string;
  github?: string;
  featured: boolean;
  order: number;
}

interface AppProps {
  projects: Project[];
}

const SECTIONS = [
  { id: 'home', watermark: '', bg: '#0A0A0A', isDark: true },
  { id: 'about', watermark: 'ABOUT', bg: '#FAFAFA', isDark: false },
  { id: 'projects', watermark: 'WORKS', bg: '#0A0A0A', isDark: true },
  { id: 'skills', watermark: 'SKILLS', bg: '#FFFFFF', isDark: false },
  { id: 'gallery', watermark: 'GALLERY', bg: '#0A0A0A', isDark: true },
] as const;

const delay = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

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
    <div className="fixed right-6 xl:right-10 top-1/2 -translate-y-1/2 z-40 hidden lg:block">
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
              backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
            }}
          />
        ))}
        {/* Active indicator — edges spring independently */}
        <motion.div
          className="absolute inset-x-0 bg-[#6CE5E8]"
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

/* ── Progress Bar ────────────────────────────────────────────────── */
function SectionProgress({ current, total }: { current: number; total: number }) {
  const progress = ((current + 1) / total) * 100;
  return (
    <div className="fixed top-0 left-0 right-0 z-55 h-0.5 bg-transparent">
      <motion.div
        className="h-full bg-[#6CE5E8]"
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

  // Phones scroll natively like Endfield's H5 site; fullpage transitions are desktop/tablet only
  const [isMobile, setIsMobile] = useState(false);
  const isMobileRef = useRef(false);
  const [seen, setSeen] = useState<boolean[]>(() => SECTIONS.map(() => false));

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
          el.addEventListener('transitionend', () => {
            el.remove();
            setContentReady(true);
          }, { once: true });
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
    const fromWatermark = SECTIONS[currentIndex].watermark;
    const toWatermark = SECTIONS[targetIndex].watermark;

    lockedRef.current = true;
    setTransitioning(true);
    wheelAccum.current = 0;

    // Phase 1: Fade out section content; drifted watermark glides home
    setContentReady(false);
    setSectionVisible(false);
    drift.set(0);
    await delay(300);

    // Phase 2: Watermark becomes prominent
    setWatermarkProminent(true);
    setCursorVisible(true);
    await delay(150);

    // Phase 3: Delete old watermark char by char
    if (fromWatermark) {
      for (let i = fromWatermark.length; i >= 0; i--) {
        showWatermark(fromWatermark.slice(0, i));
        await delay(25);
      }
    }

    // If nothing to type next, dismiss cursor before bg transition
    if (!toWatermark) {
      setCursorVisible(false);
      setWatermarkProminent(false);
    }

    // Phase 4: Background color + text color transition
    setBgColor(SECTIONS[targetIndex].bg);
    setBgIsDark(SECTIONS[targetIndex].isDark);
    await delay(350);

    // Phase 5: Type new watermark char by char + settle
    if (toWatermark) {
      for (let i = 0; i <= toWatermark.length; i++) {
        showWatermark(toWatermark.slice(0, i));
        await delay(40);
      }

      // Phase 6: Settle — watermark returns to subtle
      await delay(250);
      setCursorVisible(false);
      setWatermarkProminent(false);
      await delay(150);
    }

    // Phase 7: Switch section + reveal
    activeIndexRef.current = targetIndex;
    setActiveIndex(targetIndex);
    const wrapper = sectionRefs.current[targetIndex];
    if (wrapper) wrapper.scrollTop = 0;
    await delay(50);

    setSectionVisible(true);
    await delay(300);

    // Phase 8: Content entrance animations
    setContentReady(true);
    setTransitioning(false);

    // Post-transition cooldown — absorbs trackpad momentum
    wheelAccum.current = 0;
    setTimeout(() => { lockedRef.current = false; }, 600);
  }, [drift, showWatermark]); // stable — uses refs and a motion value, not state

  /* ── Scroll-linked watermark drift (desktop: active section's own scroll) ── */
  useEffect(() => {
    if (isMobile) return;
    const el = sectionRefs.current[activeIndex];
    if (!el) return;
    const onScroll = () => drift.set(-el.scrollTop * 0.5);
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [activeIndex, isMobile, drift]);

  /* ── Mobile: native scroll drives the active section ─────────── */
  const typeToken = useRef(0);
  const retypeWatermark = useCallback(async (to: string) => {
    const token = ++typeToken.current;
    const alive = () => token === typeToken.current; // a newer section took over
    setWatermarkProminent(true);
    setCursorVisible(true);
    while (watermarkRef.current && alive()) {
      showWatermark(watermarkRef.current.slice(0, -1));
      await delay(25);
    }
    for (let i = 1; i <= to.length && alive(); i++) {
      showWatermark(to.slice(0, i));
      await delay(40);
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
    };
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
      if (isMobileRef.current) return;
      e.preventDefault(); // Always prevent — we handle all scrolling manually

      if (lockedRef.current) return;

      // Normalize delta (Firefox uses deltaMode 1 = lines)
      let delta = e.deltaY;
      if (e.deltaMode === 1) delta *= 40;
      else if (e.deltaMode === 2) delta *= window.innerHeight;

      const now = Date.now();
      if (now - lastWheelTime.current > 200) {
        wheelAccum.current = 0;
      }
      lastWheelTime.current = now;

      const idx = activeIndexRef.current;
      const wrapper = sectionRefs.current[idx];

      // Handle internal section scroll
      if (wrapper && delta !== 0 && hasRoom(wrapper, Math.sign(delta))) {
        wrapper.scrollTop += delta;
        wheelAccum.current = 0;
        return;
      }

      // At boundary or no internal scroll — accumulate for page transition
      wheelAccum.current += delta;

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
  }, [navigateToSection]);

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
        {/* Background layer — transitions between section bg colors */}
        <motion.div
          className="fixed inset-0 z-0"
          animate={{ backgroundColor: bgColor }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* Shared watermark — persists between sections, typewriter animates directly */}
        {/* On phones the sections paint their own bg, so the watermark floats above them */}
        <div className={`fixed top-16 left-0 md:left-[120px] lg:left-[160px] right-0 ${isMobile ? 'z-3' : 'z-1'} pointer-events-none select-none overflow-hidden px-4 md:px-8`}>
          <motion.div
            className="text-[8rem] md:text-[12rem] font-black leading-none tracking-tight text-display whitespace-nowrap"
            style={{ x: driftSmooth }}
            animate={{
              color: bgIsDark
                ? (watermarkProminent ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.03)')
                : (watermarkProminent ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.03)')
            }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {watermarkText}
            <AnimatePresence>
              {cursorVisible && (
                <motion.span
                  className="inline-block w-[3px] md:w-[4px] h-[0.75em] ml-1 align-middle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <span className="block w-full h-full bg-[#6CE5E8] animate-blink" />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        <Navigation currentSection={SECTIONS[activeIndex].id} isDark={bgIsDark} onNavigate={handleNavigate} bgmPlaying={bgmPlaying} onBGMToggle={toggleBGM} bgmAnalyser={bgmAnalyserRef} />
        <SectionProgress current={activeIndex} total={SECTIONS.length} />
        <SectionDots current={activeIndex} total={SECTIONS.length} isDark={bgIsDark} />

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
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              style={isMobile ? { backgroundColor: section.bg } : { visibility: isActive ? 'visible' : 'hidden' }}
            >
              {i === 0 && <HeroSection isReady={ready} />}
              {i === 1 && <AboutSection isReady={ready} />}
              {i === 2 && <ProjectsSection projects={projects} isReady={ready} />}
              {i === 3 && <SkillsSection isReady={ready} />}
              {i === 4 && <GallerySection isReady={ready} />}
            </motion.div>
          );
        })}

        <Cursor />
      </div>
    </MotionConfig>
  );
}
