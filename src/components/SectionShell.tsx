import { motion } from 'motion/react';

export interface SubIndexItem {
  key: string;
  label: string;
  active?: boolean;
  onSelect?: () => void;
}

interface SectionShellProps {
  label: string;          // small condensed label under "BAESORY ://", e.g. PROFILE
  en: string;             // wide EN title, e.g. ABOUT ME
  zh: string;             // CJK title, e.g. 关于我
  description?: React.ReactNode;
  url?: string;
  subIndex?: SubIndexItem[];
  isDark: boolean;
  isReady: boolean;
  aside?: React.ReactNode; // extra block at the foot of the left column (e.g. footer)
  children: React.ReactNode;
}

const EASE = [0.22, 1, 0.36, 1] as const;
export const pad = (n: number) => String(n).padStart(2, '0');

/*
 * Arknights #media layout: a left column (label + boxed sub-index on top, titles at the
 * foot) and the section's content to the right. The frame around it — the right rail
 * with the section number and the bottom band with the typewriter watermark — lives in App.
 */
export default function SectionShell({
  label,
  en,
  zh,
  description,
  url = 'HTTPS://GITHUB.COM/BURIAL0268',
  subIndex,
  isDark,
  isReady,
  aside,
  children,
}: SectionShellProps) {
  const t = (delay: number, duration = 0.6) =>
    isReady ? { duration, delay, ease: EASE } : { duration: 0.3, delay: 0 };
  const showL = isReady ? { x: 0, opacity: 1 } : { x: -15, opacity: 0 };

  const text = isDark ? 'text-[#F0F0F0]' : 'text-[#0A0A0A]';
  const muted = isDark ? 'text-white/45' : 'text-black/45';
  const rule = isDark ? 'bg-white/40' : 'bg-black/40';

  return (
    <section className="relative min-h-dvh flex flex-col lg:flex-row gap-10 lg:gap-14 xl:gap-20 px-6 md:px-16 lg:pl-[108px] lg:pr-[208px] pt-24 md:pt-28 md:short:pt-24 pb-[calc(var(--band-h)+24px)]">
      {/* ── Left column ─────────────────────────────────────── */}
      <aside className="lg:w-[280px] xl:w-[320px] shrink-0 flex flex-col gap-8 lg:justify-between">
        <div>
          <motion.div className={`font-bebas text-[13px] tracking-[0.12em] ${muted}`} initial={{ opacity: 0 }} animate={{ opacity: isReady ? 1 : 0 }} transition={t(0.1, 0.4)}>
            BAESORY ://
          </motion.div>
          <motion.div className={`font-bebas text-[26px] leading-none ${text}`} initial={{ x: -15, opacity: 0 }} animate={showL} transition={t(0.15)}>
            {label}
          </motion.div>

          {subIndex && (
            <ul className="mt-4 short:mt-3 space-y-1 short:space-y-0">
              {subIndex.map((item, i) => {
                const Tag = item.onSelect ? 'button' : 'div';
                return (
                  <motion.li key={item.key} initial={{ x: -15, opacity: 0 }} animate={showL} transition={t(0.2 + i * 0.04)}>
                    <Tag
                      {...(item.onSelect ? { onClick: item.onSelect, 'aria-pressed': !!item.active } : {})}
                      className={`group flex items-center gap-2.5 py-0.5 text-left text-[13px] tracking-[0.02em] transition-colors duration-300 ${
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
        </div>

        <div>
          <div className="overflow-hidden">
            <motion.h2
              className={`text-display uppercase text-[1.75rem] md:text-[2.25rem] tracking-[0.02em] ${text}`}
              initial={{ y: '105%' }}
              animate={{ y: isReady ? '0%' : '105%' }}
              transition={t(0.25, 0.7)}
            >
              {en}
            </motion.h2>
          </div>
          <div className="overflow-hidden">
            <motion.div
              className={`text-[2.5rem] md:text-[2.8rem] md:short:text-[2.2rem] font-bold leading-[1.15] ${text}`}
              initial={{ y: '105%' }}
              animate={{ y: isReady ? '0%' : '105%' }}
              transition={t(0.32, 0.7)}
            >
              {zh}
            </motion.div>
          </div>
          <motion.div
            className="mt-3 h-1.5 w-44 bg-[#6CE5E8] origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: isReady ? 1 : 0 }}
            transition={t(0.45, 0.8)}
          />
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: isReady ? 1 : 0 }} transition={t(0.55, 0.5)}>
            {description && <div className={`mt-6 text-xs leading-relaxed ${muted} max-w-xs`}>{description}</div>}
            <div className={`mt-2 font-mono text-[10px] tracking-[0.15em] ${text}`}>{url}</div>
            <div className={`mt-2 w-24 h-px ${rule}`} />
            {aside}
          </motion.div>
        </div>
      </aside>

      {/* ── Content ─────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">{children}</div>
    </section>
  );
}
