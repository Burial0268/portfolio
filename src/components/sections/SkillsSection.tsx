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
// Radial composition on a 100 × 54 frame (cqw, so it scales as one picture). React is the centre; every other skill
// sits on a rectangular ring whose distance from the centre grows as its level drops (rings = 100 / 90 / 80), at its
// own angle (deg, 0 = right, 90 = down). Long names run horizontally, short names vertically, and both grow outward
// from the ring point. s = type size.
const CX = 50, CY = 27.5, XS = 1.25, YS = 0.62;
const ringR = (level: number) => 15 + (100 - level) * 0.5;
const ring = { 100: ringR(100), 90: ringR(90), 80: ringR(80) };
const placed: Record<string, { a: number; s: number }> = {
  TypeScript: { a: 180, s: 5.5 },
  TailwindCSS: { a: -8, s: 5 },
  'Vue.js': { a: -150, s: 8 },
  Motion: { a: -40, s: 8 },
  Docker: { a: 155, s: 6 },
  'Node.js': { a: 42, s: 6 },
  'CSS Animations': { a: 14, s: 3.8 },
  Astro: { a: -118, s: 4.5 },
  GSAP: { a: -68, s: 5 },
  WebGL: { a: -90, s: 4.2 },
  Tauri: { a: 105, s: 5 },
  PHP: { a: 75, s: 6 },
  Rust: { a: 128, s: 4.5 },
};
const REACT_S = 11;
const isLong = (name: string) => name.length >= 6; // long → horizontal, short → vertical
const anchor = (name: string, level: number) => {
  const { a } = placed[name];
  const r = ringR(level), th = (a * Math.PI) / 180;
  const cos = Math.cos(th), sin = Math.sin(th);
  // where the ray from the centre meets the ring's rectangle
  const t = Math.min((XS * r) / Math.max(Math.abs(cos), 1e-6), (YS * r) / Math.max(Math.abs(sin), 1e-6));
  return { x: CX + cos * t, y: CY + sin * t, cos, sin };
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
        {/* Plane, line, point — all straight: a cyan square under the centre word, rectangular rings by level, a crosshair, hairline spokes to every word */}
        <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 100 54" aria-hidden="true">
          <motion.rect x={CX - 8} y={CY - 8} width="16" height="16" fill="#6CE5E8" initial={{ scale: 0 }} animate={{ scale: isReady ? 1 : 0 }} style={{ transformOrigin: `${CX}px ${CY}px`, transformBox: 'view-box' }} transition={t(0.2, 0.9)} />
          <line x1="0" x2="100" y1={CY} y2={CY} stroke="#0A0A0A" strokeOpacity="0.2" strokeWidth="0.1" />
          <line y1="0" y2="54" x1={CX} x2={CX} stroke="#0A0A0A" strokeOpacity="0.2" strokeWidth="0.1" />
          {Object.entries(ring).map(([lv, r]) => (
            <g key={lv}>
              <rect x={CX - XS * r} y={CY - YS * r} width={2 * XS * r} height={2 * YS * r} fill="none" stroke="#0A0A0A" strokeOpacity="0.3" strokeWidth="1" strokeDasharray="3 4" vectorEffect="non-scaling-stroke" />
              <text x={CX + XS * r + 0.8} y={CY - 0.8} fontSize="1.5" fill="#0A0A0A" fillOpacity="0.4" className="font-bebas">{lv}</text>
            </g>
          ))}
          {skills.filter((k) => k.name !== 'React').map((k) => {
            const p = anchor(k.name, k.level);
            return (
              <g key={k.name}>
                <motion.line x1={CX} y1={CY} x2={p.x} y2={p.y} stroke="#0A0A0A" strokeOpacity="0.35" strokeWidth="0.12" initial={{ pathLength: 0 }} animate={{ pathLength: isReady ? 1 : 0 }} transition={t(0.4, 0.9)} />
                <rect x={p.x - 0.55} y={p.y - 0.55} width="1.1" height="1.1" fill="#0A0A0A" />
              </g>
            );
          })}
        </svg>

        {skills.map((skill, i) => {
          const react = skill.name === 'React';
          const v = react || !isLong(skill.name);
          const s = react ? REACT_S : placed[skill.name].s;
          const p = react ? { x: CX, y: CY, cos: 0, sin: 0 } : anchor(skill.name, skill.level);
          // the word grows outward from its ring point: horizontal words go left/right of it, vertical ones up/down
          const tx = react || v ? '-50%' : p.cos < 0 ? '-100%' : '0%';
          const ty = react ? '-50%' : v ? (p.sin < 0 ? '-100%' : '0%') : '-50%';
          const on = hover === skill.category;
          return (
            <div key={skill.name} className={`absolute transition-opacity duration-300 ${hover && !on ? 'opacity-[0.18]' : ''}`} style={{ left: `${p.x}cqw`, top: `${p.y}cqw`, transform: `translate(${tx}, ${ty})`, zIndex: react ? 2 : 1 }}>
              <motion.button
                type="button"
                onMouseEnter={() => setHover(skill.category)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(skill.category)}
                onBlur={() => setHover(null)}
                className={`block font-bebas uppercase leading-[0.8] tracking-[0.01em] whitespace-nowrap text-[#0A0A0A] text-left transition-[background-color] duration-300 ${v ? '[writing-mode:vertical-rl] rotate-180' : ''} ${hover && on ? 'bg-[#6CE5E8]' : ''}`}
                style={{ fontSize: `${s}cqw` }}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: isReady ? 1 : 0, scale: isReady ? 1 : 0.92 }}
                transition={t(0.45 + i * 0.05)}
              >
                {skill.name}
                <span className="align-top ml-[0.25em] font-bebas text-[clamp(9px,1.5cqw,14px)] leading-none tracking-normal tabular-nums text-black/45">{skill.level}</span>
              </motion.button>
            </div>
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
