import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import SectionShell, { pad } from '../SectionShell';
import Typed from '../effects/Typed';

interface GallerySectionProps {
  isReady?: boolean;
}

interface Photo {
  src: string;
  title: string;
  subtitle: string;
  tag: string;
}

const PHOTO_CDN_PERFIX = 'https://webstatic.gbclstudio.cn';

const photos: Photo[] = [
  { src: '/portfolio/pic01.jpg', title: '染秋', subtitle: '广东 · 2025', tag: '自然' },
  { src: '/portfolio/pic02.jpg', title: '叶罅', subtitle: '广东 · 2024', tag: '自然' },
  { src: '/portfolio/pic03.jpg', title: '新洁', subtitle: '广东 · 2024', tag: '自然' },
  { src: '/portfolio/pic04.jpg', title: '远望', subtitle: '广东 · 2024', tag: '人文' },
  { src: '/portfolio/pic05.jpg', title: '云岫', subtitle: '广东 · 2025', tag: '自然' },
  { src: '/portfolio/pic06.jpg', title: '燃犀', subtitle: '广东 · 2025', tag: '自然' },
  { src: '/portfolio/pic07.jpg', title: '叠城', subtitle: '上海 · 2023', tag: '街拍' },
  { src: '/portfolio/pic08.jpg', title: '伫听', subtitle: '上海 · 2023', tag: '自然' },
];

