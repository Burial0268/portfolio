import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import SectionShell, { pad } from '../SectionShell';

interface Project {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  link?: string;
  github?: string;
  order: number;
}

interface ProjectsSectionProps {
  projects: Project[];
  isReady?: boolean;
}

const EASE = [0.22, 1, 0.36, 1] as const;

/*
 * Project signature: a constructivist strip of blocks seeded by the project's slug — every case gets its own
 * mark in the same vocabulary as the Skills composition (ink / cyan / outline / hatch). Deterministic, so SSR
 * and the client agree, and a project always draws the same strip.
 */
const SIG_COLS = 36, SIG_ROWS = 3;
type Cell = 'fill' | 'cyan' | 'line' | 'hatch';
interface Seg { r: number; c: number; w: number; kind: Cell }

const hash = (s: string) => {
  let h = 2166136261; // FNV-1a
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
};
const rng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0; // mulberry32
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

function signature(slug: string): Seg[] {
  const rand = rng(hash(slug));
  const segs: Seg[] = [];
  for (let r = 0; r < SIG_ROWS; r++) {
    let c = Math.floor(rand() * 3);
    while (c < SIG_COLS) {
      const w = 1 + Math.floor(rand() ** 1.6 * 7);
      const p = rand();
      // mostly ink and outline; cyan stays the accent
      const kind: Cell = p < 0.34 ? 'fill' : p < 0.6 ? 'line' : p < 0.82 ? 'hatch' : 'cyan';
      segs.push({ r, c, w: Math.min(w, SIG_COLS - c), kind });
      c += w + 1 + Math.floor(rand() ** 2 * 4); // gaps of 1–4 cells
    }
  }
  return segs;
}

const CELL: Record<Cell, string> = {
  fill: 'bg-white/85',
  cyan: 'bg-[#6CE5E8]',
  line: 'border border-white/40',
  hatch: 'bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.45)_0_1px,transparent_1px_5px)]',
};

function Signature({ slug, play }: { slug: string; play: boolean }) {
  const segs = signature(slug);
  return (
    <div>
      <div className="flex items-center justify-between pb-2 font-mono text-[10px] tracking-[0.2em] text-white/35">
        <span>SIGNATURE // {slug.toUpperCase()}</span>
        <span className="tabular-nums">0x{hash(slug).toString(16).toUpperCase().padStart(8, '0')}</span>
      </div>
      <div
        className="grid gap-[3px] h-[72px] short:h-[52px]"
        style={{ gridTemplateColumns: `repeat(${SIG_COLS}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${SIG_ROWS}, minmax(0, 1fr))` }}
        aria-hidden="true"
      >
        {segs.map((s) => (
          <motion.span
            key={`${s.r}-${s.c}`}
            className={`block origin-left ${CELL[s.kind]}`}
            style={{ gridRow: s.r + 1, gridColumn: `${s.c + 1} / span ${s.w}` }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: play ? 1 : 0 }}
            transition={play ? { duration: 0.5, delay: 0.3 + s.c * 0.012 + s.r * 0.04, ease: EASE } : { duration: 0.2 }}
          />
        ))}
      </div>
    </div>
  );
}

