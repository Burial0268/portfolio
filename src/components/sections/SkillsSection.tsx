import { useState } from 'react';
import { motion } from 'motion/react';
import SectionShell, { pad } from '../SectionShell';

interface Skill {
  name: string;
  sym: string;      // element-style symbol
  level: number;
  category: string;
}

interface SkillsSectionProps {
  isReady?: boolean;
}

const EASE = [0.22, 1, 0.36, 1] as const;

const skills: Skill[] = [
  { name: 'React', sym: 'Re', level: 95, category: 'FRONTEND' },
  { name: 'TypeScript', sym: 'Ts', level: 90, category: 'FRONTEND' },
  { name: 'Vue.js', sym: 'Vu', level: 88, category: 'FRONTEND' },
  { name: 'Astro', sym: 'As', level: 85, category: 'FRONTEND' },
  { name: 'Motion', sym: 'Mo', level: 90, category: 'ANIMATION & 3D' },
  { name: 'GSAP', sym: 'Gs', level: 82, category: 'ANIMATION & 3D' },
  { name: 'WebGL', sym: 'Wg', level: 75, category: 'ANIMATION & 3D' },
  { name: 'TailwindCSS', sym: 'Tw', level: 92, category: 'STYLING' },
  { name: 'CSS Animations', sym: 'Cs', level: 88, category: 'STYLING' },
  { name: 'Node.js', sym: 'Nd', level: 80, category: 'TOOLS & BACKEND' },
  { name: 'PHP', sym: 'Ph', level: 85, category: 'TOOLS & BACKEND' },
  { name: 'Tauri', sym: 'Ta', level: 88, category: 'TOOLS & BACKEND' },
  { name: 'Rust', sym: 'Ru', level: 75, category: 'TOOLS & BACKEND' },
  { name: 'Docker', sym: 'Dk', level: 78, category: 'TOOLS & BACKEND' },
];

const categories = [...new Set(skills.map((s) => s.category))];

export default function SkillsSection({ isReady = false }: SkillsSectionProps) {
  const t = (delay: number, duration = 0.6) =>
    isReady ? { duration, delay, ease: EASE } : { duration: 0.3, delay: 0 };

  // Legend ↔ cells: hovering (or tapping) a category lights its cells and dims the rest
  const [hover, setHover] = useState<string | null>(null);
  const [pin, setPin] = useState<string | null>(null);
  const focus = hover ?? pin;

  return (
    <SectionShell
      no={3}
      label="TOOLKIT"
      en="Skills"
      zh="技能专长"
      isDark={false}
      isReady={isReady}
      description="技术是工具，创意是灵魂。我相信最好的作品源于对技术的深度理解和对用户体验的极致追求。"
    >
      {/* Periodic table of skills: a strict hairline grid, one cell per skill — number, level, symbol, name, level bar (60–100 scale).
          The legend is the filter. */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: isReady ? 1 : 0 }} transition={t(0.3, 0.5)} className="flex flex-wrap gap-x-6 gap-y-2 font-bebas text-[15px] leading-none tracking-[0.06em]">
        {categories.map((c, ci) => (
          <button
            key={c}
            onMouseEnter={() => setHover(c)}
            onMouseLeave={() => setHover(null)}
            onClick={() => setPin((p) => (p === c ? null : c))}
            aria-pressed={pin === c}
            className={`flex items-baseline gap-2 pb-1 border-b-2 transition-colors duration-300 ${focus === c ? 'border-[#6CE5E8] text-[#0A0A0A]' : 'border-transparent text-black/45 hover:text-[#0A0A0A]'}`}
          >
            <span className="tabular-nums text-black/40">{pad(ci + 1)}</span>
            {c}
            <span className="text-black/40 tabular-nums">{pad(skills.filter((s) => s.category === c).length)}</span>
          </button>
        ))}
      </motion.div>

      <div className="mt-4 grid grid-cols-3 md:grid-cols-5 xl:grid-cols-7 gap-px bg-black/20 border border-black/20 [--cell:13rem] short:[--cell:10rem]">
        {skills.map((skill, i) => {
          const dim = focus && focus !== skill.category;
          return (
            <motion.div
              key={skill.name}
              className={`group/c relative flex flex-col justify-between h-(--cell) p-3 bg-white hover:bg-[#0A0A0A] transition-colors duration-300 `}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: isReady ? 1 : 0, y: isReady ? 0 : 8 }}
              transition={t(0.35 + (i % 7) * 0.05 + Math.floor(i / 7) * 0.04, 0.5)}
            >
              {/* dimming lives on an inner layer so it isn't delayed by the entrance transition */}
              <div className={`flex h-full flex-col justify-between p-3 transition-opacity duration-300 ${dim ? 'opacity-30' : ''}`}>
                <div className="flex justify-between font-bebas text-[13px] leading-none tabular-nums text-black/40 group-hover/c:text-white/50 transition-colors duration-300">
                  <span>{pad(i + 1)}</span>
                  <span>{skill.level}</span>
                </div>
                <div>
                  <div className="font-bebas text-[4.5rem] short:text-[3.5rem] leading-[0.85] text-[#0A0A0A] group-hover/c:text-[#6CE5E8] transition-colors duration-300">{skill.sym}</div>
                  <div className="mt-2 text-[12px] md:text-[13px] font-bold leading-tight text-[#0A0A0A] group-hover/c:text-white transition-colors duration-300">{skill.name}</div>
                </div>
              </div>
              <motion.span
                className="absolute left-0 bottom-0 h-[3px] w-full bg-[#0A0A0A] group-hover/c:bg-[#6CE5E8] origin-left transition-colors duration-300"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: isReady ? (skill.level - 60) / 40 : 0 }}
                transition={t(0.6 + (i % 7) * 0.05, 0.8)}
              />
            </motion.div>
          );
        })}
        {/* 14 skills: one blank cell squares off the 3- and 5-column grids */}
        <div className="bg-white xl:hidden" aria-hidden="true" />
      </div>
    </SectionShell>
  );
}
