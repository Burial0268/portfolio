import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Badge } from '@/components/ui/badge';
import SectionShell from '../SectionShell';

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
  const showL = isReady ? { x: 0, opacity: 1 } : { x: -20, opacity: 0 };
  const showR = isReady ? { x: 0, opacity: 1 } : { x: 20, opacity: 0 };
  const showY = isReady ? { y: 0, opacity: 1 } : { y: 15, opacity: 0 };
  const t = (delay: number) =>
    isReady
      ? { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const }
      : { duration: 0.3, delay: 0 };

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
    <SectionShell
      sidebarLabel="作品"
      sidebarVerticalText="WORKS"
      isDark={true}
      tagLine="▼ / BURIAL0268"
      badgeText="PROJECTS"
      heading="精选项目"
      metaLine="// SUPER::PORTFOLIO::WORKS::GET()"
      isReady={isReady}
    >
      {/* Featured + compact list layout */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 mb-10">
        {/* Featured card (60%) */}
        <motion.div
          className="lg:w-[60%]"
          initial={{ x: -20, opacity: 0 }}
          animate={showL}
          transition={t(0.3)}
        >
          <AnimatePresence mode="wait">
            {featured && (
              <motion.div
                key={featured.slug}
                className="group bg-[#141414] border border-white/8 p-8 md:p-10 h-full flex flex-col"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="text-[5rem] md:text-[7rem] font-black text-white/5 text-display leading-none mb-4">
                  {String(featuredIndex + 1).padStart(2, '0')}
                </span>

                <h3 className="text-2xl md:text-3xl font-bold text-[#F0F0F0] mb-4 text-display">
                  {featured.title}
                </h3>

                <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-1">
                  {featured.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {featured.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="border-white/10 text-gray-400 rounded-none text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {featuredHref && (
                  <a
                    href={featuredHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="self-start text-xs uppercase tracking-widest text-[#6CE5E8] font-bold hover:text-white transition-colors duration-300"
                  >
                    VIEW PROJECT →
                  </a>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Compact list (40%) */}
        <motion.div
          className="lg:w-[40%] flex flex-col gap-0"
          initial={{ x: 20, opacity: 0 }}
          animate={showR}
          transition={t(0.4)}
        >
          {projects.map((project, originalIndex) => {
            const isActive = originalIndex === featuredIndex;
            return (
              <button
                key={project.slug}
                onClick={() => setFeaturedIndex(originalIndex)}
                aria-current={isActive}
                className={`group relative text-left border-b border-white/8 py-5 px-4 transition-colors duration-300 ${
                  isActive ? 'bg-white/4' : 'hover:bg-white/3'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="project-active"
                    className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#6CE5E8]"
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  />
                )}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-white/20 font-mono mr-2">
                      {String(originalIndex + 1).padStart(2, '0')}
                    </span>
                    <span className={`text-sm font-bold transition-colors duration-300 ${
                      isActive ? 'text-[#6CE5E8]' : 'text-[#F0F0F0] group-hover:text-[#6CE5E8]'
                    }`}>
                      {project.title}
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {project.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-[10px] text-gray-500">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className={`text-sm mt-1 transition-all duration-300 group-hover:translate-x-1 ${
                    isActive ? 'text-[#6CE5E8]' : 'text-white/20 group-hover:text-[#6CE5E8]'
                  }`}>
                    →
                  </span>
                </div>
              </button>
            );
          })}
        </motion.div>
      </div>

      {/* Controls: arrow buttons + CTA */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ y: 15, opacity: 0 }}
        animate={showY}
        transition={t(0.5)}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrev}
            aria-label="Previous project"
            className="w-10 h-10 border border-white/15 flex items-center justify-center text-white/50 hover:border-[#6CE5E8] hover:text-[#6CE5E8] transition-colors duration-300"
          >
            ◀
          </button>
          <button
            onClick={handleNext}
            aria-label="Next project"
            className="w-10 h-10 border border-white/15 flex items-center justify-center text-white/50 hover:border-[#6CE5E8] hover:text-[#6CE5E8] transition-colors duration-300"
          >
            ▶
          </button>
          <span className="text-xs text-white/30 font-mono ml-2">
            {String(featuredIndex + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
          </span>
        </div>

        <a
          href="https://github.com/Burial0268"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs uppercase tracking-widest text-[#6CE5E8] font-bold hover:text-white transition-colors duration-300"
        >
          VIEW GITHUB → <br />
          // 查看我的 GitHub
        </a>
      </motion.div>
    </SectionShell>
  );
}
