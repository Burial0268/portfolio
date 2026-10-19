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
      {/* One category per column */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-x-8 gap-y-12">
        {categories.map((category, ci) => (
          <motion.div key={category} initial={{ y: 15, opacity: 0 }} animate={showY} transition={t(0.3 + ci * 0.08)}>
            <div className="flex items-baseline justify-between border-t border-[#0A0A0A] pt-3 mb-2">
              <span className="font-bebas text-[20px] leading-none tracking-[0.05em] text-[#0A0A0A]">{category}</span>
              <span className="font-bebas text-[15px] leading-none text-black/40">({pad(grouped[category].length)})</span>
            </div>
            <ul>
              {grouped[category].map((skill, si) => (
                <li key={skill.name} className="relative py-3 short:py-2 border-b border-black/10">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[clamp(1rem,1.3vw,1.25rem)] font-bold text-[#0A0A0A]">{skill.name}</span>
                    <span className="font-bebas text-[15px] text-black/40 tabular-nums">{skill.level}</span>
                  </div>
                  {/* Proficiency hairline grows in once the section is ready */}
                  <motion.span
                    className="absolute left-0 -bottom-px h-px bg-[#6CE5E8] origin-left"
                    style={{ width: `${skill.level}%` }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: isReady ? 1 : 0 }}
                    transition={t(0.5 + ci * 0.08 + si * 0.05, 1)}
                  />
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}
