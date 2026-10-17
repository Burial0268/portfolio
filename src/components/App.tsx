import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence, MotionConfig, useMotionValue } from 'motion/react';
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
  { id: 'home', word: '', bg: '#0A0A0A', isDark: true },
  { id: 'about', word: 'ABOUT', bg: '#FAFAFA', isDark: false },
  { id: 'projects', word: 'WORKS', bg: '#0A0A0A', isDark: true },
  { id: 'skills', word: 'SKILLS', bg: '#FFFFFF', isDark: false },
  { id: 'gallery', word: 'GALLERY', bg: '#0A0A0A', isDark: true },
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
  const [contentReady, setContentReady] = useState(false);
  const [sectionVisible, setSectionVisible] = useState(true);

  // Giant section word (Endfield-style): which section's word is shown, and travel direction
  const [wordIndex, setWordIndex] = useState(0);
  const [dir, setDir] = useState(1);
  // Word drifts sideways while the active section scrolls internally
  const drift = useMotionValue(0);

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

    lockedRef.current = true;
    wheelAccum.current = 0;

    // Phase 1: Fade out section content
    setContentReady(false);
    setSectionVisible(false);
    await delay(250);

    // Phase 2: Giant words pass each other (old slides out, new slides in) while the bg flips
    setDir(targetIndex > activeIndexRef.current ? 1 : -1);
    setWordIndex(targetIndex);
    setBgColor(SECTIONS[targetIndex].bg);
    setBgIsDark(SECTIONS[targetIndex].isDark);
    await delay(450);

    // Phase 3: Switch section + reveal
    activeIndexRef.current = targetIndex;
    setActiveIndex(targetIndex);
    const wrapper = sectionRefs.current[targetIndex];
    if (wrapper) wrapper.scrollTop = 0;
    drift.set(0);
    await delay(50);

    setSectionVisible(true);
    await delay(250);

    // Phase 4: Content entrance animations
    setContentReady(true);

    // Post-transition cooldown — absorbs trackpad momentum
    wheelAccum.current = 0;
    setTimeout(() => { lockedRef.current = false; }, 500);
  }, [drift]); // stable — uses refs and a motion value, not state

  /* ── Scroll-linked drift of the giant word ───────────────────── */
  useEffect(() => {
    const el = sectionRefs.current[activeIndex];
    if (!el) return;
    const onScroll = () => drift.set(-el.scrollTop * 0.6);
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [activeIndex, drift]);

  /* ── Wheel handler with accumulator ──────────────────────────── */
  useEffect(() => {
    const THRESHOLD = 80;

    const handleWheel = (e: WheelEvent) => {
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
      if (lockedRef.current) return;

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
      if (lockedRef.current) return;

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
    if (idx >= 0) navigateToSection(idx);
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
  const gridColor = bgIsDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

  return (
    <MotionConfig reducedMotion="user">
      <div className="fixed inset-0 overflow-hidden">
        {/* Background layer — transitions between section bg colors */}
        <motion.div
          className="fixed inset-0 z-0"
          animate={{ backgroundColor: bgColor }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* Swiss grid — hairline column guides aligned to the page margin */}
        <div className="fixed inset-0 z-1 pointer-events-none page-x" aria-hidden="true">
          <div
            className="h-full grid grid-cols-2 md:grid-cols-4 border-r transition-colors duration-500"
            style={{ borderColor: gridColor }}
          >
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-full border-l transition-colors duration-500 ${i > 1 ? 'hidden md:block' : ''}`}
                style={{ borderColor: gridColor }}
              />
            ))}
          </div>
        </div>

        {/* Giant section word — slides through on section change, drifts with in-section scroll */}
        <div
          className="fixed inset-x-0 bottom-0 z-1 pointer-events-none select-none overflow-hidden h-[40vh]"
          style={{ '--stroke': bgIsDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.09)' } as React.CSSProperties}
          aria-hidden="true"
        >
          <AnimatePresence initial={false} custom={dir}>
            {SECTIONS[wordIndex].word && (
              <motion.div
                key={SECTIONS[wordIndex].word}
                custom={dir}
                className="absolute bottom-0 left-0 page-x"
                variants={{
                  enter: (d: number) => ({ x: d > 0 ? '75vw' : '-75vw' }),
                  center: { x: 0 },
                  exit: (d: number) => ({ x: d > 0 ? '-75vw' : '75vw' }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.div
                  className="text-display text-outline whitespace-nowrap text-[28vw] leading-[0.74] translate-y-[12%]"
                  style={{ x: drift }}
                >
                  {SECTIONS[wordIndex].word}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Navigation currentSection={SECTIONS[activeIndex].id} isDark={bgIsDark} onNavigate={handleNavigate} bgmPlaying={bgmPlaying} onBGMToggle={toggleBGM} bgmAnalyser={bgmAnalyserRef} />
        <SectionProgress current={activeIndex} total={SECTIONS.length} />
        <SectionDots current={activeIndex} total={SECTIONS.length} isDark={bgIsDark} />

        {/* Section Layers — transparent bg, content only */}
        {SECTIONS.map((section, i) => {
          const isActive = i === activeIndex;
          return (
            <motion.div
              key={section.id}
              ref={(el) => { sectionRefs.current[i] = el; }}
              className={`absolute inset-0 z-2 section-scroll ${
                isActive ? 'overflow-y-auto' : 'overflow-hidden pointer-events-none'
              }`}
              animate={{
                opacity: isActive && sectionVisible ? 1 : 0,
              }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              style={{
                visibility: isActive ? 'visible' : 'hidden',
              }}
            >
              {i === 0 && <HeroSection isReady={contentReady && isActive} />}
              {i === 1 && <AboutSection isReady={contentReady && isActive} />}
              {i === 2 && <ProjectsSection projects={projects} isReady={contentReady && isActive} />}
              {i === 3 && <SkillsSection isReady={contentReady && isActive} />}
              {i === 4 && <GallerySection isReady={contentReady && isActive} />}
            </motion.div>
          );
        })}

        <Cursor />
      </div>
    </MotionConfig>
  );
}
