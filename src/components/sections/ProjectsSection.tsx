import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import SectionShell, { pad } from '../SectionShell';
import Typed from '../effects/Typed';

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
          <Typed className="truncate" text={featured?.tags.join(' / ') ?? ''} play={isReady} delay={400} />
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
                {/* Title is retyped (backspace to the common prefix, then type) — the watermark's typewriter at heading size */}
                <h3 className="text-(length:--fs) font-bold leading-[1.15] text-[#F0F0F0] line-clamp-2">
                  <Typed text={featured.title} play={isReady} delay={300} />
                </h3>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.p
                    key={featured.slug}
                    className="mt-4 text-[15px] text-white/55 leading-relaxed max-w-[32em] line-clamp-4 md:line-clamp-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                    transition={{ ...swap, delay: 0.2 }}
                  >
                    {featured.description}
                  </motion.p>
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