export default function GallerySection({ isReady = false }: GallerySectionProps) {
  const showY = isReady ? { y: 0, opacity: 1 } : { y: 15, opacity: 0 };
  const t = (delay: number) =>
    isReady
      ? { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const }
      : { duration: 0.3, delay: 0 };

  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [portalReady, setPortalReady] = useState(false); // document.body only exists after hydration
  useEffect(() => setPortalReady(true), []);
  // Only fetch photos near the one being viewed (full-size JPEGs); once seen they stay
  const seen = useRef(new Set([0, 1]));
  [index - 1, index, index + 1].forEach((i) => seen.current.add(i));
  // Phones: the frame follows each photo's ratio inside a sweet spot (4:5 – 16:9), so cover crops very little
  const [ratios, setRatios] = useState<Record<string, number>>({});
  const recordRatio = (src: string, img: HTMLImageElement | null) => {
    if (!img?.naturalWidth) return;
    const r = img.naturalWidth / img.naturalHeight;
    setRatios((prev) => (prev[src] === r ? prev : { ...prev, [src]: r }));
  };

  useEffect(() => {
    if (isReady) setIndex(0);
  }, [isReady]);

  const navigate = useCallback((next: number) => {
    if (next >= 0 && next < photos.length) setIndex(next);
  }, []);

  const handlePrev = () => navigate(index - 1);
  const handleNext = () => navigate(index + 1);

  // ←/→ browse photos while this section is active (↑/↓ stay with page navigation)
  useEffect(() => {
    if (!isReady) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') navigate(index - 1);
      else if (e.key === 'ArrowRight') navigate(index + 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isReady, index, navigate]);

  const current = photos[index];
  const swap = { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <SectionShell
      no={4}
      label="PHOTOGRAPHY"
      en="Gallery"
      zh="影集"
      isDark={true}
      isReady={isReady}
      description="Through the lens — 用镜头记录的风景与街头。"
    >
      <motion.div initial={{ y: 15, opacity: 0 }} animate={showY} transition={t(0.25)}>
        {/* Image — directional clip-path wipe, swipe/drag to browse */}
        <motion.div
          className="relative overflow-hidden bg-[#111] touch-pan-y aspect-(--ar) transition-[aspect-ratio] duration-500 lg:aspect-auto lg:h-[min(50vh,560px)] lg:short:h-[40vh]"
          style={{ '--ar': Math.min(Math.max(ratios[current.src] ?? 4 / 3, 0.8), 16 / 9) } as React.CSSProperties}
          role="button"
          tabIndex={0}
          data-cursor="VIEW"
          aria-label={`查看大图 · ${current.title}`}
          onTap={() => setOpen(true)}
          onKeyDown={(e) => {
            // Enter only: Space would open on keydown, then its keyup lands on the focused Close button and shuts it again
            if (e.key === 'Enter') setOpen(true);
          }}
          initial={{ clipPath: 'inset(0 0 100% 0)' }}
          animate={{ clipPath: isReady ? 'inset(0 0 0% 0)' : 'inset(0 0 100% 0)' }}
          transition={t(0.2)}
          onPanEnd={(_, info) => {
            if (Math.abs(info.offset.x) > 50) navigate(index + (info.offset.x < 0 ? 1 : -1));
          }}
        >
                {photos.map((photo, i) => {
                  const isActive = i === index;
                  // 左侧的图片向左收起，右侧的图片从右侧展开 —— 方向感来自 clip-path 擦除
                  const clip = isActive ? 'inset(0% 0% 0% 0%)' : i < index ? 'inset(0% 100% 0% 0%)' : 'inset(0% 0% 0% 100%)';

                  return (
                    <motion.img
                      key={photo.src}
                      src={seen.current.has(i) ? `${PHOTO_CDN_PERFIX}${photo.src}` : undefined}
                      alt={photo.title}
                      className={`absolute inset-0 w-full h-full object-cover transition-[filter] duration-700 motion-reduce:transition-none ${ratios[photo.src] ? 'blur-0' : 'blur-xl'}`}
                      ref={(el) => recordRatio(photo.src, el)}
                      onLoad={(e) => recordRatio(photo.src, e.currentTarget)}
                      initial={false}
                      animate={{
                        clipPath: clip,
                        scale: isActive ? 1 : 1.06,
                        zIndex: isActive ? 10 : 0,
                      }}
                      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                      style={{ pointerEvents: isActive ? 'auto' : 'none' }}
                      onError={(e) => {
                        const img = e.currentTarget;
                        // one cache-busted retry for a transient CDN error, then give up
                        if (img.dataset.retried) img.style.visibility = 'hidden';
                        else { img.dataset.retried = '1'; img.src = `${img.src.split('?')[0]}?r=${Date.now()}`; }
                      }}
                      draggable={false}
                    />
                  );
                })}

          {/* Corner crosshairs */}
          <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-white/30 z-20 pointer-events-none" />
          <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-white/30 z-20 pointer-events-none" />
          <span className="absolute bottom-4 right-4 z-20 pointer-events-none font-mono text-[10px] tracking-[0.2em] text-white/50">VIEW ↗</span>
        </motion.div>

        {/* Caption row: number · title · meta · controls */}
        <div className="flex items-end gap-6 mt-6 short:mt-4">
          <div className="overflow-hidden h-[3.6rem] md:h-[4.6rem] shrink-0">
            <AnimatePresence mode="wait">
              <motion.span
                key={index}
                className="block font-bebas text-[4.5rem] md:text-[6rem] leading-[0.8] text-[#6CE5E8] tabular-nums"
                initial={{ y: '100%' }}
                animate={{ y: '0%' }}
                exit={{ y: '-100%' }}
                transition={swap}
              >
                {pad(index + 1)}
              </motion.span>
            </AnimatePresence>
          </div>
          <div className="min-w-0 flex-1 pb-1">
            <div className="font-bebas text-[13px] tracking-[0.1em] text-white/45 min-h-[1.5em]">
              <Typed text={`${current.tag} · ${current.subtitle}`} play={isReady} delay={500} />
            </div>
            {/* Retyped on every photo, like the watermark */}
            <h3 className="text-2xl md:text-3xl font-bold text-[#F0F0F0] min-h-[1.5em]">
              <Typed text={current.title} play={isReady} delay={400} />
            </h3>
          </div>
          <div className="flex items-center gap-2 pb-1">
            <button
              onClick={handlePrev}
              disabled={index === 0}
              aria-label="Previous photo"
              data-cursor="PREV"
              className="w-[51px] h-[51px] border border-white/20 flex items-center justify-center text-white/60 hover:border-[#6CE5E8] hover:text-[#6CE5E8] transition-colors duration-300 disabled:opacity-20 disabled:pointer-events-none"
            >
              ‹
            </button>
            <button
              onClick={handleNext}
              disabled={index === photos.length - 1}
              aria-label="Next photo"
              data-cursor="NEXT"
              className="w-[51px] h-[51px] border border-white/20 flex items-center justify-center text-white/60 hover:border-[#6CE5E8] hover:text-[#6CE5E8] transition-colors duration-300 disabled:opacity-20 disabled:pointer-events-none"
            >
              ›
            </button>
          </div>
        </div>

        {/* Indicator: one clickable segment per photo */}
        <div className="flex gap-1.5 mt-6 short:mt-4">
          {photos.map((photo, i) => (
            <button
              key={photo.src}
              onClick={() => navigate(i)}
              aria-label={`${photo.title} · ${photo.tag}`}
              title={`${photo.title} · ${photo.tag}`}
              aria-current={i === index}
              data-cursor={`PHOTO ${pad(i + 1)}`}
              className="group flex-1 h-4 flex items-center"
            >
              <span className="relative block w-full h-0.5 bg-white/15 group-hover:bg-white/35 transition-colors duration-300 overflow-hidden">
                <motion.span
                  className="absolute inset-0 bg-[#6CE5E8] origin-left"
                  initial={false}
                  animate={{ scaleX: i <= index ? 1 : 0 }}
                  transition={swap}
                />
              </span>
            </button>
          ))}
        </div>

        {/* Colophon (Figma Config footer): stacked caps links + legal line; the way out of the last page */}
        <div className="mt-6 short:mt-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-t border-white/15 pt-3 font-mono text-[10px] text-white/30">
          <div className="flex flex-col gap-1.5 tracking-[0.2em] uppercase text-white/55">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('navigate-section', { detail: 'home' }))}
              data-cursor="TOP"
              className="text-left uppercase hover:text-[#6CE5E8] transition-colors duration-300"
            >
              ↑ Back to top
            </button>
            <a href="https://github.com/Burial0268" data-cursor="GITHUB" target="_blank" rel="noopener noreferrer" className="hover:text-[#6CE5E8] transition-colors duration-300">
              GitHub ↗
            </a>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1">
        <p>&copy; {new Date().getFullYear()} BURIAL0268 · BUILT WITH ASTRO</p>
        <p className="flex flex-wrap gap-x-4">
          <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" className="hover:text-[#6CE5E8] transition-colors duration-300">
            粤ICP备2022073442号-1
          </a>
          <a
            href="https://beian.mps.gov.cn/#/query/webSearch?code=44162302000035"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#6CE5E8] transition-colors duration-300"
          >
            粤公网安备44162302000035号
          </a>
        </p>
          </div>
        </div>
      </motion.div>
      {portalReady && createPortal(
        <AnimatePresence>
          {open && <Lightbox photo={current} index={index} total={photos.length} onNavigate={navigate} onClose={() => setOpen(false)} />}
        </AnimatePresence>,
        document.body,
      )}
    </SectionShell>
  );
}

