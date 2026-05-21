import {
  ABOUT_CORE_VALUES,
  CORE_VALUES_INTRO,
  CORE_VALUES_SECTION_TITLE,
} from '@/app/constants/aboutContent';

export default function CoreValuesSection() {
  return (
    <section className="bg-[#f7f9fb] py-16 md:py-24" aria-labelledby="core-values-heading">
      <div className="mx-auto max-w-[1200px] px-6 md:px-12">
        <h2
          id="core-values-heading"
          className="text-center text-4xl font-bold tracking-tight text-[#121212] md:text-[45px]"
        >
          {CORE_VALUES_SECTION_TITLE}
        </h2>
        <p className="mt-4 text-center text-base leading-relaxed tracking-tight text-[#555] md:text-[17px]">
          {CORE_VALUES_INTRO}
        </p>
        <div className="mt-10 flex flex-col gap-4 md:mt-12 md:grid md:grid-cols-3 md:gap-6">
          {ABOUT_CORE_VALUES.map(value => (
            <article
              key={value.title}
              className="relative min-h-[220px] overflow-hidden rounded-sm bg-cover bg-center px-6 py-16 text-center md:min-h-[280px] md:py-24"
              style={{ backgroundImage: `url(${value.cardBgSrc})` }}
            >
              <div className="absolute inset-0 bg-white/75" aria-hidden />
              <div className="relative z-[1]">
                <h3 className="text-xl font-bold tracking-tight text-[#141720] md:text-2xl">
                  {value.title}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-[#555]">{value.subtitle}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
