import Image from 'next/image';
import Link from 'next/link';

import {
  CONTACT_HREF,
  THREE_REASONS_CARDS,
  THREE_REASONS_TITLE,
} from '@/app/constants/homeContent';

export default function ThreeReasonsSection() {
  return (
    <section className="bg-white py-16 md:py-20" aria-labelledby="three-reasons-heading">
      <div className="mx-auto max-w-[1200px] px-6 md:px-12">
        <h2
          id="three-reasons-heading"
          className="text-center text-4xl font-bold tracking-tight text-[#121212]"
        >
          {THREE_REASONS_TITLE}
        </h2>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {THREE_REASONS_CARDS.map(card => (
            <article
              key={card.title}
              className="overflow-hidden rounded-sm border border-gray-100 shadow-sm"
            >
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={card.imageSrc}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width:768px) 100vw, 33vw"
                />
              </div>
              <div className="px-6 py-6">
                <h3 className="text-xl font-bold tracking-tight text-[#222]">{card.title}</h3>
                <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-[#666]">
                  {card.body}
                </p>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-12 text-center">
          <Link
            href={CONTACT_HREF}
            className="inline-block rounded-sm bg-[#023373] px-8 py-3 text-base font-bold text-white transition-opacity hover:opacity-90"
          >
            바로 문의하기 &gt;
          </Link>
        </p>
      </div>
    </section>
  );
}
