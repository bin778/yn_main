/**
 * Person detail route (`/people/[id]`). Legacy `www/peoples.php?p=N` (L17894–18867).
 */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import PersonDetailBody from '@/app/components/people/PersonDetailBody';
import PersonDetailHero from '@/app/components/people/PersonDetailHero';
import {
  getPersonById,
  getPersonDetailDescription,
  PEOPLE_IDS,
} from '@/app/constants/peopleContent';

type PageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return PEOPLE_IDS.map(id => ({ id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const person = getPersonById(id);
  if (!person) return {};

  const description = getPersonDetailDescription(person);

  return {
    title: `${person.name} ${person.role} | 법무법인 여온`,
    description,
    alternates: { canonical: `/people/${id}` },
  };
}

export default async function PersonDetailPage({ params }: PageProps) {
  const { id } = await params;
  const person = getPersonById(id);
  if (!person) notFound();

  return (
    <>
      <PersonDetailHero person={person} />
      <PersonDetailBody person={person} />
    </>
  );
}
