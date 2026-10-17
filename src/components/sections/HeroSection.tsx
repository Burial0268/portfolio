import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import HeroButtons from '../HeroButtons';
import Marquee from '../effects/Marquee';

const EASE = [0.22, 1, 0.36, 1] as const;
const NAME = 'Baesory';
const tickerItems = Array(6).fill('BAESORY  ·  CREATIVE DEVELOPER  ·  PORTFOLIO ' + new Date().getFullYear() + '  ·  BURIAL0268  ·  ');

const info = [
  { label: 'Role / 职能', value: '全栈开发工程师', sub: 'Full-stack Developer' },
  { label: 'Focus / 方向', value: '动效 · 交互', sub: 'Motion & Interaction' },
  { label: 'Stack / 技术', value: 'React / Motion / Vue', sub: 'Rust · Tauri · PHP' },
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

  const t = (delay: number, duration = 0.7) => ({ duration, delay, ease: EASE });
  const fade = { opacity: booted ? 1 : 0 };

  return (
    <section id="home" className="relative min-h-dvh w-full overflow-clip flex flex-col">
      {/* ── Texture: procedural contours (shared #topo symbol) + grain + vignette ── */}
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <filter id="hero-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </svg>
      <motion.svg
        className="absolute inset-0 w-full h-full pointer-events-none text-[#6CE5E8]/[0.09]"
        viewBox="0 0 160 100"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        initial={{ opacity: 0, scale: 1.08 }}
        animate={booted ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.08 }}
        transition={{ opacity: { duration: 0.9 }, scale: { duration: 2.4, ease: EASE } }}
        style={{ animation: booted ? 'hud-flash 0.9s linear' : undefined }}
      >
        <use href="#topo" />
      </motion.svg>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 40%, transparent 30%, rgba(0,0,0,0.65) 100%)' }}
      />
      <div className="absolute inset-0 pointer-events-none" style={{ filter: 'url(#hero-grain)', opacity: 0.05 }} />

      {/* ── Content ─────────────────────────────────────────── */}
      <div className="relative z-10 flex-1 flex flex-col page-x pt-24 md:pt-28">
        {/* Meta row */}
        <div>
          <motion.div
            className="h-px bg-white/25 origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: booted ? 1 : 0 }}
            transition={t(0.1, 1)}
          />
          <div className="grid grid-cols-2 md:grid-cols-4 pt-3 meta">
            {['(01)', 'Introduction / 介绍', `Portfolio ©${new Date().getFullYear()}`].map((text, i) => (
              <motion.span
                key={text}
                className={i === 0 ? 'text-white' : i === 1 ? 'text-white' : 'text-white/45 hidden md:block'}
                initial={{ opacity: 0 }}
                animate={fade}
                transition={t(0.3 + i * 0.06, 0.4)}
              >
                {text}
              </motion.span>
            ))}
            <motion.span
              className="text-white/45 hidden md:flex items-center justify-end gap-2"
              initial={{ opacity: 0 }}
              animate={fade}
              transition={t(0.5, 0.4)}
            >
              Scroll / 滚动
              <span
                className="block w-px h-4 bg-[#6CE5E8]"
                style={{ animation: 'hero-flow 2s infinite ease-in-out' }}
              />
            </motion.span>
          </div>
        </div>

        {/* Name block — pushed to the lower part of the poster */}
        <div className="flex-1 flex flex-col justify-end pt-10">
          <div className="grid grid-cols-4 items-end gap-y-4 mb-2 md:mb-0">
            <motion.p
              className="col-span-4 md:col-span-3 text-lg md:text-2xl font-medium tracking-[-0.02em] text-white/70 max-w-xl"
              initial={{ y: 16, opacity: 0 }}
              animate={booted ? { y: 0, opacity: 1 } : { y: 16, opacity: 0 }}
              transition={t(0.7)}
            >
              Full-stack developer &amp; animation enthusiast — 写代码，也做动效。
            </motion.p>
            <div className="hidden md:block overflow-hidden text-right">
              <motion.span
                className="block text-display text-[clamp(3rem,7vw,7rem)] text-[#6CE5E8]"
                initial={{ y: '105%' }}
                animate={{ y: booted ? '0%' : '105%' }}
                transition={t(0.6, 0.9)}
              >
                拜瑞
              </motion.span>
            </div>
          </div>

          {/* Each letter rises out of the mask, staggered */}
          <h1
            className="text-display text-white text-[clamp(5rem,21.5vw,22rem)] leading-[0.8] tracking-[-0.06em] -ml-[0.05em] overflow-hidden pb-[0.12em] -mb-[0.08em]"
            aria-label={NAME}
          >
            {NAME.split('').map((ch, i) => (
              <motion.span
                key={i}
                className="inline-block"
                aria-hidden="true"
                initial={{ y: '110%' }}
                animate={{ y: booted ? '0%' : '110%' }}
                transition={t(0.25 + i * 0.05, 1)}
              >
                {ch}
              </motion.span>
            ))}
          </h1>
          <span className="md:hidden text-display text-5xl text-[#6CE5E8] mt-1">拜瑞</span>

          {/* Info grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 mt-8 md:mt-10">
            {info.map((item, i) => (
              <motion.div
                key={item.label}
                className={`border-t border-white/25 pt-3 pb-6 pr-4 ${i === 2 ? 'hidden md:block' : ''}`}
                initial={{ y: 16, opacity: 0 }}
                animate={booted ? { y: 0, opacity: 1 } : { y: 16, opacity: 0 }}
                transition={t(0.85 + i * 0.07)}
              >
                <div className="meta text-white/45 mb-3">
                  ({String(i + 1).padStart(2, '0')}) {item.label}
                </div>
                <div className="text-base md:text-lg font-semibold tracking-[-0.01em] text-white">{item.value}</div>
                <div className="text-sm text-white/45">{item.sub}</div>
              </motion.div>
            ))}
            <motion.div
              className="col-span-2 md:col-span-1 border-t border-white/25 pt-3 pb-6"
              initial={{ y: 16, opacity: 0 }}
              animate={booted ? { y: 0, opacity: 1 } : { y: 16, opacity: 0 }}
              transition={t(1.06)}
            >
              <div className="meta text-white/45 mb-3">(04) Explore / 浏览</div>
              <HeroButtons />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Ticker strip */}
      <motion.div
        className="relative z-10 border-t border-white/15 py-2.5 meta text-white/35 overflow-hidden"
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={fade}
        transition={t(1.2)}
      >
        <Marquee speed={50}>
          {tickerItems.map((text, i) => (
            <span key={i} className="whitespace-nowrap">{text}</span>
          ))}
        </Marquee>
      </motion.div>
    </section>
  );
}
