import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import SectionShell, { pad } from '../SectionShell';

type Arm = 'left' | 'right' | 'top' | 'bottom';

interface Skill {
  name: string;
  level: number;
  category: string;
  arm: Arm | 'center'; // desktop pinwheel arm; list order within an arm = order here
}

interface SkillsSectionProps {
  isReady?: boolean;
}

const EASE = [0.22, 1, 0.36, 1] as const;

const skills: Skill[] = [
  { name: 'React', level: 95, category: 'FRONTEND', arm: 'center' },
  { name: 'TypeScript', level: 90, category: 'FRONTEND', arm: 'left' },
  { name: 'Vue.js', level: 88, category: 'FRONTEND', arm: 'left' },
  { name: 'Astro', level: 85, category: 'FRONTEND', arm: 'top' },
  { name: 'Motion', level: 90, category: 'ANIMATION & 3D', arm: 'right' },
  { name: 'GSAP', level: 82, category: 'ANIMATION & 3D', arm: 'top' },
  { name: 'WebGL', level: 75, category: 'ANIMATION & 3D', arm: 'top' },
  { name: 'TailwindCSS', level: 92, category: 'STYLING', arm: 'right' },
  { name: 'CSS Animations', level: 88, category: 'STYLING', arm: 'right' },
  { name: 'Node.js', level: 80, category: 'TOOLS & BACKEND', arm: 'right' },
  { name: 'PHP', level: 85, category: 'TOOLS & BACKEND', arm: 'bottom' },
  { name: 'Tauri', level: 88, category: 'TOOLS & BACKEND', arm: 'bottom' },
  { name: 'Rust', level: 75, category: 'TOOLS & BACKEND', arm: 'bottom' },
  { name: 'Docker', level: 78, category: 'TOOLS & BACKEND', arm: 'left' },
];

const categories = [...new Set(skills.map((s) => s.category))];

// One treatment per category, on by default: ink block, cyan block, bare ink type, grey block
const TONE: Record<string, { bg: string; fg: string }> = {
  FRONTEND: { bg: '#1D1E20', fg: '#F4F2EE' },
  'ANIMATION & 3D': { bg: '#8FC6C1', fg: '#0A0A0A' },
  STYLING: { bg: 'transparent', fg: '#0A0A0A' },
  'TOOLS & BACKEND': { bg: '#D2D6CD', fg: '#0A0A0A' },
};

/*
 * Constructivist pinwheel: the words alone make the picture — no rules, rings or planes.
 * React stands in the middle, vertical. Four arms hang off its four sides, each rotated one step round it:
 * long names run horizontally to the left and right, short names vertically above and below.
 * Every arm is justified — each word is sized so its length equals the arm's length — so the arms read as solid blocks of type.
 */
