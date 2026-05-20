'use client';

import { useState } from 'react';

import { FAQ_ITEMS, FAQ_SECTION_BG_SRC, FAQ_TITLE } from '@/app/constants/homeContent';

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section
      className="relative hidden py-16 sm:block sm:py-24"
      aria-labelledby="faq-heading"
    >
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${FAQ_SECTION_BG_SRC})` }}
      />
      <div className="absolute inset-0 bg-black/45" aria-hidden />
      <div className="relative z-[1] mx-auto max-w-[960px] px-6 lg:px-8">
        <h2
          id="faq-heading"
          className="whitespace-pre-line text-4xl font-bold leading-tight tracking-tight text-white lg:text-5xl"
        >
          {FAQ_TITLE}
        </h2>
        <ul className="mt-12 space-y-4">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <li key={item.question} className="list-none">
                <button
                  type="button"
                  className="flex w-full items-start justify-between gap-4 rounded-[10px] bg-white px-6 py-6 text-left text-lg font-bold text-[#333] transition-colors hover:bg-gray-50"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <span>{item.question}</span>
                  <span
                    className="relative mt-1 inline-block h-7 w-7 shrink-0"
                    aria-hidden
                  >
                    <span
                      className={`absolute left-1/2 top-0 h-7 w-px -translate-x-1/2 bg-[#333] transition-all ${
                        isOpen ? 'scale-y-0' : ''
                      }`}
                    />
                    <span className="absolute left-0 top-1/2 h-px w-7 -translate-y-1/2 bg-[#333]" />
                  </span>
                </button>
                <div
                  className={`grid overflow-hidden rounded-[10px] bg-[#f2f2f2] text-base leading-[35px] text-[#666] transition-[grid-template-rows] duration-300 ${
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="min-h-0">
                    <div className="px-8 py-6 whitespace-pre-line">{item.answer}</div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
