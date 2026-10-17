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

export default function ProjectsSection({ projects, isReady = false }: ProjectsSectionProps) {
  const showY = isReady ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 };
  const t = (delay: number) =>
    isReady
      ? { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const }
      : { duration: 0.3, delay: 0 };
  const swap = { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const };

  const [featuredIndex, setFeaturedIndex] = useState(0);

  // Reset to first project when section becomes ready
  useEffect(() => {
    if (isReady) setFeaturedIndex(0);
  }, [isReady]);

  const featured = projects[featuredIndex];
  const featuredHref = featured?.link || featured?.github;

  const handlePrev = () => {
    setFeaturedIndex((prev) => (prev - 1 + projects.length) % projects.length);
  };

  const handleNext = () => {
    setFeaturedIndex((prev) => (prev + 1) % projects.length);
  };

  return (
    <SectionShell index={3} total={5} en="Works" zh="作品" heading="精选项目" isDark={true} isReady={isReady}>
      <div className="grid md:grid-cols-4 gap-y-12 mb-12">
        {/* Case detail — 2 columns */}
        <motion.div
          className="md:col-span-2 md:pr-12"
          initial={{ y: 20, opacity: 0 }}
          animate={showY}
          transition={t(0.3)}
        >
          <AnimatePresence mode="wait">
            {featured && (
              <motion.div
                key={featured.slug}
                initial="hidden"
                animate="shown"
                exit="hidden"
                variants={{ shown: { transition: { staggerChildren: 0.05 } } }}
              >
                <div className="flex items-end justify-between gap-6 border-t border-white/80 pt-3 meta text-white/50">
                  <span className="text-white shrink-0">Case {pad(featuredIndex + 1)}</span>
                  <span className="truncate">{featured.tags.join(' / ')}</span>
                </div>

                <div className="overflow-hidden mt-6">
                  <motion.div
                    className="text-display text-[clamp(6rem,14vw,12rem)] text-[#6CE5E8] tabular-nums"
                    variants={{ hidden: { y: '100%' }, shown: { y: '0%' } }}
                    transition={swap}
                  >
                    {pad(featuredIndex + 1)}
                  </motion.div>
                </div>

                <div className="overflow-hidden mt-6">
                  <motion.h3
                    className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-[-0.035em] leading-[1.05] text-[#F0F0F0]"
                    variants={{ hidden: { y: '110%' }, shown: { y: '0%' } }}
                    transition={swap}
                  >
                    {featured.title}
                  </motion.h3>
                </div>

                <motion.p
                  className="mt-5 text-base text-white/55 leading-relaxed max-w-lg"
                  variants={{ hidden: { opacity: 0 }, shown: { opacity: 1 } }}
                  transition={swap}
                >
                  {featured.description}
                </motion.p>

                {featuredHref && (
                  <motion.a
                    href={featuredHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-3 mt-8 meta text-[#6CE5E8] hover:text-white transition-colors duration-300"
                    variants={{ hidden: { opacity: 0 }, shown: { opacity: 1 } }}
                    transition={swap}
                  >
                    <span className="border-b border-current pb-0.5">View Project / 查看项目</span>
                    <span className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">↗</span>
                  </motion.a>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Index table — 2 columns */}
        <motion.div
          className="md:col-span-2"
          initial={{ y: 20, opacity: 0 }}
          animate={showY}
          transition={t(0.4)}
        >
          <div className="grid grid-cols-[3rem_1fr_auto] border-t border-white/80 pt-3 pb-3 px-2 meta text-white/50">
            <span>No.</span>
            <span>Project</span>
            <span className="text-right">Stack</span>
          </div>
          {projects.map((project, i) => {
            const isActive = i === featuredIndex;
            return (
              <button
                key={project.slug}
                onClick={() => setFeaturedIndex(i)}
                aria-current={isActive}
                className="group relative w-full grid grid-cols-[3rem_1fr_auto] items-baseline gap-x-2 text-left border-t border-white/10 py-4 px-2 overflow-hidden"
              >
                {/* Hover/active fill sweeps in from the left */}
                <span
                  className={`absolute inset-0 bg-[#6CE5E8] origin-left transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                />
                <span className={`relative meta transition-colors duration-300 ${isActive ? 'text-black' : 'text-white/35 group-hover:text-black'}`}>
                  {pad(i + 1)}
                </span>
                <span
                  className={`relative text-base md:text-lg font-semibold tracking-[-0.02em] transition-all duration-300 group-hover:translate-x-1 ${
                    isActive ? 'text-black' : 'text-[#F0F0F0] group-hover:text-black'
                  }`}
                >
                  {project.title}
                </span>
                <span className={`relative meta text-right hidden sm:block transition-colors duration-300 ${isActive ? 'text-black/60' : 'text-white/35 group-hover:text-black/60'}`}>
                  {project.tags[0]}
                </span>
              </button>
            );
          })}
          <div className="border-t border-white/10" />
        </motion.div>
      </div>

      {/* Controls */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 items-center border-t border-white/10 pt-4"
        initial={{ y: 20, opacity: 0 }}
        animate={showY}
        transition={t(0.5)}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrev}
            aria-label="Previous project"
            className="w-10 h-10 border border-white/20 flex items-center justify-center text-white/60 hover:bg-[#6CE5E8] hover:border-[#6CE5E8] hover:text-black transition-colors duration-300"
          >
            ←
          </button>
          <button
            onClick={handleNext}
            aria-label="Next project"
            className="w-10 h-10 border border-white/20 flex items-center justify-center text-white/60 hover:bg-[#6CE5E8] hover:border-[#6CE5E8] hover:text-black transition-colors duration-300"
          >
            →
          </button>
        </div>
        <span className="meta text-white/40 tabular-nums hidden md:block">
          {pad(featuredIndex + 1)} / {pad(projects.length)}
        </span>
        <a
          href="https://github.com/Burial0268"
          target="_blank"
          rel="noopener noreferrer"
          className="group md:col-span-2 justify-self-end meta text-[#6CE5E8] hover:text-white transition-colors duration-300"
        >
          <span className="border-b border-current pb-0.5">GitHub / 查看更多</span>{' '}
          <span className="inline-block transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">↗</span>
        </a>
      </motion.div>
    </SectionShell>
  );
}
