import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MetaRow, pad } from '../SectionShell';

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
  const showY = isReady ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 };
  const t = (delay: number) =>
    isReady
      ? { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const }
      : { duration: 0.3, delay: 0 };

  const [index, setIndex] = useState(0);

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
    <section className="relative h-dvh min-h-[560px] flex flex-col page-x pt-24 md:pt-28">
      <MetaRow index={5} total={5} caption="Photography / 摄影" isDark={true} isReady={isReady} />

      <div className="flex-1 min-h-0 grid grid-rows-[1fr_auto] md:grid-cols-4 md:grid-rows-1 mt-6 md:mt-8 gap-y-4">
        {/* Caption column — 1 grid column on desktop */}
        <motion.div
          className="order-2 md:order-none flex md:flex-col justify-between gap-4 md:pr-8 md:pb-2"
          initial={{ y: 20, opacity: 0 }}
          animate={showY}
          transition={t(0.25)}
        >
          <div>
            <div className="meta text-white/45 mb-3">
              ({pad(index + 1)}) {current.tag}
            </div>
            <div className="overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.h3
                  key={current.title}
                  className="text-display text-4xl md:text-5xl lg:text-6xl text-[#F0F0F0]"
                  initial={{ y: '100%' }}
                  animate={{ y: '0%' }}
                  exit={{ y: '-100%' }}
                  transition={swap}
                >
                  {current.title}
                </motion.h3>
              </AnimatePresence>
            </div>
            <p className="mt-3 text-sm text-white/55">{current.subtitle}</p>
          </div>

          <div className="text-right md:text-left">
            <div className="meta text-white/35 hidden md:block mb-2">Burial0268 — Photography</div>
            <div className="overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.span
                  key={index}
                  className="block text-display text-6xl md:text-[clamp(6rem,10vw,9rem)] text-white/10 tabular-nums"
                  initial={{ y: '100%' }}
                  animate={{ y: '0%' }}
                  exit={{ y: '-100%' }}
                  transition={swap}
                >
                  {pad(index + 1)}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Image — 3 grid columns */}
        <motion.div
          className="md:col-span-3 relative overflow-hidden bg-[#111] touch-pan-y min-h-[40vh]"
          initial={{ clipPath: 'inset(0 0 100% 0)' }}
          animate={{ clipPath: isReady ? 'inset(0 0 0% 0)' : 'inset(0 0 100% 0)' }}
          transition={t(0.15)}
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
                      src={`${PHOTO_CDN_PERFIX}${photo.src}`}
                      alt={photo.title}
                      className="absolute inset-0 w-full h-full object-cover"
                      initial={false}
                      animate={{
                        clipPath: clip,
                        scale: isActive ? 1 : 1.06,
                        zIndex: isActive ? 10 : 0,
                      }}
                      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                      style={{ pointerEvents: isActive ? 'auto' : 'none' }}
                      onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
                      draggable={false}
                      loading="eager"
                    />
                  );
                })}

          {/* Progress segments — Endfield-style */}
          <div className="absolute left-4 right-4 bottom-4 z-20 flex gap-1.5 pointer-events-none">
            {photos.map((photo, i) => (
              <span key={photo.src} className="relative flex-1 h-0.5 bg-white/25 overflow-hidden">
                <motion.span
                  className="absolute inset-0 bg-[#6CE5E8] origin-left"
                  initial={false}
                  animate={{ scaleX: i <= index ? 1 : 0 }}
                  transition={swap}
                />
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Nav + footer row on the grid */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 items-center border-t border-white/10 mt-4 py-3"
        initial={{ y: 20, opacity: 0 }}
        animate={showY}
        transition={t(0.5)}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrev}
            disabled={index === 0}
            aria-label="Previous photo"
            className="w-9 h-9 border border-white/20 flex items-center justify-center text-white/60 hover:bg-[#6CE5E8] hover:border-[#6CE5E8] hover:text-black transition-colors duration-300 disabled:opacity-20 disabled:pointer-events-none"
          >
            ←
          </button>
          <button
            onClick={handleNext}
            disabled={index === photos.length - 1}
            aria-label="Next photo"
            className="w-9 h-9 border border-white/20 flex items-center justify-center text-white/60 hover:bg-[#6CE5E8] hover:border-[#6CE5E8] hover:text-black transition-colors duration-300 disabled:opacity-20 disabled:pointer-events-none"
          >
            →
          </button>
        </div>
        <span className="meta text-white/40 tabular-nums text-right md:text-left">
          {pad(index + 1)} / {pad(photos.length)}
        </span>
        <div className="col-span-2 flex flex-col md:flex-row md:justify-end gap-x-4 gap-y-1 mt-3 md:mt-0 meta text-white/30">
          <span>&copy; {new Date().getFullYear()} Burial0268 · Built with Astro</span>
          <a
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#6CE5E8] transition-colors duration-300"
          >
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
        </div>
      </motion.div>
    </section>
  );
}
