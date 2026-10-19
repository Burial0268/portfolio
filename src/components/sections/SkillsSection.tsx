import { useEffect, useState } from 'react';
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

const EASE = [0.22, 1, 0.36, 1] as const;

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

const categories = [...new Set(skills.map((s) => s.category))];

/*
 * Constructivist pinwheel: the words alone make the picture — no rules, rings or planes.
 * React stands in the middle, vertical. Four arms hang off its four sides, each rotated one step round it:
 * long names run horizontally to the left and right, short names vertically above and below.
 * Every arm is justified — each word is sized so its length equals the arm's length — so the arms read as solid blocks of type.
 */
const ARMS = {
  left: { w: 33, names: ['TypeScript', 'Vue.js', 'Docker'] },          // right edge on React, bottom on React's bottom, grows up
  right: { w: 38, names: ['Motion', 'TailwindCSS', 'CSS Animations', 'Node.js'] }, // left edge on React, top on React's top, grows down
  top: { w: 15, names: ['Astro', 'GSAP', 'WebGL'] },                  // bottom on React, left edge on React's left, grows right
  bottom: { w: 15, names: ['PHP', 'Tauri', 'Rust'] },                 // top on React, right edge on React, grows left
};
const REACT_LEN = 25, GAP = 0.6, ARM_GAP = 1.6, LEAD = 0.8, FRAME_W = 100, FRAME_H = 54;

type Em = Record<string, number>; // width of each name in em (Bebas, uppercase)
const guessEm = (name: string) => name.length * 0.4;

interface Box { name: string; x: number; y: number; s: number; v: boolean; arm: keyof typeof ARMS | 'center' }

function compose(em: Em): Box[] {
  const e = (n: string) => em[n] ?? guessEm(n);
  const boxes: Box[] = [];
  const sR = REACT_LEN / e('React');
  const rw = LEAD * sR;
  // origin = top-left of React's box
  boxes.push({ name: 'React', x: 0, y: 0, s: sR, v: true, arm: 'center' });

  let y = 0;
  for (const n of ARMS.right.names) { const s = ARMS.right.w / e(n); boxes.push({ name: n, x: rw + ARM_GAP, y, s, v: false, arm: 'right' }); y += LEAD * s + GAP; }
  let yl = REACT_LEN;
  for (const n of ARMS.left.names) { const s = ARMS.left.w / e(n), h = LEAD * s; yl -= h; boxes.push({ name: n, x: -ARMS.left.w - ARM_GAP, y: yl, s, v: false, arm: 'left' }); yl -= GAP; }
  let xt = 0;
  for (const n of ARMS.top.names) { const s = ARMS.top.w / e(n), w = LEAD * s; boxes.push({ name: n, x: xt, y: -ARMS.top.w - ARM_GAP, s, v: true, arm: 'top' }); xt += w + GAP; }
  let xb = rw;
  for (const n of ARMS.bottom.names) { const s = ARMS.bottom.w / e(n), w = LEAD * s; xb -= w; boxes.push({ name: n, x: xb, y: REACT_LEN + ARM_GAP, s, v: true, arm: 'bottom' }); xb -= GAP; }

  // fit the whole thing into the frame, centred
  const ext = boxes.map((b) => {
    const len = e(b.name) * b.s, th = LEAD * b.s;
    return { x0: b.x, y0: b.y, x1: b.x + (b.v ? th : len), y1: b.y + (b.v ? len : th) };
  });
  const x0 = Math.min(...ext.map((r) => r.x0)), x1 = Math.max(...ext.map((r) => r.x1));
  const y0 = Math.min(...ext.map((r) => r.y0)), y1 = Math.max(...ext.map((r) => r.y1));
  const pad = 3.2; // room for the level numbers hanging off the outer ends
  const f = Math.min((FRAME_W - 2 * pad) / (x1 - x0), (FRAME_H - 2 * pad) / (y1 - y0));
  const ox = (FRAME_W - (x1 - x0) * f) / 2 - x0 * f, oy = (FRAME_H - (y1 - y0) * f) / 2 - y0 * f;
  return boxes.map((b) => ({ ...b, x: b.x * f + ox, y: b.y * f + oy, s: b.s * f }));
}

export default function SkillsSection({ isReady = false }: SkillsSectionProps) {
  const t = (delay: number, duration = 0.7) =>
    isReady ? { duration, delay, ease: EASE } : { duration: 0.3, delay: 0 };

  // Measure the real width of every name once Bebas is in, so each arm's edge is flush
  const [em, setEm] = useState<Em>({});
  useEffect(() => {
    let live = true;
    document.fonts.load('100px "Bebas Neue"').then(() => {
      if (!live) return;
      const ctx = document.createElement('canvas').getContext('2d');
      if (!ctx) return;
      ctx.font = '100px "Bebas Neue"';
      setEm(Object.fromEntries(skills.map((k) => {
        const u = k.name.toUpperCase();
        return [k.name, ctx.measureText(u).width / 100 + u.length * 0.01]; // + the 0.01em tracking
      })));
    }).catch(() => {});
    return () => { live = false; };
  }, []);

  // Hovering a word (or a legend label) lights its whole category and pulls the rest back
  const [hover, setHover] = useState<string | null>(null);
  const boxes = compose(em);
  const byName = Object.fromEntries(skills.map((k) => [k.name, k]));

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
      <div className="hidden md:block relative w-full aspect-[100/54] [container-type:inline-size]">
        {boxes.map((b, i) => {
          const k = byName[b.name];
          const on = hover === k.category;
          // number hangs off the word's outer end
          const labelPos =
            b.arm === 'right' ? 'left-full ml-[0.5cqw] top-0'
            : b.arm === 'left' ? 'right-full mr-[0.5cqw] top-0'
            : b.arm === 'top' ? 'bottom-full mb-[0.4cqw] left-0'
            : b.arm === 'bottom' ? 'top-full mt-[0.4cqw] left-0'
            : 'left-full ml-[0.15cqw] bottom-0';
          return (
            <div key={b.name} className={`absolute transition-opacity duration-300 ${hover && !on ? 'opacity-[0.18]' : ''}`} style={{ left: `${b.x}cqw`, top: `${b.y}cqw` }}>
              <motion.button
                type="button"
                onMouseEnter={() => setHover(k.category)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(k.category)}
                onBlur={() => setHover(null)}
                className={`block font-bebas uppercase leading-[0.8] tracking-[0.01em] whitespace-nowrap text-[#0A0A0A] text-left transition-[background-color] duration-300 ${b.v ? '[writing-mode:vertical-rl] rotate-180' : ''} ${hover && on ? 'bg-[#6CE5E8]' : ''}`}
                style={{ fontSize: `${b.s}cqw` }}
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: isReady ? 1 : 0, scale: isReady ? 1 : 0.94 }}
                transition={t(0.3 + i * 0.05)}
              >
                {b.name}
              </motion.button>
              <span className={`pointer-events-none absolute font-bebas text-[clamp(9px,1.4cqw,14px)] leading-none tabular-nums text-black/45 ${labelPos}`}>{k.level}</span>
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
