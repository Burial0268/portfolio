import { useEffect, useState } from 'react';
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
const groups = categories.map((c) => skills.filter((s) => s.category === c));
// Bars are drawn on a 60–100 scale so 75 and 95 read as clearly different
const pctOf = (level: number) => ((level - 60) / 40) * 100;

export default function SkillsSection({ isReady = false }: SkillsSectionProps) {
  const t = (delay: number, duration = 0.7) =>
    isReady ? { duration, delay, ease: EASE } : { duration: 0.3, delay: 0 };

  // Bars rise from the baseline on desktop and extend from the left on phones
  const [wide, setWide] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    setWide(mq.matches);
    const on = (e: MediaQueryListEvent) => setWide(e.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  let n = 0;

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
      {/* Skyline: every skill is a solid ink block whose height is its level, name set up the side of the bar.
          Heavy black mass against white; hover turns one bar cyan and pulls the rest back. Phones turn it 90° (bars grow rightwards). */}
      <div className="md:[--H:min(52vh,480px)] short:md:[--H:min(42vh,330px)]">
        <div className="relative md:h-(--H)">
          {/* Reference lines — only visible above the shorter bars */}
          <div className="hidden md:block absolute inset-0 pointer-events-none" aria-hidden="true">
            {[70, 80, 90, 100].map((v) => (
              <div key={v} className="absolute inset-x-0 border-t border-dashed border-black/20" style={{ bottom: `${pctOf(v)}%` }}>
                <span className="absolute right-0 -top-4 font-bebas text-[13px] leading-none text-black/40 tabular-nums">{v}</span>
              </div>
            ))}
          </div>

          <div className="relative md:h-full flex flex-col gap-8 md:flex-row md:items-end md:gap-4 [&:has(.bar:hover)_.bar:not(:hover)]:opacity-40">
            {groups.map((group, gi) => (
              <div key={categories[gi]} className="flex flex-col gap-2 md:contents">
                <div className="md:hidden font-bebas text-[15px] leading-none tracking-[0.06em] text-black/50 border-t border-[#0A0A0A] pt-2">
                  <span className="text-black/40 mr-2 tabular-nums">{pad(gi + 1)}</span>
                  {categories[gi]}
                </div>
                <ul className="flex flex-col gap-1 md:h-full md:basis-0 md:min-w-0 md:flex-row md:items-end" style={{ flexGrow: group.length }}>
                  {group.map((skill) => {
                    const i = n++;
                    const p = pctOf(skill.level);
                    return (
                      <li
                        key={skill.name}
                        className="bar group/b relative h-10 md:h-(--p) md:flex-1 md:min-w-0 transition-opacity duration-300"
                        style={{ '--p': `${p}%`, width: wide ? undefined : `${Math.max(p, 40)}%` } as React.CSSProperties}
                      >
                        <motion.span
                          className="absolute inset-0 bg-[#0A0A0A] group-hover/b:bg-[#6CE5E8] transition-colors duration-300 origin-left md:origin-bottom"
                          initial={{ scaleX: wide ? 1 : 0, scaleY: wide ? 0 : 1 }}
                          animate={{ scaleX: wide || isReady ? 1 : 0, scaleY: !wide || isReady ? 1 : 0 }}
                          transition={t(0.3 + i * 0.045)}
                        />
                        <motion.div
                          className="relative z-10 flex h-full items-center justify-between px-3 md:flex-col md:items-center md:px-0 md:py-3 text-white group-hover/b:text-[#0A0A0A] transition-colors duration-300"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: isReady ? 1 : 0 }}
                          transition={t(0.6 + i * 0.045, 0.5)}
                        >
                          <span className="font-bebas text-[22px] leading-none tabular-nums text-[#6CE5E8] group-hover/b:text-[#0A0A0A] transition-colors duration-300 md:order-first">{skill.level}</span>
                          <span className="font-bold text-[15px] md:text-[18px] leading-none whitespace-nowrap md:[writing-mode:vertical-rl] md:rotate-180">{skill.name}</span>
                        </motion.div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Category labels under the baseline, each spanning its own bars */}
        <div className="hidden md:flex gap-4 border-t border-[#0A0A0A] mt-0">
          {groups.map((group, gi) => (
            <div key={categories[gi]} className="min-w-0 pt-2 font-bebas text-[15px] leading-none tracking-[0.06em] text-black/50 whitespace-nowrap overflow-hidden" style={{ flexGrow: group.length, flexBasis: 0 }}>
              <span className="text-black/40 mr-2 tabular-nums">{pad(gi + 1)}</span>
              {categories[gi]}
            </div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
