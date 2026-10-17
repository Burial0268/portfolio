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
  const showY = isReady ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 };
  const t = (delay: number, duration = 0.7) =>
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
    <SectionShell index={4} total={5} en="Skills" zh="技能" heading="技能专长" isDark={false} isReady={isReady}>
      {/* One category per grid column */}
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-y-12 mb-16 md:mb-24">
        {categories.map((category, ci) => (
          <motion.div
            key={category}
            className="sm:pr-6"
            initial={{ y: 20, opacity: 0 }}
            animate={showY}
            transition={t(0.3 + ci * 0.08)}
          >
            <div className="flex justify-between border-t border-[#0A0A0A] pt-3 mb-5 meta">
              <span className="text-[#0A0A0A]">{category}</span>
              <span className="text-black/40">({pad(grouped[category].length)})</span>
            </div>
            <ul>
              {grouped[category].map((skill, si) => (
                <li key={skill.name} className="relative py-2.5 border-b border-black/10">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-lg md:text-xl font-semibold tracking-[-0.02em] text-[#0A0A0A]">{skill.name}</span>
                    <span className="meta text-black/40 tabular-nums">{skill.level}</span>
                  </div>
                  {/* Proficiency hairline grows in once the section is ready */}
                  <motion.span
                    className="absolute left-0 -bottom-px h-px bg-[#0A0A0A] origin-left"
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

      {/* Pull quote */}
      <motion.div
        className="grid md:grid-cols-4 gap-y-4 border-t border-black/15 pt-3"
        initial={{ y: 20, opacity: 0 }}
        animate={showY}
        transition={t(0.7)}
      >
        <span className="meta text-black/45">Motto / 信条</span>
        <p className="md:col-span-3 text-2xl md:text-3xl lg:text-4xl font-semibold leading-[1.2] tracking-[-0.025em] text-[#0A0A0A] max-w-4xl">
          技术是工具，创意是灵魂。<span className="text-black/35">我相信最好的作品源于对技术的深度理解和对用户体验的极致追求。</span>
        </p>
      </motion.div>
    </SectionShell>
  );
}
