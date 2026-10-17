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
  featured: boolean;
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
  const swap = { duration: 0.45, ease: EASE };

  const [featuredIndex, setFeaturedIndex] = useState(0);

  // Reset to first project when section becomes ready
  useEffect(() => {
    if (isReady) setFeaturedIndex(0);
  }, [isReady]);

  const featured = projects[featuredIndex];
  const featuredHref = featured?.link || featured?.github;

  const handlePrev = () => setFeaturedIndex((prev) => (prev - 1 + projects.length) % projects.length);
  const handleNext = () => setFeaturedIndex((prev) => (prev + 1) % projects.length);

  return (
    <SectionShell
      label="SELECTED WORKS"
      en="Projects"
      zh="精选项目"
      isDark={true}
      isReady={isReady}
      // The sub-index is the project picker (AK's boxed list) — useful on phones too
      subIndexOnMobile
      subIndex={projects.map((project, i) => ({
        key: project.slug,
        label: `${pad(i + 1)}  ${project.title}`,
        active: i === featuredIndex,
        onSelect: () => setFeaturedIndex(i),
      }))}
      description="开源作品与个人项目，涵盖播放器、桌面工具、Flarum 插件与 API 服务。"
    >
      <motion.div initial={{ y: 15, opacity: 0 }} animate={showY} transition={t(0.3)}>
        {/* Case meta row */}
        <div className="flex items-center justify-between gap-6 border-t border-white/80 pt-3 font-bebas text-[15px] leading-none tracking-[0.06em] text-white/45">
          <span className="text-white shrink-0">CASE {pad(featuredIndex + 1)} <span className="text-white/40">/ {pad(projects.length)}</span></span>
          <span className="truncate">{featured?.tags.join(' / ')}</span>
        </div>

        <AnimatePresence mode="wait">
          {featured && (
            <motion.div
              key={featured.slug}
              className="grid md:grid-cols-9 gap-x-12 gap-y-6 mt-8 short:mt-6"
              initial="hidden"
              animate="shown"
              exit="hidden"
              variants={{ shown: { transition: { staggerChildren: 0.05 } } }}
            >
              {/* Number — its own column, never under the title */}
              <div className="md:col-span-3 overflow-hidden">
                <motion.div
                  className="font-bebas text-[clamp(7rem,13vw,12rem)] short:text-[clamp(6rem,10vw,9rem)] leading-[0.8] text-[#6CE5E8] tabular-nums"
                  variants={{ hidden: { y: '100%' }, shown: { y: '0%' } }}
                  transition={swap}
                >
                  {pad(featuredIndex + 1)}
                </motion.div>
              </div>

              <div className="md:col-span-6 min-w-0">
                <div className="overflow-hidden">
                  <motion.h3
                    className="text-[clamp(1.75rem,3vw,3rem)] font-bold leading-[1.15] text-[#F0F0F0]"
                    variants={{ hidden: { y: '110%' }, shown: { y: '0%' } }}
                    transition={swap}
                  >
                    {featured.title}
                  </motion.h3>
                </div>

                <motion.p
                  className="mt-4 text-[15px] text-white/55 leading-relaxed max-w-[32em]"
                  variants={{ hidden: { opacity: 0 }, shown: { opacity: 1 } }}
                  transition={swap}
                >
                  {featured.description}
                </motion.p>

                <motion.div
                  className="flex flex-wrap items-center gap-x-6 gap-y-4 mt-8 short:mt-6"
                  variants={{ hidden: { opacity: 0 }, shown: { opacity: 1 } }}
                  transition={swap}
                >
                  {featuredHref && (
                    /* AK's cyan "更多情报 / READ MORE" block */
                    <a
                      href={featuredHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-12 pl-4 pr-4 py-2.5 bg-[#6CE5E8] text-black hover:bg-white transition-colors duration-300"
                    >
                      <span className="leading-none">
                        <span className="block font-bold text-[15px]">查看项目</span>
                        <span className="block font-bebas text-[12px] tracking-[0.1em] mt-1">VIEW PROJECT</span>
                      </span>
                      <span className="transition-transform duration-300 group-hover:translate-x-1">›</span>
                    </a>
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrev}
                      aria-label="Previous project"
                      className="w-11 h-11 border border-white/20 flex items-center justify-center text-white/60 hover:border-[#6CE5E8] hover:text-[#6CE5E8] transition-colors duration-300"
                    >
                      ‹
                    </button>
                    <button
                      onClick={handleNext}
                      aria-label="Next project"
                      className="w-11 h-11 border border-white/20 flex items-center justify-center text-white/60 hover:border-[#6CE5E8] hover:text-[#6CE5E8] transition-colors duration-300"
                    >
                      ›
                    </button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Segmented progress — one segment per project */}
        <div className="flex gap-1.5 mt-12 short:mt-8">
          {projects.map((project, i) => (
            <span key={project.slug} className="relative flex-1 h-0.5 bg-white/15 overflow-hidden">
              <motion.span
                className="absolute inset-0 bg-[#6CE5E8] origin-left"
                initial={false}
                animate={{ scaleX: i === featuredIndex ? 1 : 0 }}
                transition={swap}
              />
            </span>
          ))}
        </div>
        <a
          href="https://github.com/Burial0268"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-4 font-bebas text-[15px] leading-none tracking-[0.06em] text-white/50 hover:text-[#6CE5E8] transition-colors duration-300"
        >
          GITHUB / 查看更多 ↗
        </a>
      </motion.div>
    </SectionShell>
  );
}
