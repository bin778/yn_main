/**
 * People list route (`/people`). Legacy `www/people.php` (L30320–30588).
 */
import type { Metadata } from 'next';

import ExpertProfileSection from '@/app/components/people/ExpertProfileSection';
import PeopleHero from '@/app/components/people/PeopleHero';
import StaffSection from '@/app/components/people/StaffSection';
import { PEOPLE_PAGE_DESCRIPTION, PEOPLE_PAGE_TITLE } from '@/app/constants/peopleContent';

export const metadata: Metadata = {
  title: PEOPLE_PAGE_TITLE,
  description: PEOPLE_PAGE_DESCRIPTION,
  alternates: { canonical: '/people' },
};

export default function PeoplePage() {
  return (
    <>
      <PeopleHero />
      <ExpertProfileSection />
      <StaffSection />
    </>
  );
}
