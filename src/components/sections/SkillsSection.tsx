import { motion } from 'motion/react';
import SectionShell, { pad } from '../SectionShell';

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
      label="TOOLKIT"
      en="Skills"
      zh="技能专长"
      isDark={false}
      isReady={isReady}
      description="技术是工具，创意是灵魂。我相信最好的作品源于对技术的深度理解和对用户体验的极致追求。"
    >
      {/* Type specimen: one row per category. Words start on the same column as Works' titles;
          size = proficiency (--lv 0…1 over levels 75…95), sorted high to low */}
      <div className="border-b border-black/15">
        {categories.map((category, ci) => (
          <motion.div
            key={category}
            className="grid md:grid-cols-9 gap-x-12 gap-y-4 border-t border-[#0A0A0A] pt-3 pb-12 short:pb-7"
            initial={{ y: 15, opacity: 0 }}
            animate={showY}
            transition={t(0.3 + ci * 0.08)}
          >
            <div className="md:col-span-3 flex items-baseline gap-3 leading-none">
              <span className="font-bebas text-[15px] text-black/40 tabular-nums">{pad(ci + 1)}</span>
              <span className="font-bebas text-[20px] tracking-[0.05em] text-[#0A0A0A]">{category}</span>
            </div>
            <ul className="md:col-span-6 flex flex-wrap items-baseline gap-x-8 gap-y-4">
              {[...grouped[category]].sort((x, y) => y.level - x.level).map((skill) => (
                <li
                  key={skill.name}
                  className="font-bold leading-none text-[#0A0A0A] text-[calc(1.35rem_+_var(--lv)_*_0.9rem)] md:text-[calc(1.7rem_+_var(--lv)_*_1.5rem)] short:md:text-[calc(1.5rem_+_var(--lv)_*_1.2rem)] hover:underline decoration-[#6CE5E8] decoration-2 underline-offset-[0.25em]"
                  style={{ '--lv': Math.min(1, Math.max(0, (skill.level - 75) / 20)) } as React.CSSProperties}
                >
                  {skill.name}
                  <sup className="ml-1 align-top font-bebas text-[13px] font-normal text-black/40 tabular-nums no-underline">{skill.level}</sup>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}
