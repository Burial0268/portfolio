export default function HeroButtons() {
  const navigateTo = (sectionId: string) => {
    window.dispatchEvent(new CustomEvent('navigate-section', { detail: sectionId }));
  };

  return (
    <div className="flex flex-wrap md:flex-col gap-x-5 gap-y-3 items-start">
      <button
        onClick={() => navigateTo('projects')}
        className="group inline-flex items-center gap-3 pl-4 pr-5 py-2.5 bg-[#6CE5E8] text-black font-bold text-sm tracking-[-0.01em] hover:bg-white transition-colors duration-300"
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 90% 100%, 0 100%)' }}
      >
        查看作品 / Works
        <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
      </button>
      <button
        onClick={() => navigateTo('gallery')}
        className="group inline-flex items-center gap-2 py-2.5 text-white font-semibold text-sm tracking-[-0.01em] hover:text-[#6CE5E8] transition-colors duration-300"
      >
        <span className="border-b border-current pb-0.5">影集 / Gallery</span>
        <span className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">↗</span>
      </button>
    </div>
  );
}
