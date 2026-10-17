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
      // The sub-index is the project picker (AK's boxed list)
      subIndex={projects.map((project, i) => ({
        key: project.slug,
        label: `${pad(i + 1)}  ${project.title}`,
        active: i === featuredIndex,
        onSelect: () => setFeaturedIndex(i),
      }))}
      description="开源作品与个人项目，涵盖播放器、桌面工具、Flarum 插件与 API 服务。"
    >
      <motion.div className="relative" initial={{ y: 15, opacity: 0 }} animate={showY} transition={t(0.3)}>
        <AnimatePresence mode="wait">
          {featured && (
            <motion.div
              key={featured.slug}
              initial="hidden"
              animate="shown"
              exit="hidden"
              variants={{ shown: { transition: { staggerChildren: 0.05 } } }}
            >
              {/* Case meta row */}
              <motion.div
                className="flex items-center justify-between gap-6 border-t border-white/20 pt-3 font-bebas text-[14px] tracking-[0.08em] text-white/45"
                variants={{ hidden: { opacity: 0 }, shown: { opacity: 1 } }}
                transition={swap}
              >
                <span className="text-white shrink-0">CASE {pad(featuredIndex + 1)} <span className="text-white/40">/ {pad(projects.length)}</span></span>
                <span className="truncate">{featured.tags.join(' / ')}</span>
              </motion.div>

              {/* Giant cropped case number */}
              <div className="overflow-hidden h-[7rem] md:h-[11rem] -mb-2">
                <motion.div
                  className="font-bebas text-[10rem] md:text-[16rem] leading-[0.78] text-[#6CE5E8] tabular-nums"
                  variants={{ hidden: { y: '100%' }, shown: { y: '0%' } }}
                  transition={swap}
                >
                  {pad(featuredIndex + 1)}
                </motion.div>
              </div>

              <div className="overflow-hidden">
                <motion.h3
                  className="text-3xl md:text-5xl font-bold tracking-[-0.02em] leading-[1.1] text-[#F0F0F0] text-display"
                  variants={{ hidden: { y: '110%' }, shown: { y: '0%' } }}
                  transition={swap}
                >
                  {featured.title}
                </motion.h3>
              </div>

              <motion.p
                className="mt-5 text-base text-white/55 leading-relaxed max-w-xl"
                variants={{ hidden: { opacity: 0 }, shown: { opacity: 1 } }}
                transition={swap}
              >
                {featured.description}
              </motion.p>

              <motion.div
                className="flex flex-wrap items-center gap-x-6 gap-y-4 mt-8"
                variants={{ hidden: { opacity: 0 }, shown: { opacity: 1 } }}
                transition={swap}
              >
                {featuredHref && (
                  /* AK's cyan "更多情报 / READ MORE" block */
                  <a
                    href={featuredHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-10 pl-3 pr-4 py-2 bg-[#6CE5E8] text-black hover:bg-white transition-colors duration-300"
                  >
                    <span className="leading-none">
                      <span className="block font-bold text-sm">查看项目</span>
                      <span className="block font-bebas text-[11px] tracking-[0.1em] mt-1">VIEW PROJECT</span>
                    </span>
                    <span className="transition-transform duration-300 group-hover:translate-x-1">›</span>
                  </a>
                )}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrev}
                    aria-label="Previous project"
                    className="w-10 h-10 border border-white/20 flex items-center justify-center text-white/60 hover:border-[#6CE5E8] hover:text-[#6CE5E8] transition-colors duration-300"
                  >
                    ‹
                  </button>
                  <button
                    onClick={handleNext}
                    aria-label="Next project"
                    className="w-10 h-10 border border-white/20 flex items-center justify-center text-white/60 hover:border-[#6CE5E8] hover:text-[#6CE5E8] transition-colors duration-300"
                  >
                    ›
                  </button>
                </div>
                <a
                  href="https://github.com/Burial0268"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bebas text-[15px] tracking-[0.08em] text-white/50 hover:text-[#6CE5E8] transition-colors duration-300"
                >
                  GITHUB / 查看更多 →
                </a>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Segmented progress — one segment per project */}
        <div className="flex gap-1.5 mt-10">
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
      </motion.div>
    </SectionShell>
  );
}
