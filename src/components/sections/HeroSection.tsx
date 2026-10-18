import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import HeroButtons from '../HeroButtons';

const NAME = 'Baesory';
const EASE = [0.22, 1, 0.36, 1] as const;

// Numbered info row under the name — same 12-column grid as the meta row
const heroInfo = [
  { label: 'ROLE / 职能', value: '全栈开发工程师', sub: 'Full-stack Developer' },
  { label: 'FOCUS / 方向', value: '动效 · 交互', sub: 'Motion & Interaction' },
  { label: 'STACK / 技术', value: 'React / Motion / Vue', sub: 'Rust · Tauri · PHP' },
];

interface HeroSectionProps {
  isReady?: boolean;
}

export default function HeroSection({ isReady = true }: HeroSectionProps) {
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

  // The landing title is the first typewriter moment: typed out, cursor blinks, then rests
  const [typed, setTyped] = useState(0);
  const [cursorOn, setCursorOn] = useState(false);
  useEffect(() => {
    if (!booted) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setCursorOn(true), 250));
    for (let i = 1; i <= NAME.length; i++) timers.push(setTimeout(() => setTyped(i), 450 + i * 95));
    timers.push(setTimeout(() => setCursorOn(false), 450 + NAME.length * 95 + 2200));
    return () => timers.forEach(clearTimeout);
  }, [booted]);

  const show = (delay: number) => ({
    initial: { y: 14, opacity: 0 },
    animate: booted ? { y: 0, opacity: 1 } : { y: 14, opacity: 0 },
    transition: { duration: 0.6, delay, ease: EASE },
  });

  return (
    <section id="home" className="relative min-h-dvh w-full overflow-clip flex flex-col">
      {/* ── Texture: contours (shared #topo symbol) + grain + vignette ── */}
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <filter id="hero-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </svg>
      <motion.svg
        className="absolute inset-0 w-full h-full pointer-events-none text-[#6CE5E8]/[0.08]"
        style={{ zIndex: 1, animation: booted ? 'hud-flash 0.9s linear' : undefined }}
        viewBox="0 0 160 100"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        initial={{ opacity: 0, scale: 1.06 }}
        animate={booted ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.06 }}
        transition={{ opacity: { duration: 0.9 }, scale: { duration: 2.4, ease: EASE } }}
      >
        <use href="#topo" />
      </motion.svg>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 0, background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.55) 100%)' }}
      />
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2, filter: 'url(#hero-grain)', opacity: 0.06 }} />

      {/* ── Vertical BAESORY cutout block (signature) ── */}
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
      </div>

      {/* ── Content on the page grid ─────────────────────────── */}
      <div
        className="relative flex-1 flex flex-col pl-(--mx) pr-(--pr) pt-[calc(var(--nav-h)+48px)] short:pt-[calc(var(--nav-h)+32px)] pb-[calc(var(--band)+32px)]"
        style={{ zIndex: 10 }}
      >
        {/* Meta row — hairline + 12-column grid */}
        <div className="shrink-0 pointer-events-none">
          <motion.div
            className="h-px bg-white/20 origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: booted ? 1 : 0 }}
            transition={{ duration: 1, delay: 0.2, ease: EASE }}
          />
          <motion.div
            className="grid grid-cols-12 gap-x-12 pt-3 font-mono text-[10px] uppercase leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: booted ? 1 : 0 }}
            transition={{ duration: 0.5, delay: 0.35, ease: EASE }}
          >
            <span className="col-span-12 md:col-span-3 font-bold tracking-[0.18em] whitespace-nowrap text-white/40">
              // SUPER::PORTFOLIO::CORE::init()
            </span>
            <span className="hidden md:block col-span-3 tracking-[0.2em] text-white/60">
              <span className="text-[#6CE5E8]">(00)</span> / 04 — INDEX 首页
            </span>
            <span className="hidden md:block col-span-3 tracking-[0.2em] text-white/30">
              PORTFOLIO ©{new Date().getFullYear()}
            </span>
          </motion.div>
        </div>

        {/* Name block */}
        <div className="flex-1 flex flex-col justify-center py-10 short:py-6">
          <motion.div className="font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] text-white/50" {...show(0.4)}>
            ▼ Full Stack Developer &amp; Animation Enthusiast
          </motion.div>

          <h1
            className="mt-4 text-display text-white text-[clamp(4.5rem,min(15vw,22vh),14rem)] leading-[0.85] tracking-[-0.045em] -ml-[0.04em] min-h-[0.85em]"
            style={{ mixBlendMode: 'difference' }}
            aria-label={NAME}
          >
            <span aria-hidden="true">{NAME.slice(0, typed)}</span>
            {cursorOn && (
              <span aria-hidden="true" className="inline-block w-[0.06em] h-[0.7em] ml-[0.05em] bg-[#6CE5E8] animate-blink" />
            )}
          </h1>

          <div className="overflow-hidden mt-2">
            <motion.div
              className="text-display text-[#6CE5E8] text-[clamp(3.25rem,min(8vw,11vh),7.5rem)] leading-[0.95]"
              initial={{ y: '110%' }}
              animate={{ y: booted ? '0%' : '110%' }}
              transition={{ duration: 0.8, delay: 1.3, ease: EASE }}
            >
              拜瑞
            </motion.div>
          </div>

          <motion.div className="mt-10 short:mt-6" {...show(1.5)}>
            <HeroButtons />
          </motion.div>
        </div>

        {/* Info row — hairline + the same 12-column grid */}
        <div className="shrink-0 pointer-events-none">
          {/* Ruler divider: hairline + minor tick every 12px, major every 120px */}
          <motion.div
            className="h-[9px] border-t border-white/20 origin-left"
            style={{
              backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.2) 1px, transparent 1px)',
              backgroundSize: '12px 4px, 120px 9px',
              backgroundRepeat: 'repeat-x',
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: booted ? 1 : 0 }}
            transition={{ duration: 1, delay: 1.4, ease: EASE }}
          />
          <div className="grid grid-cols-2 md:grid-cols-12 gap-x-12 gap-y-6 pt-2">
            {heroInfo.map((item, i) => (
              <motion.div key={item.label} className={`md:col-span-3 ${i === 2 ? 'hidden md:block' : ''}`} {...show(1.55 + i * 0.07)}>
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">
                  <span className="text-[#6CE5E8]/80">({String(i + 1).padStart(2, '0')})</span> {item.label}
                </div>
                <div className="mt-3 text-base font-bold text-white">{item.value}</div>
                <div className="mt-0.5 text-xs text-white/40">{item.sub}</div>
              </motion.div>
            ))}
            <motion.p
              className="col-span-2 md:col-span-3 self-end font-mono text-[10px] leading-relaxed text-white/30"
              {...show(1.8)}
            >
              // &copy; BAESORY<br />a.k.a BURIAL0268 &amp; 拜瑞
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
}
