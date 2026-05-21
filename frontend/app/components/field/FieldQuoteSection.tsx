import Image from 'next/image';

import { FIELD_QUOTE } from '@/app/constants/fieldContent';

export default function FieldQuoteSection() {
  return (
    <section className="bg-white px-6" aria-labelledby="field-quote-heading">
      <div className="mx-auto flex max-w-[960px] flex-col items-center border-b border-[#555] py-20 md:py-[100px]">
        <h2 id="field-quote-heading" className="sr-only">
          {FIELD_QUOTE.line1} {FIELD_QUOTE.line2}
        </h2>
        <Image src={FIELD_QUOTE.decorTopSrc} alt="" width={65} height={65} className="size-[65px]" />
        <p className="my-5 text-center text-[36px] font-bold leading-[1.35] tracking-tight text-[#121212] md:text-[45px] md:leading-[56px]">
          <span className="block">{FIELD_QUOTE.line1}</span>
          <span className="block">{FIELD_QUOTE.line2}</span>
        </p>
        <Image src={FIELD_QUOTE.decorBottomSrc} alt="" width={65} height={65} className="size-[65px]" />
      </div>
    </section>
  );
}
