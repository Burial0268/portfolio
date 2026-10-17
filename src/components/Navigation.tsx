import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';
import FFTVisualizer from './effects/FFTVisualizer';

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

export default function Navigation({ currentSection = 'home', isDark = true, onNavigate, bgmPlaying, onBGMToggle, bgmAnalyser }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
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
            <div className="hidden md:flex items-center space-x-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => handleNavClick(section.id)}
                  className={`relative px-4 py-2 text-xs font-medium tracking-widest transition-colors duration-300 ${
                    currentSection === section.id
                      ? isDark ? 'text-white' : 'text-[#0A0A0A]'
                      : isDark
                        ? 'text-white/50 hover:text-white/80'
                        : 'text-gray-400 hover:text-[#0A0A0A]'
                  }`}
                >
                  <span className="block">{section.en}</span>
                  <span className="block text-[10px] tracking-normal opacity-50">{section.zh}</span>
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

            <div className="flex items-center gap-1">
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

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-y-0 right-0 w-72 bg-white z-40 md:hidden shadow-xl"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex flex-col h-full pt-24 px-6">
                {sections.map((section, index) => (
                  <motion.button
                    key={section.id}
                    onClick={() => handleNavClick(section.id)}
                    className={`text-left py-4 text-sm font-medium tracking-widest transition-colors border-b border-gray-100 ${
                      currentSection === section.id
                        ? 'text-[#0A0A0A] border-l-2 border-l-[#6CE5E8] pl-4'
                        : 'text-gray-400 hover:text-[#0A0A0A] pl-4'
                    }`}
                    initial={{ x: 40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 40, opacity: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <span className="block">{section.en}</span>
                    <span className="block text-xs tracking-normal opacity-50 mt-0.5">{section.zh}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Mobile Menu Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/20 z-30 md:hidden"
              onClick={() => setIsOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          </>
        )}
      </AnimatePresence>
    </>
  );
}
