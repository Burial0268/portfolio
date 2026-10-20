import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';
import FFTVisualizer from './effects/FFTVisualizer';
import Scramble from './effects/Scramble';

interface NavigationProps {
  currentSection?: string;
  isDark?: boolean;
  onNavigate?: (section: string) => void;
  bgmPlaying?: boolean;
  onBGMToggle?: () => void;
  bgmAnalyser?: React.RefObject<AnalyserNode | null>;
}

const sections = [
  { id: 'home', en: 'INDEX', zh: '首页' },
  { id: 'about', en: 'ABOUT', zh: '关于' },
  { id: 'projects', en: 'WORKS', zh: '项目' },
  { id: 'skills', en: 'SKILLS', zh: '技能' },
  { id: 'gallery', en: 'GALLERY', zh: '影集' }
];

export default function Navigation({ currentSection = 'home', isDark: sectionIsDark = true, onNavigate, bgmPlaying, onBGMToggle, bgmAnalyser }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hov, setHov] = useState({ id: '', n: 0 }); // each hover replays that item's decode
  // The full-screen menu is dark, so the bar sitting on top of it goes dark too
  const isDark = sectionIsDark || isOpen;
  const currentIndex = Math.max(0, sections.findIndex(s => s.id === currentSection));

  useEffect(() => {
    setMounted(true);
  }, []);

  // Phones scroll the document: freeze it under the open menu, and let Esc close it
  useEffect(() => {
    if (!isOpen) return;
    const root = document.documentElement;
    root.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => {
      root.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen]);

  const handleNavClick = (sectionId: string) => {
    if (onNavigate) {
      onNavigate(sectionId);
    }
    setIsOpen(false);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          mounted
            ? isDark
              ? 'bg-black/40 backdrop-blur-md'
              : 'bg-white/80 backdrop-blur-md shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="pl-(--mx) pr-(--mx) lg:pr-0">
          <div className="flex items-center justify-between h-(--nav-h)">
            {/* Logo */}
            <button
              className="font-bold text-xl md:text-2xl transition-opacity hover:opacity-70"
              onClick={() => handleNavClick('home')}
            >
              <span className={`transition-colors duration-500 ${isDark ? 'text-white' : 'text-[#0A0A0A]'}`}>
                BAESORY
              </span>
              <span className="text-[#6CE5E8]">拜瑞</span>
            </button>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-1 ml-auto md:mr-6 lg:mr-10">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => handleNavClick(section.id)}
                  onMouseEnter={() => setHov(h => ({ id: section.id, n: h.n + 1 }))}
                  className={`relative px-4 py-2 text-left font-bebas text-[17px] leading-none tracking-[0.04em] transition-colors duration-300 ${
                    currentSection === section.id
                      ? isDark ? 'text-white' : 'text-[#0A0A0A]'
                      : isDark
                        ? 'text-white/50 hover:text-white/80'
                        : 'text-gray-400 hover:text-[#0A0A0A]'
                  }`}
                >
                  <Scramble text={section.en} play={hov.id === section.id && hov.n} />
                  <span className="block font-sans text-[10px] tracking-normal opacity-50 mt-1">{section.zh}</span>
                  {currentSection === section.id && (
                    <motion.span
                      className="absolute bottom-0 left-0 w-full h-0.5 bg-[#6CE5E8]"
                      layoutId="nav-indicator"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>

            <div
              className={`flex items-center gap-1 lg:w-(--rail) lg:h-full lg:justify-center lg:border-l transition-colors duration-500 ${
                isDark ? 'lg:border-white/10' : 'lg:border-black/10'
              }`}
            >
              {/* BGM Toggle */}
              <button
                onClick={onBGMToggle}
                data-bgm-toggle
                className={`p-2 rounded-sm transition-colors ${
                  isDark ? 'text-white hover:bg-white/10' : 'text-[#0A0A0A] hover:bg-black/5'
                }`}
                aria-label={bgmPlaying ? 'Pause music' : 'Play music'}
              >
                <FFTVisualizer analyser={bgmAnalyser?.current ?? null} playing={!!bgmPlaying} />
              </button>

              {/* Mobile: current section index (AK-style) */}
            <span className={`md:hidden ml-auto mr-1 font-mono text-[10px] tracking-wider transition-colors duration-500 ${isDark ? 'text-white/50' : 'text-black/50'}`}>
              <span className="text-[#6CE5E8]">{String(currentIndex).padStart(2, '0')}</span> / {String(sections.length - 1).padStart(2, '0')}
            </span>

            {/* Mobile Menu Button */}
              <button
                className={`md:hidden p-2 rounded-sm transition-colors ${
                  isDark ? 'text-white hover:bg-white/10' : 'text-[#0A0A0A] hover:bg-black/5'
                }`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle menu"
                aria-expanded={isOpen}
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu — full-screen dark panel (Arknights / Endfield H5 style) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-40 md:hidden bg-[#0A0A0A] flex flex-col pt-24 pb-8 px-6 overflow-hidden"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none text-[#6CE5E8]/[0.06]"
              viewBox="0 0 160 100"
              preserveAspectRatio="xMidYMid slice"
              aria-hidden="true"
            >
              <use href="#topo" />
            </svg>
            <div className="absolute left-0 top-16 bottom-0 w-1 bg-[#6CE5E8]" />

            <div className="relative text-[10px] uppercase tracking-[0.3em] text-white/30 font-mono mb-6">
              ▼ / MENU — BURIAL0268
            </div>

            <nav className="relative flex-1">
              {sections.map((section, index) => {
                const active = currentSection === section.id;
                return (
                  <motion.button
                    key={section.id}
                    onClick={() => handleNavClick(section.id)}
                    className="group w-full flex items-center gap-4 py-4 border-b border-white/8 text-left"
                    initial={{ x: 40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, delay: 0.15 + index * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <span className="font-mono text-[10px] text-white/30 w-6">{String(index + 1).padStart(2, '0')}</span>
                    <span
                      className={`inline-block w-4 h-3 -skew-x-12 transition-colors duration-300 ${
                        active ? 'bg-[#6CE5E8]' : 'bg-white/15 group-active:bg-[#6CE5E8]'
                      }`}
                    />
                    <span className={`text-display text-3xl tracking-wide ${active ? 'text-[#6CE5E8]' : 'text-white'}`}>
                      {section.en}
                    </span>
                    <span className="ml-auto text-xs text-white/40">{section.zh}</span>
                  </motion.button>
                );
              })}
            </nav>

            <motion.div
              className="relative flex items-center justify-between pt-6 border-t border-white/10 text-[10px] font-mono uppercase tracking-wider"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <button onClick={onBGMToggle} className="flex items-center gap-2 text-white/50" data-bgm-toggle>
                <FFTVisualizer analyser={bgmAnalyser?.current ?? null} playing={!!bgmPlaying} />
                BGM {bgmPlaying ? 'ON' : 'OFF'}
              </button>
              <a
                href="https://github.com/Burial0268"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6CE5E8]"
              >
                GITHUB →
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
