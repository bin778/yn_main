/**
 * Person detail route (`/people/[id]`). Legacy `www/peoples.php?p=N` (L17894–18867).
 */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import PersonDetailBody from '@/app/components/people/PersonDetailBody';
import PersonDetailHero from '@/app/components/people/PersonDetailHero';
import JsonLd from '@/app/components/JsonLd';
import { YOO_YOUNG_KYU_PERSON_SCHEMA } from '@/app/constants/structuredData';
import {
  getPersonById,
  getPersonDetailDescription,
  getPersonDetailTitle,
  PEOPLE_IDS,
} from '@/app/constants/peopleContent';
import { SITE_ORIGIN } from '@/app/lib/siteOrigin';

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

  return {
    title: getPersonDetailTitle(person),
    description: getPersonDetailDescription(person),
    alternates: { canonical: `${SITE_ORIGIN}/people/${id}/` },
  };
}

export default async function PersonDetailPage({ params }: PageProps) {
  const { id } = await params;
  const person = getPersonById(id);
  if (!person) notFound();

  return (
    <>
      {id === '1' && <JsonLd id="person-yoo-young-kyu-schema" data={YOO_YOUNG_KYU_PERSON_SCHEMA} />}
      <PersonDetailHero person={person} />
      <PersonDetailBody person={person} />
    </>
  );
}
