import { CONCERNS_BG_SRC, CONCERNS_TITLE } from '@/app/constants/homeContent';

export default function ConcernsSection() {
  return (
    <section
      className="relative min-h-[280px] w-full md:hidden"
      aria-labelledby="concerns-heading-mobile"
    >
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${CONCERNS_BG_SRC})` }}
      />
      <div className="absolute inset-0 bg-black/35" aria-hidden />
      <div className="relative z-[1] flex min-h-[280px] items-center px-6 py-16">
        <h2
          id="concerns-heading-mobile"
          className="whitespace-pre-line text-4xl font-bold leading-tight tracking-tight text-white"
        >
          {CONCERNS_TITLE}
        </h2>
      </div>
    </section>
  );
}
