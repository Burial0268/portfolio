import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import HeroButtons from '../HeroButtons';
import Marquee from '../effects/Marquee';

const bannerTopItems = Array(8).fill('BURIAL0268\u00A0\u00A0\u00B7\u00A0\u00A0');
const bannerBottomItems = Array(9).fill('CREATIVE\u00A0DEVELOPER\u00A0\u00A0\u00B7\u00A0\u00A0');

interface HeroSectionProps {
  isReady?: boolean;
}

export default function HeroSection({ isReady = true }: HeroSectionProps) {
  const show = isReady ? { y: 0, opacity: 1 } : { y: 15, opacity: 0 };
  const t = (delay: number) =>
    isReady
      ? { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const }
      : { duration: 0.3, delay: 0 };

  // Boot sequence state — plays once on first mount
  const [booted, setBooted] = useState(false);
  const hasBooted = useRef(false);

  useEffect(() => {
    if (isReady && !hasBooted.current) {
      hasBooted.current = true;
      const timer = setTimeout(() => setBooted(true), 100);
      return () => clearTimeout(timer);
    }
  }, [isReady]);

  return (
    <section id="home" className="relative min-h-dvh w-full overflow-clip bg-[#0A0A0A] flex flex-col">
      {/* SVG Filters */}
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <filter id="hero-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </svg>

      {/* ── Texture layers ──────────────────────────────────── */}

      {/* Subtle radial vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 0,
          background: 'radial-gradient(ellipse 80% 70% at 30% 50%, rgba(108,229,232,0.04) 0%, transparent 60%), radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.5) 100%)',
        }}
      />

      {/* Topographic contour lines — same procedural map as the loader (shared #topo symbol) */}
      <motion.svg
        className="absolute inset-0 w-full h-full pointer-events-none text-[#6CE5E8]/[0.08]"
        style={{ zIndex: 1, animation: booted ? 'hud-flash 0.9s linear' : undefined }}
        viewBox="0 0 160 100"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        initial={{ opacity: 0, scale: 1.06 }}
        animate={booted ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.06 }}
        transition={{ opacity: { duration: 0.9 }, scale: { duration: 2.4, ease: [0.22, 1, 0.36, 1] } }}
      >
        <use href="#topo" />
      </motion.svg>

      {/* Film grain overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 2, filter: 'url(#hero-grain)', opacity: 0.06 }}
      />

      {/* ── Fixed color mask — AK-style tonal contrast block ─── */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 3 }}>
        {/* Cyan mask with vertical "Baesory" text cutout */}
        <motion.div
          className="absolute right-0 top-[8%] w-[200px] md:w-[300px] h-[70vh] md:h-[80vh]"
          initial={{ clipPath: 'inset(0 0 100% 0)' }}
          animate={booted ? { clipPath: 'inset(0 0 0% 0)' } : { clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <svg className="w-full h-full" viewBox="0 0 300 800" preserveAspectRatio="none">
            <defs>
              <mask id="hero-cutout">
                <rect width="300" height="800" fill="white" />
                <text
                  x="150" y="400"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="black"
                  fontSize="420"
                  fontWeight="400"
                  fontFamily="'Bebas Neue', Impact, sans-serif"
                  letterSpacing="0.05em"
                  transform="rotate(90, 150, 400)"
                >
                  BAESORY
                </text>
              </mask>
            </defs>
            <rect width="300" height="800" fill="#6CE5E8" fillOpacity="0.07" mask="url(#hero-cutout)" />
          </svg>
        </motion.div>

        {/* Secondary outline block */}
        <motion.div
          className="absolute right-[22%] bottom-[14%] w-[80px] md:w-[140px] h-[80px] md:h-[140px] border border-[#6CE5E8]/10"
          initial={{ scale: 0, opacity: 0 }}
          animate={booted ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* Diagonal accent line */}
        <motion.div
          className="absolute top-[20%] right-[15%] w-px h-[200px] md:h-[300px] bg-linear-to-b from-[#6CE5E8]/15 to-transparent origin-top hidden md:block"
          style={{ transform: 'rotate(25deg)' }}
          initial={{ scaleY: 0 }}
          animate={booted ? { scaleY: 1 } : { scaleY: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* Small square accent */}
        <motion.div
          className="absolute top-[60%] right-[25%] w-2 h-2 bg-[#6CE5E8]/20 hidden md:block"
          initial={{ opacity: 0 }}
          animate={booted ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.4, delay: 1.2 }}
        />
      </div>

      {/* ── Scan line — sweeps once on boot ──────────────────── */}
      <AnimatePresence>
        {booted && (
          <motion.div
            className="absolute left-0 right-0 h-px bg-linear-to-r from-transparent via-[#6CE5E8]/30 to-transparent pointer-events-none"
            style={{ zIndex: 4 }}
            initial={{ top: '0%', opacity: 1 }}
            animate={{ top: '100%', opacity: 0 }}
            transition={{ duration: 2, ease: 'linear' }}
          />
        )}
      </AnimatePresence>

      {/* ── Corner brackets ─────────────────────────────────── */}
      <div className="absolute inset-6 md:inset-10 pointer-events-none hidden md:block" style={{ zIndex: 5 }}>
        {/* Top-left */}
        <motion.div
          className="absolute top-0 left-0"
          initial={{ opacity: 0 }}
          animate={booted ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <div className="w-6 h-px bg-[#6CE5E8]/25" />
          <div className="w-px h-6 bg-[#6CE5E8]/25" />
        </motion.div>
        {/* Top-right */}
        <motion.div
          className="absolute top-0 right-0"
          initial={{ opacity: 0 }}
          animate={booted ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <div className="w-6 h-px bg-[#6CE5E8]/25 ml-auto" />
          <div className="w-px h-6 bg-[#6CE5E8]/25 ml-auto" />
        </motion.div>
        {/* Bottom-left */}
        <motion.div
          className="absolute bottom-0 left-0"
          initial={{ opacity: 0 }}
          animate={booted ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
        >
          <div className="w-px h-6 bg-[#6CE5E8]/25" />
          <div className="w-6 h-px bg-[#6CE5E8]/25" />
        </motion.div>
        {/* Bottom-right */}
        <motion.div
          className="absolute bottom-0 right-0"
          initial={{ opacity: 0 }}
          animate={booted ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.4, delay: 0.8 }}
        >
          <div className="w-px h-6 bg-[#6CE5E8]/25 ml-auto" />
          <div className="w-6 h-px bg-[#6CE5E8]/25 ml-auto" />
        </motion.div>
      </div>

      {/* ── Content flow — single flex column, no position conflicts ── */}
      <div className="relative flex-1 flex flex-col px-6 md:pl-[140px] lg:pl-[180px] md:pr-10" style={{ zIndex: 10 }}>

        {/* Top metadata — flows naturally below nav */}
        <motion.div
          className="pt-20 md:pt-24 pb-4 flex items-start justify-between pointer-events-none shrink-0"
          initial={{ opacity: 0 }}
          animate={booted ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-white/40 font-mono">
            // SUPER::PORTFOLIO::CORE::init()
          </span>
          <div className="text-right font-mono text-[10px] text-[#6CE5E8]/60 leading-relaxed hidden md:block">
            <div>{"> STACK: REACT / MOTION / VUE"}</div>
            <div>{"<CREATIVE.DEV />"}</div>
          </div>
        </motion.div>

        {/* Hero content — safe centering (my-auto collapses when overflowing, enabling scroll) */}
        <div className="flex-1 flex flex-col max-w-[1000px] text-left">
          <div className="my-auto">
            {/* Subtitle with clip reveal */}
            <motion.div
              className="mb-6 overflow-hidden py-0.5"
              initial={{ opacity: 0 }}
              animate={booted ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <motion.span
                className="block text-[10px] md:text-xs uppercase tracking-[0.3em] text-white/50 font-medium font-mono"
                initial={{ y: '100%' }}
                animate={booted ? { y: 0 } : { y: '100%' }}
                transition={{ duration: 0.5, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                ▼ Full Stack Developer & Animation Enthusiast
              </motion.span>
            </motion.div>

            {/* Primary name — clip reveal from bottom */}
            <div className="overflow-hidden py-4">
              <motion.h1
                className="text-display text-[5rem] sm:text-[7rem] md:text-[9rem] lg:text-[min(12rem,18vh)] text-white mb-0 leading-[0.85]"
                style={{ mixBlendMode: 'difference' }}
                initial={{ y: '150%' }}
                animate={booted ? { y: 0 } : { y: '150%' }}
                transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                Baesory
              </motion.h1>
            </div>

            {/* Secondary name — clip reveal, staggered */}
            <div className="overflow-hidden py-4 mb-10">
              <motion.h2
                className="text-display text-[4rem] sm:text-[5.5rem] md:text-[7rem] lg:text-[min(10rem,15vh)] text-[#6CE5E8] leading-[0.85]"
                initial={{ y: '150%' }}
                animate={booted ? { y: 0 } : { y: '150%' }}
                transition={{ duration: 0.7, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                拜瑞
              </motion.h2>
            </div>

            {/* Horizontal accent line before buttons */}
            <motion.div
              className="w-16 h-px bg-[#6CE5E8]/40 mb-8"
              initial={{ scaleX: 0 }}
              animate={booted ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 0.6, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: 'left' }}
            />

            <motion.div
              initial={{ y: 12, opacity: 0 }}
              animate={booted ? { y: 0, opacity: 1 } : { y: 12, opacity: 0 }}
              transition={{ duration: 0.5, delay: 1.0, ease: [0.22, 1, 0.36, 1] }}
            >
              <HeroButtons />
            </motion.div>
          </div>
        </div>

        {/* Bottom metadata — at end of flex column */}
        <motion.div
          className="pb-8 flex items-end justify-between pointer-events-none shrink-0"
          initial={{ opacity: 0 }}
          animate={booted ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="font-mono text-[10px] text-white/30 leading-relaxed">
            <p>[ PORTFOLIO {(new Date()).getFullYear()} ]</p>
            <p className='text-display'>// &copy; BAESORY a.k.a BURIAL0268 & 拜瑞</p>
          </div>

          {/* Scroll hint — pulsing line */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-medium">
              SCROLL
            </span>
            <span
              className="block w-px h-10 origin-top"
              style={{
                background: 'linear-gradient(to bottom, rgba(108,229,232,0.5), transparent)',
                animation: 'hero-flow 2s infinite ease-in-out',
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* Diagonal Banners */}
      <div
        className="absolute pointer-events-none flex items-start overflow-hidden"
        aria-hidden="true"
        style={{
          left: '-20vw',
          width: '140vw',
          height: '60px',
          top: '8vh',
          transform: 'rotate(-5deg)',
          zIndex: 3,
        }}
      >
        <Marquee speed={60}>
          {bannerTopItems.map((text, i) => (
            <span
              key={i}
              className="text-[1rem] tracking-[0.4em] text-white/6 uppercase whitespace-nowrap mr-5 font-medium"
            >
              {text}
            </span>
          ))}
        </Marquee>
      </div>

      <div
        className="absolute pointer-events-none flex items-start overflow-hidden"
        aria-hidden="true"
        style={{
          left: '-20vw',
          width: '140vw',
          height: '60px',
          bottom: '8vh',
          transform: 'rotate(-5deg)',
          zIndex: 3,
        }}
      >
        <Marquee speed={60} reversed>
          {bannerBottomItems.map((text, i) => (
            <span
              key={i}
              className="text-[1rem] tracking-[0.4em] text-white/6 uppercase whitespace-nowrap mr-5 font-medium"
            >
              {text}
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