// Full, uncropped photo. App's wheel/key/touch handlers live on window, so swallow them (capture) while open.
// Entrance = HUD sequence: shutter slit opens → scan line sweeps → cyan corner brackets lock on. No flicker/flash (photosensitivity).
function Lightbox({ photo, index, total, onNavigate, onClose }: {
  photo: Photo; index: number; total: number; onNavigate: (i: number) => void; onClose: () => void;
}) {
  const [okSrc, setOkSrc] = useState(''); // blur-up: the photo that has finished loading
  const prevIndex = useRef(index);
  const settled = useRef(false); // first render opens via the shutter, later ones wipe by direction
  const dir = index >= prevIndex.current ? 1 : -1;
  useEffect(() => { prevIndex.current = index; settled.current = true; });

  // Modal focus: start on Close, keep Tab inside, hand focus back to the photo frame on exit
  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    dialogRef.current?.querySelector<HTMLElement>('[aria-label="Close"]')?.focus();
    return () => prev?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      e.stopImmediatePropagation();
      if (e.key === 'Tab') {
        const btns = dialogRef.current?.querySelectorAll<HTMLElement>('button');
        const first = btns?.[0], last = btns?.[btns.length - 1];
        if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
          e.preventDefault();
          (e.shiftKey ? last : first)?.focus();
        }
      } else if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') onNavigate(index - 1);
      else if (e.key === 'ArrowRight') onNavigate(index + 1);
    };
    const stop = (e: Event) => e.stopImmediatePropagation();
    const block = (e: Event) => { stop(e); e.preventDefault(); }; // not on touchend: that would cancel the tap's click
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('wheel', block, { capture: true, passive: false });
    window.addEventListener('touchend', stop, true);
    return () => {
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener('wheel', block, true);
      window.removeEventListener('touchend', stop, true);
    };
  }, [index, onNavigate, onClose]);

  const ease = [0.22, 1, 0.36, 1] as const;
  const swap = { duration: 0.45, ease };
  const slit = 'inset(50% 0% 50% 0%)';
  const corners = [
    '-top-2 -left-2 border-t border-l',
    '-top-2 -right-2 border-t border-r',
    '-bottom-2 -left-2 border-b border-l',
    '-bottom-2 -right-2 border-b border-r',
  ];

  return (
    <motion.div
      ref={dialogRef}
      className="fixed inset-0 z-[9000] bg-[#0A0A0A]/95 flex flex-col"
      role="dialog"
      aria-modal="true"
      data-cursor="CLOSE"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      onClick={onClose}
    >
      <div className="flex-1 min-h-0 p-(--mx) pb-4 flex items-center justify-center">
        <div className="relative" data-cursor="" onClick={(e) => e.stopPropagation()}>
          <motion.div
            className="relative overflow-hidden"
            initial={{ clipPath: slit }}
            animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
            exit={{ clipPath: slit }}
            transition={{ duration: 0.7, delay: 0.1, ease }}
          >
            <motion.img
              key={photo.src}
              src={`${PHOTO_CDN_PERFIX}${photo.src}`}
              alt={photo.title}
              className={`block w-auto h-auto max-w-[calc(100vw-2*var(--mx))] max-h-[calc(100dvh-11rem)] transition-[filter] duration-700 motion-reduce:transition-none ${okSrc === photo.src ? 'blur-0' : 'blur-xl'}`}
              ref={(el) => { if (el?.complete && el.naturalWidth) setOkSrc(photo.src); }}
              onLoad={() => setOkSrc(photo.src)}
              initial={settled.current ? { clipPath: dir > 0 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)' } : false}
              animate={{ clipPath: 'inset(0 0 0 0)' }}
              transition={{ duration: 0.6, ease }}
              draggable={false}
            />
            {/* one cyan scan line sweeps the frame as it opens */}
            <motion.span
              className="absolute inset-x-0 h-px bg-[#6CE5E8] shadow-[0_0_12px_#6CE5E8] pointer-events-none"
              initial={{ top: '0%', opacity: 0 }}
              animate={{ top: '100%', opacity: [0, 1, 1, 0] }}
              transition={{ duration: 0.9, delay: 0.35, ease: 'linear' }}
            />
          </motion.div>
          {corners.map((c) => (
            <motion.span
              key={c}
              className={`absolute w-3 h-3 border-[#6CE5E8] pointer-events-none ${c}`}
              initial={{ opacity: 0, scale: 1.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.7, ease }}
            />
          ))}
        </div>
      </div>

      <motion.div
        className="flex items-center gap-4 px-(--mx) pb-6 font-bebas tracking-[0.1em] text-white/60"
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 12, opacity: 0 }}
        transition={{ duration: 0.5, delay: 0.5, ease }}
        data-cursor=""
        onClick={(e) => e.stopPropagation()}
      >
        <span className="overflow-hidden h-[1.4em] leading-[1.4em] text-[#6CE5E8] text-lg tabular-nums">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={index} className="block" initial={{ y: '100%' }} animate={{ y: '0%' }} exit={{ y: '-100%' }} transition={swap}>
              {pad(index + 1)}
            </motion.span>
          </AnimatePresence>
        </span>
        <span className="text-[13px] text-white/45 -ml-2">/ {pad(total)}</span>
        <span className="overflow-hidden h-[1.4em] leading-[1.4em] text-white text-lg">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={photo.title} className="block" initial={{ y: '100%' }} animate={{ y: '0%' }} exit={{ y: '-100%' }} transition={swap}>
              {photo.title}
            </motion.span>
          </AnimatePresence>
        </span>
        <span className="text-[13px] text-white/45">{photo.tag} · {photo.subtitle}</span>
        <div className="ml-auto flex items-center gap-2">
          {[['‹', index - 1, 'Previous photo'], ['›', index + 1, 'Next photo']].map(([g, to, label]) => (
            <button key={label as string} onClick={() => onNavigate(to as number)} aria-label={label as string} data-cursor={g === '‹' ? 'PREV' : 'NEXT'}
              className="w-11 h-11 border border-white/20 flex items-center justify-center hover:border-[#6CE5E8] hover:text-[#6CE5E8] transition-colors duration-300">{g}</button>
          ))}
          <button onClick={onClose} aria-label="Close" data-cursor="CLOSE"
            className="w-11 h-11 border border-white/20 flex items-center justify-center hover:border-[#6CE5E8] hover:text-[#6CE5E8] transition-colors duration-300">✕</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
