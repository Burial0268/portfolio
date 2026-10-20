export default function HeroButtons() {
  const navigateTo = (sectionId: string) => {
    window.dispatchEvent(new CustomEvent('navigate-section', { detail: sectionId }));
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start">
      <button
        onClick={() => navigateTo('projects')}
        data-cursor="ENTER"
        className="px-8 py-3 bg-[#8FC6C1] text-black font-bold text-sm uppercase tracking-wider hover:bg-[#EDE9E2] hover:-translate-y-0.5 transition-all duration-300"
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 90% 100%, 0 100%)' }}
      >
        VIEW WORKS / 查看作品
      </button>
      <button
        onClick={() => navigateTo('gallery')}
        data-cursor="ENTER"
        className="px-8 py-3 border border-white/30 text-white font-bold text-sm uppercase tracking-wider hover:border-[#8FC6C1] hover:text-[#8FC6C1] hover:-translate-y-0.5 transition-all duration-300 bg-transparent"
      >
        GALLERY / 影集
      </button>
    </div>
  );
}
