import { motion } from 'motion/react';
import Typed from './effects/Typed';

interface SectionShellProps {
  label: string;          // condensed label after "BAESORY ://", e.g. PROFILE
  en: string;             // EN title, e.g. ABOUT ME
  zh: string;             // CJK title, e.g. 关于我
  description?: React.ReactNode;
  url?: string;
  no: number;             // section slot 1–4 (rail number); places the cyan block on the title ruler
  isDark: boolean;
  isReady: boolean;
  aside?: React.ReactNode; // extra block at the foot of the left column (e.g. footer)
  children: React.ReactNode;
}

const EASE = [0.22, 1, 0.36, 1] as const;
export const pad = (n: number) => String(n).padStart(2, '0');

/*
 * Arknights #media layout on a 12-column grid: a 3-column left column read top-down
 * (label → titles → ruler → description → url) and 9 columns of
 * content, both starting on the same line. Edges come from the layout variables
 * (--mx / --pr / --nav-h / --band); the giant typewriter watermark sits behind, in App.
 */
export default function SectionShell({
  label,
  en,
  zh,
  description,
  url = 'HTTPS://GITHUB.COM/BURIAL0268',
  no,
  isDark,
  isReady,
  aside,
  children,
}: SectionShellProps) {
  const t = (delay: number, duration = 0.6) =>
    isReady ? { duration, delay, ease: EASE } : { duration: 0.3, delay: 0 };
  const fade = { opacity: isReady ? 1 : 0 };

  const text = isDark ? 'text-[#F0F0F0]' : 'text-[#0A0A0A]';
  const muted = isDark ? 'text-white/45' : 'text-black/45';

  return (
    <section className="relative min-h-dvh pl-(--mx) pr-(--pr) pt-[calc(var(--nav-h)+48px)] short:pt-[calc(var(--nav-h)+32px)] pb-[calc(var(--band)+48px)] short:pb-[calc(var(--band)+24px)]">
      <div className="grid lg:grid-cols-12 gap-x-12 gap-y-12">
        {/* ── Left column (3/12) ───────────────────────────────── */}
        <aside className="lg:col-span-3">
          <motion.div className={`font-bebas text-[15px] tracking-[0.1em] leading-none ${muted}`} initial={{ opacity: 0 }} animate={fade} transition={t(0.1, 0.4)}>
            BAESORY :// <Typed className={text} text={label} play={isReady} delay={200} />
          </motion.div>

          <div className="mt-6 overflow-hidden">
            {/* Letters rise one after another (GSAP SplitText feel); the row stays masked */}
            <h2 aria-label={en} className={`text-display uppercase text-[2rem] tracking-[0.01em] ${text}`}>
              {[...en].map((ch, i) => (
                <motion.span
                  key={i}
                  aria-hidden="true"
                  className="inline-block"
                  initial={{ y: '105%' }}
                  animate={{ y: isReady ? '0%' : '105%' }}
                  transition={t(0.2 + i * 0.03, 0.6)}
                >
                  {ch === ' ' ? '\u00A0' : ch}
                </motion.span>
              ))}
            </h2>
          </div>
          {/* Frosted-glass cover (RhineLabUI): sits over the ZH title + ruler and clears top→bottom with a feathered edge */}
          <div className="relative overflow-hidden">
            <div className="overflow-hidden">
              <motion.div
                className={`text-[3rem] short:text-[2.5rem] font-bold leading-[1.15] ${text}`}
                initial={{ y: '105%' }}
                animate={{ y: isReady ? '0%' : '105%' }}
                transition={t(0.27, 0.7)}
              >
                {zh}
              </motion.div>
            </div>
            {/* Ruler with a cyan block that sits at this section's slot (0–4 of 5): same bar, but each section reads differently */}
            <div className={`relative mt-4 w-40 ${text}`}>
              <div className="ruler" />
              <motion.span
                className="absolute top-0 h-1.5 w-8 bg-[#8FC6C1] origin-left"
                style={{ left: no * 32 }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: isReady ? 1 : 0 }}
                transition={t(0.4, 0.6)}
              />
            </div>
            <motion.div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-x-0 top-0 h-[130%] backdrop-blur-md ${isDark ? 'bg-[#1D1E20]/40' : 'bg-white/30'} [mask-image:linear-gradient(to_bottom,#000_76%,transparent)]`}
              initial={{ y: 0 }}
              animate={{ y: isReady ? '100%' : 0 }}
              transition={t(0.35, 0.9)}
            />
          </div>

          {description && (
            <motion.p className={`mt-6 text-[13px] leading-relaxed max-w-[300px] ${muted}`} initial={{ opacity: 0 }} animate={fade} transition={t(0.45, 0.5)}>
              {description}
            </motion.p>
          )}

          <motion.div className="mt-8 short:mt-6 hidden lg:block" initial={{ opacity: 0 }} animate={fade} transition={t(0.6, 0.5)}>
            <div className={`font-mono text-[10px] tracking-[0.15em] break-all ${text}`}>{url}</div>
            {aside}
          </motion.div>
        </aside>

        {/* ── Content (9/12) ───────────────────────────────────── */}
        <div className="lg:col-span-9 min-w-0">{children}</div>
      </div>
    </section>
  );
}
