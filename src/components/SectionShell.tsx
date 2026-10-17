import { motion } from 'motion/react';

interface SectionShellProps {
  sidebarLabel: string;
  sidebarVerticalText: string;
  isDark: boolean;
  tagLine: string;
  badgeText: string;
  heading: string;
  metaLine: string;
  subtitle?: string;
  isReady: boolean;
  children: React.ReactNode;
}

export default function SectionShell({
  sidebarLabel,
  sidebarVerticalText,
  isDark,
  tagLine,
  badgeText,
  heading,
  metaLine,
  subtitle,
  isReady,
  children,
}: SectionShellProps) {
  const showY = isReady ? { y: 0, opacity: 1 } : { y: 15, opacity: 0 };
  const showL = isReady ? { x: 0, opacity: 1 } : { x: -15, opacity: 0 };
  const t = (delay: number) =>
    isReady
      ? { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const }
      : { duration: 0.3, delay: 0 };

  const textColor = isDark ? 'text-[#F0F0F0]' : 'text-[#0A0A0A]';
  const mutedColor = isDark ? 'text-white/40' : 'text-black/40';
  const metaColor = isDark ? 'text-white/30' : 'text-black/30';

  return (
    <section className="relative min-h-dvh flex flex-col overflow-x-clip">
      {/* Mobile: horizontal accent bar — slides from left */}
      <motion.div
        className="md:hidden mt-16 h-14 bg-[#6CE5E8] flex items-center px-6 gap-4 shrink-0 overflow-hidden"
        initial={{ clipPath: 'inset(0 100% 0 0)' }}
        animate={isReady ? { clipPath: 'inset(0 0% 0 0)' } : { clipPath: 'inset(0 100% 0 0)' }}
        transition={t(0)}
      >
        <span className="text-black font-black text-sm tracking-wider uppercase">
          {sidebarVerticalText}
        </span>
        <span className="text-black/50 text-xs font-medium">{sidebarLabel}</span>
      </motion.div>

      <div className="flex flex-1 min-h-0">
        {/* Desktop: left sidebar strip — clip reveal */}
        <motion.div
          className="hidden md:flex w-[120px] lg:w-[160px] bg-[#6CE5E8] shrink-0 flex-col items-center justify-between py-10 relative overflow-hidden"
          initial={{ clipPath: 'inset(0 0 100% 0)' }}
          animate={isReady ? { clipPath: 'inset(0 0 0% 0)' } : { clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 0.6, delay: 0, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Top spacer */}
          <div />

          {/* Vertical English text — fades in after sidebar reveals */}
          <motion.span
            className="vertical-text text-black font-black text-lg lg:text-xl tracking-[0.3em] uppercase select-none"
            initial={{ opacity: 0 }}
            animate={isReady ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {sidebarVerticalText}
          </motion.span>

          {/* Bottom Chinese label */}
          <motion.span
            className="text-black/60 text-xs font-bold tracking-wider"
            initial={{ opacity: 0 }}
            animate={isReady ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {sidebarLabel}
          </motion.span>
        </motion.div>

        {/* Content area */}
        <div className="flex-1 min-w-0 px-6 md:px-10 lg:px-16 pt-12 pb-16 md:pt-28 md:pb-20 flex flex-col">
          {/* Editorial header — Endfield-style tight 3-tier tag */}
          <div className="mb-10 md:mb-14">
            {/* Tier 1: Brand tag line */}
            <motion.div
              className={`text-[10px] uppercase tracking-[0.3em] ${mutedColor} font-medium font-mono mb-1.5`}
              initial={{ opacity: 0 }}
              animate={isReady ? { opacity: 1 } : { opacity: 0 }}
              transition={t(0.1)}
            >
              {tagLine}
            </motion.div>

            {/* Tier 2: Parallelogram marker + section badge */}
            <motion.div
              className="flex items-center gap-2.5 mb-1.5"
              initial={{ x: -15, opacity: 0 }}
              animate={showL}
              transition={t(0.15)}
            >
              <motion.span
                className={`inline-block w-5 h-3.5 ${isDark ? 'bg-white' : 'bg-[#0A0A0A]'} -skew-x-12`}
                initial={{ scaleX: 0 }}
                animate={isReady ? { scaleX: 1 } : { scaleX: 0 }}
                transition={{ duration: 0.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: 'left' }}
              />
              <span className={`text-sm md:text-base font-bold uppercase tracking-[0.2em] ${textColor}`}>
                {badgeText}
              </span>
            </motion.div>

            {/* Tier 3: Chinese heading */}
            <motion.h2
              className={`text-4xl md:text-5xl lg:text-6xl font-black ${textColor} text-display mb-2`}
              initial={{ x: -15, opacity: 0 }}
              animate={showL}
              transition={t(0.2)}
            >
              {heading}
            </motion.h2>

            {/* Meta line */}
            <motion.div
              className={`text-[10px] font-mono ${metaColor} tracking-wider`}
              initial={{ opacity: 0 }}
              animate={isReady ? { opacity: 1 } : { opacity: 0 }}
              transition={t(0.3)}
            >
              {metaLine}
            </motion.div>

            {subtitle && (
              <motion.p
                className={`mt-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} max-w-xl`}
                initial={{ x: -15, opacity: 0 }}
                animate={showL}
                transition={t(0.35)}
              >
                {subtitle}
              </motion.p>
            )}
          </div>

          {/* Section-specific content */}
          <div className="flex-1">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
