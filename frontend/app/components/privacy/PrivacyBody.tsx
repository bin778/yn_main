import { PRIVACY_INTRO, PRIVACY_SECTIONS } from '@/app/constants/privacyContent';

export default function PrivacyBody() {
  return (
    <section className="mx-auto max-w-[980px] px-6 py-16 md:px-12 md:py-24" aria-label="개인정보 처리방침 본문">
      <p className="text-[15px] leading-relaxed text-[#454545]">{PRIVACY_INTRO}</p>
      <div className="mt-10 space-y-10">
        {PRIVACY_SECTIONS.map(section => (
          <article key={section.id} aria-labelledby={`${section.id}-title`}>
            <h2 id={`${section.id}-title`} className="text-base font-bold text-[#121212] md:text-lg">
              {section.title}
            </h2>
            <div className="mt-3 space-y-2">
              {section.blocks.map((block, index) => (
                <p key={`${section.id}-${index}`} className="text-[15px] leading-relaxed text-[#454545]">
                  {block}
                </p>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