const armNames = (arm: Arm) => skills.filter((k) => k.arm === arm).map((k) => k.name);
const ARMS = {
  left: { w: 33, names: armNames('left') },     // right edge on React, bottom on React's bottom, grows up
  right: { w: 38, names: armNames('right') },   // left edge on React, top on React's top, grows down
  top: { w: 15, names: armNames('top') },       // bottom on React, left edge on React's left, grows right
  bottom: { w: 15, names: armNames('bottom') }, // top on React, right edge on React, grows left
};
const REACT_LEN = 25, GAP = 1.4, ARM_GAP = 2.8, LEAD = 0.8, FRAME_W = 100, FRAME_H = 54;

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
  const pad = 3.6; // room for the level numbers hanging off the outer ends
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
    const measure = () => {
      if (!live) return;
      const ctx = document.createElement('canvas').getContext('2d');
      if (!ctx) return;
      ctx.font = '100px "Bebas Neue"';
      setEm(Object.fromEntries(skills.map((k) => {
        const u = k.name.toUpperCase();
        return [k.name, ctx.measureText(u).width / 100 + u.length * 0.01]; // + the 0.01em tracking
      })));
    };
    // The font stylesheet loads late (media=print swap): load() can resolve before its @font-face exists, so measure again when fonts finish loading
    document.fonts.load('100px "Bebas Neue"').then(measure).catch(() => {});
    document.fonts.addEventListener('loadingdone', measure);
    return () => { live = false; document.fonts.removeEventListener('loadingdone', measure); };
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
      {/* max-w: the frame never grows taller than the page has room for (page padding + legend ≈ 72px), so a wide-but-short window doesn't scroll just to reach the bottom padding */}
      <div className="hidden md:block relative w-full aspect-[100/54] [container-type:inline-size] max-w-[calc((100dvh-var(--nav-h)-var(--band)-96px-72px)*100/54)] short:max-w-[calc((100dvh-var(--nav-h)-var(--band)-56px-72px)*100/54)]">
        {boxes.map((b, i) => {
          const k = byName[b.name];
          const on = hover === k.category;
          // number hangs off the word's outer end
          const labelPos =
            b.arm === 'right' ? 'left-full ml-[0.9cqw] top-0'
            : b.arm === 'left' ? 'right-full mr-[0.9cqw] top-0'
            : b.arm === 'top' ? 'bottom-full mb-[0.8cqw] left-0'
            : b.arm === 'bottom' ? 'top-full mt-[0.8cqw] left-0'
            : 'left-full ml-[0.9cqw] bottom-0';
          return (
            <div key={b.name} className={`absolute transition-opacity duration-300 ${hover && !on ? 'opacity-[0.18]' : ''}`} style={{ left: `${b.x}cqw`, top: `${b.y}cqw` }}>
              <motion.button
                type="button"
                data-cursor={k.category}
                onMouseEnter={() => setHover(k.category)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(k.category)}
                onBlur={() => setHover(null)}
                className={`block font-bebas uppercase leading-[0.8] tracking-[0.01em] whitespace-nowrap text-left ${b.v ? '[writing-mode:vertical-rl] rotate-180' : ''} `}
                style={{ fontSize: `${b.s}cqw`, color: TONE[k.category].fg, backgroundColor: TONE[k.category].bg, boxShadow: `0 0 0 0.5cqw ${TONE[k.category].bg}` }}
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: isReady ? 1 : 0, scale: isReady ? 1 : 0.94 }}
                transition={t(0.3 + i * 0.05)}
              >
                {b.name}
              </motion.button>
              <motion.span
                className={`pointer-events-none absolute font-bebas text-[clamp(9px,1.4cqw,14px)] leading-none tabular-nums text-black/45 ${labelPos}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: isReady ? 1 : 0 }}
                transition={t(0.3 + i * 0.05)}
              >
                {k.level}
              </motion.span>
            </div>
          );
        })}
      </div>

      <ul className="md:hidden flex flex-wrap items-baseline gap-x-5 gap-y-2 font-bebas uppercase leading-none text-[#0A0A0A]">
        {skills.map((skill) => (
          <li key={skill.name} className="px-1.5" style={{ fontSize: `${1.6 + (skill.level - 70) * 0.12}rem`, color: TONE[skill.category].fg, backgroundColor: TONE[skill.category].bg }}>
            {skill.name}
            <span className="align-top ml-1 text-[12px] text-black/45 tabular-nums">{skill.level}</span>
          </li>
        ))}
      </ul>

      {/* Legend — also drives the highlight */}
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-[#0A0A0A] pt-2 font-bebas text-[15px] leading-none tracking-[0.06em] text-black/50">
        {categories.map((c, ci) => (
          <span key={c} onMouseEnter={() => setHover(c)} onMouseLeave={() => setHover(null)} className={`transition-colors duration-300 ${hover === c ? 'text-[#0A0A0A]' : ''}`}>
            <span className="mr-2 inline-block h-2.5 w-2.5 align-baseline border border-[#0A0A0A]" style={{ backgroundColor: TONE[c].bg }} />
            <span className="mr-2 text-black/40 tabular-nums">{pad(ci + 1)}</span>
            {c}
          </span>
        ))}
      </div>
    </SectionShell>
  );
}