export default function ProjectsSection({ projects, isReady = false }: ProjectsSectionProps) {
  const showY = isReady ? { y: 0, opacity: 1 } : { y: 15, opacity: 0 };
  const t = (delay: number) =>
    isReady ? { duration: 0.6, delay, ease: EASE } : { duration: 0.3, delay: 0 };
  const swap = { duration: 0.35, ease: EASE };

  const [featuredIndex, setFeaturedIndex] = useState(0);

  // Reset to first project when section becomes ready
  useEffect(() => {
    if (isReady) setFeaturedIndex(0);
  }, [isReady]);

  // ←/→ browse projects
  useEffect(() => {
    if (!isReady) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      else if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isReady, projects.length]);

  const featured = projects[featuredIndex];
  const featuredHref = featured?.link || featured?.github;

  const handlePrev = () => setFeaturedIndex((prev) => (prev - 1 + projects.length) % projects.length);
  const handleNext = () => setFeaturedIndex((prev) => (prev + 1) % projects.length);

  return (
    <SectionShell
      no={2}
      label="SELECTED WORKS"
      en="Projects"
      zh="精选项目"
      isDark={true}
      isReady={isReady}
      description="开源作品与个人项目，涵盖播放器、桌面工具、Flarum 插件与 API 服务。"
    >
      <motion.div initial={{ y: 15, opacity: 0 }} animate={showY} transition={t(0.3)}>
        {/* Indicator = the content's top rule: one clickable segment per project */}
        <div className="flex gap-1.5">
          {projects.map((project, i) => (
            <button
              key={project.slug}
              onClick={() => setFeaturedIndex(i)}
              aria-label={project.title}
              title={project.title}
              aria-current={i === featuredIndex}
              data-cursor={`CASE ${pad(i + 1)}`}
              className="group flex-1 h-4 flex items-start"
            >
              <span className="relative block w-full h-0.5 bg-white/20 group-hover:bg-white/40 transition-colors duration-300 overflow-hidden">
                <motion.span
                  className="absolute inset-0 bg-[#6CE5E8] origin-left"
                  initial={false}
                  animate={{ scaleX: i === featuredIndex ? 1 : 0 }}
                  transition={swap}
                />
              </span>
            </button>
          ))}
        </div>

        {/* Case meta row */}
        <div className="flex items-center justify-between gap-6 pt-1 font-bebas text-[15px] leading-none tracking-[0.06em] text-white/45">
          <span className="text-white shrink-0">CASE <span className="text-white/40">/ {pad(projects.length)}</span></span>
          <span className="truncate">{featured?.tags.join(' / ')}</span>
        </div>

        {featured && (
          <div className="grid md:grid-cols-9 gap-x-12 gap-y-6 mt-8 short:mt-6">
            {/* Number — its own column, never under the title. Rolls through a mask, old and new overlap */}
            <div className="md:col-span-3 relative overflow-hidden">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={featured.slug}
                  className="font-bebas text-[clamp(7rem,13vw,12rem)] short:text-[clamp(6rem,10vw,9rem)] leading-[0.8] text-[#6CE5E8] tabular-nums"
                  initial={{ y: '100%' }}
                  animate={{ y: '0%' }}
                  exit={{ y: '-100%' }}
                  transition={swap}
                >
                  {pad(featuredIndex + 1)}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="md:col-span-6 min-w-0 [--fs:clamp(1.75rem,3vw,3rem)]">
              {/* Reserve room for a 2-line title + longest description so the CTA row and arrows never move between projects */}
              <div className="relative min-h-[calc(var(--fs)*2.3+1rem+6.2rem)] md:min-h-[calc(var(--fs)*2.3+1rem+4.6rem)]">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div
                    key={featured.slug}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                    transition={swap}
                  >
                    <h3 className="text-(length:--fs) font-bold leading-[1.15] text-[#F0F0F0] line-clamp-2">{featured.title}</h3>
                    <p className="mt-4 text-[15px] text-white/55 leading-relaxed max-w-[32em] line-clamp-4 md:line-clamp-3">{featured.description}</p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Static row: stays put (and keeps focus) while the content above swaps */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-4 mt-8 short:mt-6">
                {featuredHref && (
                  /* AK's cyan "更多情报 / READ MORE" block */
                  <a
                    href={featuredHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor="OPEN"
                    className="group inline-flex items-center gap-12 pl-4 pr-4 py-2.5 bg-[#6CE5E8] text-black hover:bg-white transition-colors duration-300"
                  >
                    <span className="leading-none">
                      <span className="block font-bold text-[15px]">查看项目</span>
                      <span className="block font-bebas text-[12px] tracking-[0.1em] mt-1">VIEW PROJECT</span>
                    </span>
                    <span className="transition-transform duration-300 group-hover:translate-x-1">›</span>
                  </a>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    onClick={handlePrev}
                    aria-label="Previous project"
                    data-cursor="PREV"
                    className="w-[51px] h-[51px] border border-white/20 flex items-center justify-center text-white/60 hover:border-[#6CE5E8] hover:text-[#6CE5E8] transition-colors duration-300"
                  >
                    ‹
                  </button>
                  <button
                    onClick={handleNext}
                    aria-label="Next project"
                    data-cursor="NEXT"
                    className="w-[51px] h-[51px] border border-white/20 flex items-center justify-center text-white/60 hover:border-[#6CE5E8] hover:text-[#6CE5E8] transition-colors duration-300"
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Signature strip — redraws left → right on every case */}
        {featured && (
          <div className="mt-12 short:mt-8">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={featured.slug} exit={{ opacity: 0, transition: { duration: 0.12 } }}>
                <Signature slug={featured.slug} play={isReady} />
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        <a
          href="https://github.com/Burial0268"
          target="_blank"
          rel="noopener noreferrer"
          data-cursor="GITHUB"
          className="inline-block mt-12 short:mt-8 font-bebas text-[15px] leading-none tracking-[0.06em] text-white/50 hover:text-[#6CE5E8] transition-colors duration-300"
        >
          GITHUB / 查看更多 ↗
        </a>
      </motion.div>
    </SectionShell>
  );
}
