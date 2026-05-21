import type { PersonProfile } from '@/app/constants/peopleContent';

type PersonDetailBodyProps = {
  person: PersonProfile;
};

function SectionDivider() {
  return <hr className="border-t border-[#d3d3d3]" />;
}

function BulletList({ lines }: { lines: readonly string[] }) {
  return (
    <ul className="space-y-0 text-[15px] leading-[1.7] tracking-tight text-[#555] md:text-[17px] md:leading-[1.8] md:tracking-[-0.5px]">
      {lines.map(line => (
        <li key={line}>{line}</li>
      ))}
    </ul>
  );
}

export default function PersonDetailBody({ person }: PersonDetailBodyProps) {
  const { detail } = person;
  const hasEducation = detail.educationLines && detail.educationLines.length > 0;
  const hasCareer = detail.careerLines && detail.careerLines.length > 0;

  return (
    <section className="bg-white px-6 py-12 md:px-12 md:py-[130px]">
      <div className="mx-auto max-w-[1200px]">
        {detail.headline && (
          <h2 className="text-left text-[22px] font-bold leading-[2.1] tracking-tight text-[#373737] md:text-[32px] md:leading-snug">
            {detail.headline}
          </h2>
        )}

        {(detail.introQuote || detail.introParagraphs) && (
          <div className={`space-y-4 ${detail.headline ? 'mt-6 md:mt-0' : ''}`}>
            {detail.introQuote && (
              <blockquote className="border-none p-0 text-[15px] leading-[1.7] tracking-tight text-[#555] md:text-[17px] md:leading-[1.8]">
                {detail.introQuote}
              </blockquote>
            )}
            {detail.introParagraphs?.map(paragraph => (
              <p
                key={paragraph}
                className="text-[15px] leading-[1.7] tracking-tight text-[#555] md:text-[17px] md:leading-[1.8] md:tracking-[-0.5px]"
              >
                {paragraph}
              </p>
            ))}
          </div>
        )}

        {hasEducation && (
          <>
            <div className="my-10 md:my-[70px]">
              <SectionDivider />
            </div>
            <h3 className="text-xl font-bold tracking-tight text-[#373737] md:text-[32px]">학력 및 자격</h3>
            <div className="mt-2.5 md:mt-[18px]">
              <BulletList lines={detail.educationLines!} />
            </div>
          </>
        )}

        {hasCareer && (
          <>
            <div className="my-10 md:my-[70px]">
              <SectionDivider />
            </div>
            <h3 className="text-xl font-bold tracking-tight text-[#373737] md:text-[32px]">주요 경력</h3>
            <div className="mt-2.5 md:mt-5">
              <BulletList lines={detail.careerLines!} />
            </div>
          </>
        )}

        <div className="mt-16 md:mt-[130px]" aria-hidden />
      </div>
    </section>
  );
}
