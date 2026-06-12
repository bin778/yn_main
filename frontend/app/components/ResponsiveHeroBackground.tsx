type Props = {
  mobileSrc: string;
  desktopSrc: string;
  alt: string;
  className?: string;
};

/** Art-directed hero background: browser downloads one image for the current viewport. */
export default function ResponsiveHeroBackground({ mobileSrc, desktopSrc, alt, className = '' }: Props) {
  return (
    <picture className={className}>
      <source media="(min-width: 768px)" srcSet={desktopSrc} />
      <img
        src={mobileSrc}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover"
        fetchPriority="high"
        decoding="sync"
      />
    </picture>
  );
}
