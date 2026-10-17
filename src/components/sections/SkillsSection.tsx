import { motion } from 'motion/react';
import SectionShell from '../SectionShell';

interface Skill {
  name: string;
  level: number;
  category: string;
}

interface SkillsSectionProps {
  isReady?: boolean;
}

export default function SkillsSection({ isReady = false }: SkillsSectionProps) {
  const showL = isReady ? { x: 0, opacity: 1 } : { x: -15, opacity: 0 };
  const showY = isReady ? { y: 0, opacity: 1 } : { y: 15, opacity: 0 };
  const t = (delay: number) =>
    isReady
      ? { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const }
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
      sidebarLabel="技能"
      sidebarVerticalText="SKILLS"
      isDark={false}
      tagLine="▼ / BURIAL0268"
      badgeText="SKILLS"
      heading="技能专长"
      metaLine="// SUPER::PORTFOLIO::SKILLS::GET()"
      isReady={isReady}
    >
      {/* Category rows */}
      <div className="space-y-8 mb-12">
        {categories.map((category, ci) => (
          <motion.div
            key={category}
            initial={{ x: -15, opacity: 0 }}
            animate={showL}
            transition={t(0.3 + ci * 0.08)}
          >
            {/* Category label + separator */}
            <div className="flex items-center gap-4 mb-4">
              <span className="inline-block w-3 h-2 bg-[#0A0A0A] -skew-x-12 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#0A0A0A] whitespace-nowrap">
                {category}
              </span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Skill names inline */}
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {grouped[category].map((skill) => (
                <span
                  key={skill.name}
                  className={`text-base ${
                    skill.level >= 90
                      ? 'font-bold text-[#0A0A0A]'
                      : skill.level >= 80
                        ? 'font-medium text-gray-700'
                        : 'font-normal text-gray-500'
                  }`}
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom separator + quote */}
      <motion.div
        initial={{ y: 15, opacity: 0 }}
        animate={showY}
        transition={t(0.6)}
      >
        <div className="h-px bg-gray-200 mb-8" />
        <p className="text-gray-500 text-sm leading-relaxed max-w-2xl">
          技术是工具，创意是灵魂。我相信最好的作品源于对技术的深度理解和对用户体验的极致追求。
        </p>
      </motion.div>
    </SectionShell>
  );
}
