import { motion } from 'motion/react';
import SectionShell, { pad } from '../SectionShell';

// Proficiency scale shown on the axis
const MIN = 70, MAX = 100, TICKS = MAX - MIN;
const TICK = 'linear-gradient(90deg, rgba(10,10,10,.25) 1px, transparent 1px)';
const GRID = 'linear-gradient(90deg, rgba(10,10,10,.07) 1px, transparent 1px)';

interface Skill {
  name: string;
  level: number;
  category: string;
}

interface SkillsSectionProps {
  isReady?: boolean;
}

export default function SkillsSection({ isReady = false }: SkillsSectionProps) {
  const showY = isReady ? { y: 0, opacity: 1 } : { y: 15, opacity: 0 };
  const t = (delay: number, duration = 0.6) =>
    isReady
      ? { duration, delay, ease: [0.22, 1, 0.36, 1] as const }
      : { duration: 0.3, delay: 0 };

  const skills: Skill[] = [
    { name: 'React', level: 95, category: 'FRONTEND' },
    { name: 'TypeScript', level: 90, category: 'FRONTEND' },
    { name: 'Vue.js', level: 88, category: 'FRONTEND' },
    { name: 'Astro', level: 85, category: 'FRONTEND' },
    { name: 'Motion', level: 90, category: 'ANIMATION & 3D' },
    { name: 'GSAP', level: 82, category: 'ANIMATION & 3D' },
    { name: 'WebGL', level: 75, category: 'ANIMATION & 3D' },
    { name: 'TailwindCSS', level: 92, category: 'STYLING' },
    { name: 'CSS Animations', level: 88, category: 'STYLING' },
    { name: 'Node.js', level: 80, category: 'TOOLS & BACKEND' },
    { name: 'PHP', level: 85, category: 'TOOLS & BACKEND' },
    { name: 'Tauri', level: 88, category: 'TOOLS & BACKEND' },
    { name: 'Rust', level: 75, category: 'TOOLS & BACKEND' },
    { name: 'Docker', level: 78, category: 'TOOLS & BACKEND' },
  ];

  // Group by category preserving insertion order
  const grouped = skills.reduce<Record<string, Skill[]>>((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {});

  const categories = Object.keys(grouped);

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
      {/* Strip plot on a ruler: one band per category, one "flag pole" per skill at x = proficiency.
          Poles step through 3 lanes (4 on phones, where the plot is narrower; sorted high → low) so labels never collide. Plot starts on the
          same column as Works' titles. */}
      <div className="[--lane:30px] short:[--lane:26px]">
        {categories.map((category, ci) => (
          <div key={category} className="grid md:grid-cols-9 gap-x-12 gap-y-3 border-t border-[#0A0A0A] pt-3">
            <div className="md:col-span-3 flex items-baseline gap-3 leading-none">
              <span className="font-bebas text-[15px] text-black/40 tabular-nums">{pad(ci + 1)}</span>
              <span className="font-bebas text-[20px] tracking-[0.05em] text-[#0A0A0A]">{category}</span>
            </div>
            <ul
              className="md:col-span-6 relative isolate h-[calc(var(--lane)*4+16px)] md:h-[calc(var(--lane)*3+16px)] [&:hover>li:not(:hover)]:opacity-35"
              style={{ backgroundImage: GRID, backgroundSize: `calc(100% / ${TICKS / 5}) 100%` }}
            >
              {[...grouped[category]].sort((x, y) => y.level - x.level).map((skill, si) => {
                const pct = ((skill.level - MIN) / (MAX - MIN)) * 100;
                const flip = pct > 78; // near the right edge the label hangs to the left of its pole
                return (
                  <li
                    key={skill.name}
                    className="group/s absolute bottom-0 w-0 transition-opacity duration-300 top-[calc(var(--lane)*var(--i4))] md:top-[calc(var(--lane)*var(--i3))]"
                    style={{ left: `${pct}%`, '--i3': si % 3, '--i4': si % 4 } as React.CSSProperties}
                  >
                    <motion.span
                      className="absolute left-0 top-0 bottom-0 w-px bg-[#0A0A0A]/70 group-hover/s:bg-[#6CE5E8] group-hover/s:w-0.5 origin-bottom transition-colors duration-300"
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: isReady ? 1 : 0 }}
                      transition={t(0.35 + ci * 0.08 + si * 0.05)}
                    />
                    <motion.span
                      // label sits on a page-colored halo so other poles break behind the text instead of striking through it
                      className={`absolute z-10 top-0 whitespace-nowrap leading-none font-bold text-[14px] md:text-[16px] text-[#0A0A0A] bg-white px-1.5 py-px ${flip ? 'right-0.5 text-right' : 'left-0.5'}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: isReady ? 1 : 0 }}
                      transition={t(0.45 + ci * 0.08 + si * 0.05)}
                    >
                      {skill.name}
                      <span className="ml-1.5 font-bebas text-[13px] font-normal text-black/40 tabular-nums">{skill.level}</span>
                    </motion.span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        {/* Shared axis — same ruler motif as the hero, ticks tied to the 70–100 scale */}
        <div className="grid md:grid-cols-9 gap-x-12 border-t border-[#0A0A0A] mt-0">
          <div className="hidden md:block md:col-span-3" />
          <div className="md:col-span-6 relative">
            <div
              className="h-[9px]"
              style={{
                backgroundImage: `${TICK}, ${TICK}`,
                backgroundSize: `calc(100% / ${TICKS}) 4px, calc(100% / ${TICKS / 5}) 9px`,
                backgroundRepeat: 'repeat-x',
              }}
            />
            <div className="relative h-5 mt-1 font-bebas text-[13px] leading-none text-black/40 tabular-nums">
              {Array.from({ length: TICKS / 5 + 1 }, (_, i) => MIN + i * 5).map((v, i, all) => (
                <span
                  key={v}
                  className="absolute"
                  style={{ left: `${(i / (all.length - 1)) * 100}%`, transform: i === 0 ? 'none' : i === all.length - 1 ? 'translateX(-100%)' : 'translateX(-50%)' }}
                >
                  {v}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
