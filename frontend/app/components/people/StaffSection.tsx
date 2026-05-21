import Image from 'next/image';
import Link from 'next/link';

import { PEOPLE_STAFF, STAFF_SECTION_TITLE } from '@/app/constants/peopleContent';

export default function StaffSection() {
  return (
    <section className="bg-[#f1f1f1] px-6 pb-24 pt-12 md:pb-[100px] md:pt-[50px]" aria-labelledby="staff-heading">
      <h2
        id="staff-heading"
        className="pt-8 text-center text-[36px] font-bold tracking-tight text-[#121212] md:pt-20"
      >
        {STAFF_SECTION_TITLE}
      </h2>

      <div className="mx-auto mt-12 grid max-w-[400px] grid-cols-1 gap-10 sm:max-w-[1240px] sm:grid-cols-3 sm:gap-5 md:mt-[50px]">
        {PEOPLE_STAFF.map(person => (
          <Link key={person.id} href={`/people/${person.id}`} className="block sm:px-5">
            <Image
              src={person.listPortraitDesktop}
              alt=""
              width={400}
              height={500}
              className="h-auto w-full object-cover"
            />
            <p className="py-5 text-center text-base md:pb-10">
              {person.role}
              <br />
              <span className="text-[30px] font-bold text-[#121212]">{person.name}</span>
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
