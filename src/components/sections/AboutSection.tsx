import { motion } from 'motion/react';
import { useCountUp } from '@/hooks/useCountUp';
import SectionShell from '../SectionShell';

function StatCounter({ value, label, suffix, isReady }: { value: number; label: string; suffix: string; isReady: boolean }) {
  const { ref, value: count } = useCountUp(value, 1.2, isReady);

  return (
    <div className="border-t border-black/15 pt-3 pr-4">
      <div className="font-bebas text-[13px] tracking-[0.1em] text-black/45">{label}</div>
      <div className="mt-2 text-display text-[3.25rem] md:text-[4.5rem] md:short:text-[3.5rem] text-[#0A0A0A] tabular-nums">
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
  const showY = isReady ? { y: 0, opacity: 1 } : { y: 15, opacity: 0 };
  const t = (delay: number) =>
    isReady
      ? { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const }
      : { duration: 0.3, delay: 0 };

  const stats = [
    { value: 5, label: '年经验 / YEARS', suffix: '+' },
    { value: 50, label: '项目完成 / PROJECTS', suffix: '+' },
    { value: 20, label: '技术栈 / TOOLS', suffix: '+' },
    { value: 99, label: '满意度 / SATISFACTION', suffix: '%' },
  ];

  const techStack = [
    'React', 'TypeScript', 'Next.js', 'Astro', 'Vue',
    'Tailwind CSS', 'Motion', 'Node.js', 'WebGL',
    'Git', 'Vite', 'Rust', 'Tauri', 'PHP'
  ];

  return (
    <SectionShell
      label="PROFILE"
      en="About Me"
      zh="关于我"
      isDark={false}
      isReady={isReady}
      subIndex={[
        { key: 'profile', label: 'PROFILE / 简介', active: true },
        { key: 'numbers', label: 'KEY NUMBERS / 数据' },
        { key: 'stack', label: 'TECH STACK / 技术栈' },
      ]}
      description="对动效设计和 3D 可视化有浓厚兴趣，致力于将创意转化为令人惊叹的数字体验。相信优秀的设计与技术实现应该完美结合。"
    >
      {/* Statement */}
      <motion.p
        className="text-2xl md:text-3xl xl:text-[2.6rem] xl:short:text-[2rem] font-bold text-[#0A0A0A] leading-[1.25] tracking-[-0.01em] max-w-4xl"
        initial={{ y: 15, opacity: 0 }}
        animate={showY}
        transition={t(0.3)}
      >
        我是一名热爱技术的全栈开发工程师，专注于打造<span className="bg-[#6CE5E8] px-1">极致的用户体验</span>。擅长使用现代 Web 技术栈构建高性能、富交互的应用程序。
      </motion.p>

      <motion.div
        className="flex flex-wrap gap-x-5 gap-y-1 mt-6 font-bebas text-[17px] tracking-[0.06em] text-[#0A0A0A]"
        initial={{ y: 15, opacity: 0 }}
        animate={showY}
        transition={t(0.38)}
      >
        <span>FRONTEND 前端开发</span>
        <span className="text-[#6CE5E8]">/</span>
        <span>MOTION 动效设计</span>
        <span className="text-[#6CE5E8]">/</span>
        <span>BACKEND 后端开发</span>
      </motion.div>

      {/* Key numbers — one per column */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 mt-12 short:mt-8">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ y: 15, opacity: 0 }} animate={showY} transition={t(0.45 + i * 0.06)}>
            <StatCounter {...stat} isReady={isReady} />
          </motion.div>
        ))}
      </div>

      {/* Tech stack — boxed index list */}
      <motion.div className="mt-12 short:mt-8 border-t border-black/15 pt-3" initial={{ y: 15, opacity: 0 }} animate={showY} transition={t(0.7)}>
        <div className="font-bebas text-[13px] tracking-[0.1em] text-black/45 mb-3">TECH STACK / 技术栈</div>
        <ul className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-7 gap-x-4 gap-y-2">
          {techStack.map((tech) => (
            <li key={tech} className="group flex items-center gap-2 text-sm font-medium text-[#0A0A0A] whitespace-nowrap">
              <span className="w-[7px] h-[7px] border border-black/40 group-hover:bg-[#6CE5E8] group-hover:border-[#6CE5E8] transition-colors duration-300" />
              {tech}
            </li>
          ))}
        </ul>
      </motion.div>
    </SectionShell>
  );
}
