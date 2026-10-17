import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import SectionShell, { pad } from '../SectionShell';

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
      label="PHOTOGRAPHY"
      en="Gallery"
      zh="影集"
      isDark={true}
      isReady={isReady}
      // The sub-index is the photo picker (AK's boxed list)
      subIndex={photos.map((photo, i) => ({
        key: photo.src,
        label: `${pad(i + 1)}  ${photo.title} · ${photo.tag}`,
        active: i === index,
        onSelect: () => navigate(i),
      }))}
      description="Through the lens — 用镜头记录的风景与街头。"
      aside={
        <div className="mt-8 space-y-1 font-mono text-[10px] text-white/30">
          <p>&copy; {new Date().getFullYear()} BURIAL0268 · BUILT WITH ASTRO</p>
          <p className="flex flex-wrap gap-x-3">
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
      }
    >
      <motion.div initial={{ y: 15, opacity: 0 }} animate={showY} transition={t(0.25)}>
        {/* Image — directional clip-path wipe, swipe/drag to browse */}
        <motion.div
          className="relative overflow-hidden bg-[#111] touch-pan-y aspect-[4/3] lg:aspect-auto lg:h-[min(50vh,560px)] lg:short:h-[40vh]"
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

          {/* Corner crosshairs */}
          <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-white/30 z-20 pointer-events-none" />
          <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-white/30 z-20 pointer-events-none" />
        </motion.div>

        {/* Caption row: number · title · meta · controls */}
        <div className="flex items-end gap-5 mt-4">
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
            <div className="font-bebas text-[13px] tracking-[0.1em] text-white/45">
              {current.tag} · {current.subtitle}
            </div>
            <div className="overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.h3
                  key={current.title}
                  className="text-2xl md:text-3xl font-bold text-[#F0F0F0]"
                  initial={{ y: '100%' }}
                  animate={{ y: '0%' }}
                  exit={{ y: '-100%' }}
                  transition={swap}
                >
                  {current.title}
                </motion.h3>
              </AnimatePresence>
            </div>
          </div>
          <div className="flex items-center gap-2 pb-1">
            <button
              onClick={handlePrev}
              disabled={index === 0}
              aria-label="Previous photo"
              className="w-10 h-10 border border-white/20 flex items-center justify-center text-white/60 hover:border-[#6CE5E8] hover:text-[#6CE5E8] transition-colors duration-300 disabled:opacity-20 disabled:pointer-events-none"
            >
              ‹
            </button>
            <button
              onClick={handleNext}
              disabled={index === photos.length - 1}
              aria-label="Next photo"
              className="w-10 h-10 border border-white/20 flex items-center justify-center text-white/60 hover:border-[#6CE5E8] hover:text-[#6CE5E8] transition-colors duration-300 disabled:opacity-20 disabled:pointer-events-none"
            >
              ›
            </button>
          </div>
        </div>

        {/* Segmented progress */}
        <div className="flex gap-1.5 mt-4">
          {photos.map((photo, i) => (
            <span key={photo.src} className="relative flex-1 h-0.5 bg-white/15 overflow-hidden">
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
    </SectionShell>
  );
}
