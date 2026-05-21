import { ABOUT_CORE_VALUES, CORE_VALUES_INTRO, CORE_VALUES_SECTION_TITLE } from '@/app/constants/aboutContent';

const BRAND_NAVY = '#023373';

function CoreValueCheckIcon() {
  return (
    <span
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
      style={{ backgroundColor: BRAND_NAVY }}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M7 12.5L10.5 16L17 9"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

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
              className="flex min-h-[220px] flex-col items-center justify-center rounded-sm border border-gray-100 bg-white px-6 py-14 text-center shadow-sm md:min-h-[260px] md:py-16"
            >
              <div className="flex flex-col items-center gap-8">
                <CoreValueCheckIcon />
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-[#141720] md:text-2xl">{value.title}</h3>
                  <p className="mt-4 text-base leading-relaxed text-[#555]">{value.subtitle}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
