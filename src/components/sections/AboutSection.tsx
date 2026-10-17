import { motion } from 'motion/react';
import { useCountUp } from '@/hooks/useCountUp';
import SectionShell, { pad } from '../SectionShell';

function StatCounter({ value, label, suffix, isReady }: { value: number; label: string; suffix: string; isReady: boolean }) {
  const { ref, value: count } = useCountUp(value, 1.4, isReady);

  return (
    <div className="border-t border-[#0A0A0A] pt-3 pb-8 pr-4">
      <span className="meta text-black/45">{label}</span>
      <div className="text-display text-[clamp(3.5rem,7vw,6.5rem)] text-[#0A0A0A] tabular-nums mt-6">
        <span ref={ref}>{count}</span>
        <span className="text-[#6CE5E8]">{suffix}</span>
      </div>
    </div>
  );
}

interface AboutSectionProps {
  isReady?: boolean;
}

export default function AboutSection({ isReady = false }: AboutSectionProps) {
  const showY = isReady ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 };
  const t = (delay: number) =>
    isReady
      ? { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const }
      : { duration: 0.3, delay: 0 };

  const stats = [
    { value: 5, label: '年经验', suffix: '+' },
    { value: 50, label: '项目完成', suffix: '+' },
    { value: 20, label: '技术栈', suffix: '+' },
    { value: 99, label: '满意度', suffix: '%' },
  ];

  const techStack = [
    'React', 'TypeScript', 'Next.js', 'Astro', 'Vue',
    'Tailwind CSS', 'Motion', 'Node.js', 'WebGL',
    'Git', 'Vite', 'Rust', 'Tauri', 'PHP'
  ];

  const specialties = ['前端开发', '动效设计', '后端开发'];

  return (
    <SectionShell index={2} total={5} en="About" zh="关于" heading="关于我" isDark={false} isReady={isReady}>
      {/* Statement (3 cols) + aside (1 col) on the page grid */}
      <div className="grid md:grid-cols-4 gap-y-10 mb-16 md:mb-24">
        <motion.p
          className="md:col-span-3 md:pr-12 text-[1.6rem] md:text-4xl lg:text-[2.75rem] font-semibold leading-[1.18] tracking-[-0.025em] text-[#0A0A0A]"
          initial={{ y: 20, opacity: 0 }}
          animate={showY}
          transition={t(0.3)}
        >
          我是一名热爱技术的全栈开发工程师，专注于打造极致的用户体验。擅长使用现代 Web 技术栈构建高性能、富交互的应用程序。
        </motion.p>

        <motion.div
          className="md:pl-4 text-sm leading-relaxed text-black/55"
          initial={{ y: 20, opacity: 0 }}
          animate={showY}
          transition={t(0.4)}
        >
          <p className="mb-8">
            对动效设计和 3D 可视化有浓厚兴趣，致力于将创意转化为令人惊叹的数字体验。相信优秀的设计与技术实现应该完美结合。
          </p>
          <ol className="border-t border-black/15">
            {specialties.map((item, i) => (
              <li key={item} className="flex items-baseline gap-4 py-2.5 border-b border-black/15 text-[#0A0A0A] font-semibold">
                <span className="meta text-black/35">{pad(i + 1)}</span>
                {item}
              </li>
            ))}
          </ol>
        </motion.div>
      </div>

      {/* Key numbers — one per grid column */}
      <div className="grid grid-cols-2 md:grid-cols-4 mb-16 md:mb-24">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ y: 20, opacity: 0 }} animate={showY} transition={t(0.45 + i * 0.07)}>
            <StatCounter {...stat} isReady={isReady} />
          </motion.div>
        ))}
      </div>

      {/* Tech stack — numbered index list */}
      <motion.div
        className="grid md:grid-cols-4 gap-y-4 border-t border-black/15 pt-3"
        initial={{ y: 20, opacity: 0 }}
        animate={showY}
        transition={t(0.7)}
      >
        <span className="meta text-black/45">Tech Stack / 技术栈</span>
        <ul className="md:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-x-6">
          {techStack.map((tech, i) => (
            <li key={tech} className="group flex items-baseline gap-3 py-2.5 border-b border-black/10 text-base font-medium text-[#0A0A0A]">
              <span className="meta text-black/30 group-hover:text-[#0A0A0A] transition-colors duration-300">{pad(i + 1)}</span>
              <span className="transition-transform duration-300 group-hover:translate-x-1">{tech}</span>
            </li>
          ))}
        </ul>
      </motion.div>
    </SectionShell>
  );
}
