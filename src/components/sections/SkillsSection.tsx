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
// Hand-set composition on a 100 × 54 frame (all units cqw, so it scales as one picture).
// s = type size, v = set vertically (reads bottom → top). Sizes follow level loosely; art direction wins.
const layout: Record<string, { x: number; y: number; s: number; v?: boolean }> = {
  // focal word: everything else steps down from it in size, and hangs off one of three shared lines (x = 0 / 48 / verticals on the right)
  React: { x: 0, y: 0, s: 22 },
  Motion: { x: 0, y: 20, s: 11 },
  Tauri: { x: 0, y: 31, s: 9 },
  PHP: { x: 22, y: 31, s: 6, v: true },
  Docker: { x: 0, y: 41, s: 6 },
  Rust: { x: 17, y: 48, s: 4.5 },
  'Vue.js': { x: 49, y: 0, s: 8 },
  GSAP: { x: 49, y: 9, s: 6 },
  WebGL: { x: 49, y: 15, s: 4 },
  'CSS Animations': { x: 49, y: 20, s: 4 },
  'Node.js': { x: 49, y: 38, s: 7 },
  Astro: { x: 74, y: 4, s: 7, v: true },
  TailwindCSS: { x: 82.5, y: 20, s: 8, v: true },
  TypeScript: { x: 93, y: 0, s: 8, v: true },
};

export default function SkillsSection({ isReady = false }: SkillsSectionProps) {
  const t = (delay: number, duration = 0.7) =>
    isReady ? { duration, delay, ease: EASE } : { duration: 0.3, delay: 0 };

  // Hovering a word (or a legend label) lights its whole category and pulls the rest back
  const [hover, setHover] = useState<string | null>(null);

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
      {/* Typographic composition: names set in Bebas at very different sizes, some turned 90°, spaced by eye rather than by grid.
          Size ≈ proficiency (the small number is the level). Phones fall back to a wrapped line of the same words. */}
      <div className="hidden md:block relative w-full aspect-[100/54] [container-type:inline-size]">
        {/* One spine between the focal word and the rest, with its origin marked in cyan */}
        <motion.span
          aria-hidden="true"
          className="absolute left-[46.5cqw] top-0 h-full w-px bg-[#0A0A0A]/25 origin-top"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: isReady ? 1 : 0 }}
          transition={t(0.2, 1)}
        />
        <span aria-hidden="true" className="absolute left-[46.5cqw] top-0 h-[2.4cqw] w-[3px] -translate-x-px bg-[#6CE5E8]" />
        {skills.map((skill, i) => {
          const l = layout[skill.name];
          const on = hover === skill.category;
          const self = hover && on;
          return (
            <motion.button
              type="button"
              key={skill.name}
              onMouseEnter={() => setHover(skill.category)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(skill.category)}
              onBlur={() => setHover(null)}
              className={`absolute font-bebas uppercase leading-[0.8] tracking-[0.01em] whitespace-nowrap text-[#0A0A0A] text-left transition-[opacity,box-shadow] duration-300 ${l.v ? '[writing-mode:vertical-rl] rotate-180' : ''} ${hover && !on ? 'opacity-[0.18]' : ''} ${self ? 'shadow-[inset_0_-0.14em_0_#6CE5E8]' : ''}`}
              style={{ left: `${l.x}cqw`, top: `${l.y}cqw`, fontSize: `${l.s}cqw` }}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: isReady ? 1 : 0, y: isReady ? 0 : 14 }}
              transition={t(0.3 + i * 0.05)}
            >
              {skill.name}
              <span className="align-top ml-[0.25em] font-bebas text-[clamp(9px,1.5cqw,14px)] leading-none tracking-normal tabular-nums text-black/45">{skill.level}</span>
            </motion.button>
          );
        })}
      </div>

      <ul className="md:hidden flex flex-wrap items-baseline gap-x-5 gap-y-2 font-bebas uppercase leading-none text-[#0A0A0A]">
        {skills.map((skill) => (
          <li key={skill.name} style={{ fontSize: `${1.6 + (skill.level - 70) * 0.12}rem` }}>
            {skill.name}
            <span className="align-top ml-1 text-[12px] text-black/45 tabular-nums">{skill.level}</span>
          </li>
        ))}
      </ul>

      {/* Legend — also drives the highlight */}
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-[#0A0A0A] pt-2 font-bebas text-[15px] leading-none tracking-[0.06em] text-black/50">
        {categories.map((c, ci) => (
          <span key={c} onMouseEnter={() => setHover(c)} onMouseLeave={() => setHover(null)} className={`transition-colors duration-300 ${hover === c ? 'text-[#0A0A0A]' : ''}`}>
            <span className="mr-2 text-black/40 tabular-nums">{pad(ci + 1)}</span>
            {c}
          </span>
        ))}
      </div>
    </SectionShell>
  );
}
