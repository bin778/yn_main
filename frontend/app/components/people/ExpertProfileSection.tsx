import ExpertProfileRow from '@/app/components/people/ExpertProfileRow';
import { EXPERTS_SECTION_TITLE, PEOPLE_EXPERTS } from '@/app/constants/peopleContent';

export default function ExpertProfileSection() {
  return (
    <section aria-labelledby="experts-heading">
      <h2
        id="experts-heading"
        className="bg-white px-6 pb-5 md:pb-10 pt-15 md:pt-20 text-center text-[30px] md:text-[36px] font-bold tracking-tight text-[#121212] md:pt-20"
      >
        {EXPERTS_SECTION_TITLE}
      </h2>
      <div>
        {PEOPLE_EXPERTS.map(person => (
          <ExpertProfileRow key={person.id} person={person} />
        ))}
      </div>
    </section>
  );
}
