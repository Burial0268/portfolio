import { motion } from 'motion/react';

interface SectionShellProps {
  index: number;
  total: number;
  caption: string;
  heading: string;
  isDark: boolean;
  subtitle?: string;
  isReady: boolean;
  children: React.ReactNode;
}

const EASE = [0.22, 1, 0.36, 1] as const;
export const pad = (n: number) => String(n).padStart(2, '0');

interface MetaRowProps {
  index: number;
  total: number;
  caption: string;
  isDark: boolean;
  isReady: boolean;
}

/** Swiss meta row: hairline rule + four cells on the same 4-column grid as the page guides */
export function MetaRow({ index, total, caption, isDark, isReady }: MetaRowProps) {
  const t = (delay: number, duration: number) =>
    isReady ? { duration, delay, ease: EASE } : { duration: 0.3, delay: 0 };
  const textColor = isDark ? 'text-[#F0F0F0]' : 'text-[#0A0A0A]';
  const mutedColor = isDark ? 'text-white/45' : 'text-black/45';

  const cells = [
    { text: `(${pad(index)})`, className: textColor },
    { text: caption, className: textColor },
    { text: 'Baesory / Portfolio', className: `${mutedColor} hidden md:block` },
    { text: `${pad(index)} / ${pad(total)}`, className: `${mutedColor} hidden md:block text-right` },
  ];

  return (
    <div>
      <motion.div
        className={`h-px origin-left ${isDark ? 'bg-white/25' : 'bg-black/80'}`}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isReady ? 1 : 0 }}
        transition={t(0, 0.9)}
      />
      <div className="grid grid-cols-2 md:grid-cols-4 pt-3 meta">
        {cells.map((cell, i) => (
          <motion.span
            key={i}
            className={cell.className}
            initial={{ opacity: 0 }}
            animate={{ opacity: isReady ? 1 : 0 }}
            transition={t(0.15 + i * 0.06, 0.4)}
          >
            {cell.text}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

export default function SectionShell({
  index,
  total,
  caption,
  heading,
  isDark,
  subtitle,
  isReady,
  children,
}: SectionShellProps) {
  const t = (delay: number, duration = 0.6) =>
    isReady ? { duration, delay, ease: EASE } : { duration: 0.3, delay: 0 };
  const fade = isReady ? { opacity: 1 } : { opacity: 0 };

  const textColor = isDark ? 'text-[#F0F0F0]' : 'text-[#0A0A0A]';
  const mutedColor = isDark ? 'text-white/45' : 'text-black/45';

  return (
    <section className="relative min-h-dvh flex flex-col page-x pt-24 md:pt-28 pb-16 md:pb-20">
      <div className="mb-10 md:mb-16">
        <MetaRow index={index} total={total} caption={caption} isDark={isDark} isReady={isReady} />

        {/* Heading rises out of a mask */}
        <div className="overflow-hidden mt-8 md:mt-14 pb-[0.06em]">
          <motion.h2
            className={`text-display text-[clamp(3.25rem,9vw,8.5rem)] ${textColor}`}
            initial={{ y: '105%' }}
            animate={{ y: isReady ? '0%' : '105%' }}
            transition={t(0.2, 0.8)}
          >
            {heading}
          </motion.h2>
        </div>

        {subtitle && (
          <motion.p
            className={`mt-6 text-base md:text-lg ${mutedColor} max-w-xl`}
            initial={{ opacity: 0 }}
            animate={fade}
            transition={t(0.35)}
          >
            {subtitle}
          </motion.p>
        )}
      </div>

      <div className="flex-1">{children}</div>
    </section>
  );
}
