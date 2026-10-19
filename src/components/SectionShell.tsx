import { motion } from 'motion/react';

export interface SubIndexItem {
  key: string;
  label: string;
  title?: string; // accessible name when `label` is just a number (compact grid)
  active?: boolean;
  onSelect?: () => void;
}

interface SectionShellProps {
  label: string;          // condensed label after "BAESORY ://", e.g. PROFILE
  en: string;             // EN title, e.g. ABOUT ME
  zh: string;             // CJK title, e.g. 关于我
  description?: React.ReactNode;
  url?: string;
  subIndex?: SubIndexItem[];
  subIndexCompact?: boolean; // numbered grid instead of a titled list — for long pickers whose titles are already shown elsewhere
  subIndexOnMobile?: boolean; // phones show the sub-index only when it is a real picker people need
  isDark: boolean;
  isReady: boolean;
  aside?: React.ReactNode; // extra block at the foot of the left column (e.g. footer)
  children: React.ReactNode;
}

const EASE = [0.22, 1, 0.36, 1] as const;
export const pad = (n: number) => String(n).padStart(2, '0');

/*
 * Arknights #media layout on a 12-column grid: a 3-column left column read top-down
 * (label → titles → cyan bar → description → boxed sub-index → url) and 9 columns of
 * content, both starting on the same line. Edges come from the layout variables
 * (--mx / --pr / --nav-h / --band); the giant typewriter watermark sits behind, in App.
 */
export default function SectionShell({
  label,
  en,
  zh,
  description,
  url = 'HTTPS://GITHUB.COM/BURIAL0268',
  subIndex,
  subIndexOnMobile = false,
  subIndexCompact = false,
  isDark,
  isReady,
  aside,
  children,
}: SectionShellProps) {
  const t = (delay: number, duration = 0.6) =>
    isReady ? { duration, delay, ease: EASE } : { duration: 0.3, delay: 0 };
  const showL = isReady ? { x: 0, opacity: 1 } : { x: -15, opacity: 0 };
  const fade = { opacity: isReady ? 1 : 0 };

  const text = isDark ? 'text-[#F0F0F0]' : 'text-[#0A0A0A]';
  const muted = isDark ? 'text-white/45' : 'text-black/45';
  const rule = isDark ? 'border-white/15' : 'border-black/15';

  return (
    <section className="relative min-h-dvh pl-(--mx) pr-(--pr) pt-[calc(var(--nav-h)+48px)] short:pt-[calc(var(--nav-h)+32px)] pb-[calc(var(--band)+48px)] short:pb-[calc(var(--band)+24px)]">
      <div className="grid lg:grid-cols-12 gap-x-12 gap-y-12">
        {/* ── Left column (3/12) ───────────────────────────────── */}
        <aside className="lg:col-span-3">
          <motion.div className={`font-bebas text-[15px] tracking-[0.1em] leading-none ${muted}`} initial={{ opacity: 0 }} animate={fade} transition={t(0.1, 0.4)}>
            BAESORY :// <span className={text}>{label}</span>
          </motion.div>

          <div className="mt-6 overflow-hidden">
            <motion.h2
              className={`text-display uppercase text-[2rem] tracking-[0.01em] ${text}`}
              initial={{ y: '105%' }}
              animate={{ y: isReady ? '0%' : '105%' }}
              transition={t(0.2, 0.7)}
            >
              {en}
            </motion.h2>
          </div>
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
          <motion.div
            className="mt-4 h-1.5 w-40 bg-[#6CE5E8] origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: isReady ? 1 : 0 }}
            transition={t(0.4, 0.8)}
          />

          {description && (
            <motion.p className={`mt-6 text-[13px] leading-relaxed max-w-[300px] ${muted}`} initial={{ opacity: 0 }} animate={fade} transition={t(0.45, 0.5)}>
              {description}
            </motion.p>
          )}

          {subIndex && subIndexCompact && (
            <ul className={`hidden lg:grid mt-8 short:mt-6 border-t pt-4 grid-cols-4 gap-1.5 ${rule}`}>
              {subIndex.map((item, i) => (
                <motion.li key={item.key} initial={{ y: 8, opacity: 0 }} animate={isReady ? { y: 0, opacity: 1 } : { y: 8, opacity: 0 }} transition={t(0.45 + i * 0.03)}>
                  <button
                    onClick={item.onSelect}
                    aria-pressed={!!item.active}
                    aria-label={item.title ?? item.label}
                    title={item.title}
                    className={`w-full h-9 border font-bebas text-[15px] leading-none tracking-[0.06em] tabular-nums transition-colors duration-300 ${
                      item.active
                        ? 'bg-[#6CE5E8] border-[#6CE5E8] text-black'
                        : `${isDark ? 'border-white/20 text-white/45 hover:text-white' : 'border-black/20 text-black/45 hover:text-black'} hover:border-[#6CE5E8]`
                    }`}
                  >
                    {item.label}
                  </button>
                </motion.li>
              ))}
            </ul>
          )}
          {subIndex && !subIndexCompact && (
            <ul className={`mt-8 short:mt-6 border-t pt-4 ${rule} ${subIndexOnMobile ? '' : 'hidden lg:block'}`}>
              {subIndex.map((item, i) => {
                const Tag = item.onSelect ? 'button' : 'div';
                return (
                  <motion.li key={item.key} initial={{ x: -15, opacity: 0 }} animate={showL} transition={t(0.45 + i * 0.04)}>
                    <Tag
                      {...(item.onSelect ? { onClick: item.onSelect, 'aria-pressed': !!item.active } : {})}
                      className={`group w-full flex items-center gap-3 py-1 short:py-0 text-left text-[13px] transition-colors duration-300 ${
                        item.active ? text : `${muted} ${item.onSelect ? (isDark ? 'hover:text-white' : 'hover:text-black') : ''}`
                      }`}
                    >
                      <span
                        className={`w-[9px] h-[9px] shrink-0 border transition-colors duration-300 ${
                          item.active
                            ? 'bg-[#6CE5E8] border-[#6CE5E8]'
                            : `${isDark ? 'border-white/40' : 'border-black/40'} group-hover:border-[#6CE5E8]`
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </Tag>
                  </motion.li>
                );
              })}
            </ul>
          )}

          <motion.div className="mt-8 short:mt-6 hidden lg:block" initial={{ opacity: 0 }} animate={fade} transition={t(0.6, 0.5)}>
            <div className={`font-mono text-[10px] tracking-[0.15em] ${text}`}>{url}</div>
            <div className={`ruler mt-2 w-24 ${text}`} />
            {aside}
          </motion.div>
        </aside>

        {/* ── Content (9/12) ───────────────────────────────────── */}
        <div className="lg:col-span-9 min-w-0">{children}</div>
      </div>
    </section>
  );
}
