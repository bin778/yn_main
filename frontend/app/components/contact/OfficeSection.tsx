import Image from 'next/image';

import OfficeMap from '@/app/components/contact/OfficeMap';
import type { ContactOffice } from '@/app/constants/contactContent';

type OfficeSectionProps = {
  office: ContactOffice;
};

function OfficeInfo({ office }: { office: ContactOffice }) {
  return (
    <div>
      <h2 className="text-[13px] md:text-[15px] font-bold leading-[1.4] tracking-tight text-[#023373] lg:text-[45px] lg:font-bold lg:leading-none lg:tracking-[-1.7px] lg:text-[#121212]">
        {office.title}
      </h2>
      <p className="mt-1 text-[13px] md:text-[15px] leading-[1.4] tracking-tight text-[#454545] lg:mt-2.5">
        {office.address}
      </p>
      <p className="mt-4 text-[13px] md:text-[15px] font-bold leading-[1.4] tracking-tight text-[#023373] lg:mt-6 lg:text-lg">
        오시는 길
      </p>
      <ul className="mt-3 space-y-3 lg:space-y-4">
        {office.directions.map(direction => (
          <li key={direction.id} className="flex gap-3">
            <Image
              src={direction.iconSrc}
              alt=""
              width={25}
              height={25}
              className="mt-0.5 h-[17px] md:h-[25px] w-[17px] md:w-[25px] shrink-0"
            />
            <p className="text-[14px] md:text-[16px] leading-[1.5] text-[#454545]">
              <span className="font-bold">{direction.label}</span>
              <span className="font-normal"> {direction.description}</span>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function OfficeSection({ office }: OfficeSectionProps) {
  return (
    <section
      className="mx-auto max-w-[1200px] px-6 py-12 md:px-12 md:py-[80px]"
      aria-labelledby={`${office.id}-office-title`}
    >
      <span id={`${office.id}-office-title`} className="sr-only">
        {office.title}
      </span>

      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-2 lg:items-start lg:gap-12">
        <div className="min-w-0 lg:order-2 lg:pt-9">
          <OfficeInfo office={office} />
        </div>
        <div className="min-w-0 w-full lg:order-1 lg:mt-10">
          <OfficeMap office={office} />
        </div>
      </div>
    </section>
  );
}
