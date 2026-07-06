/**
 * Field route (`/field`). Legacy `www/field.php` (L30320–30558):
 * 1. Hero
 * 2. Quote band
 * 3. Six practice area blocks
 */
import type { Metadata } from 'next';

import FieldHero from '@/app/components/field/FieldHero';
import FieldPracticeSection from '@/app/components/field/FieldPracticeSection';
import FieldQuoteSection from '@/app/components/field/FieldQuoteSection';
import { FIELD_PAGE_DESCRIPTION, FIELD_PAGE_TITLE } from '@/app/constants/fieldContent';

export const metadata: Metadata = {
  title: FIELD_PAGE_TITLE,
  description: FIELD_PAGE_DESCRIPTION,
  alternates: { canonical: '/field' },
};

export default function FieldPage() {
  return (
    <>
      <FieldHero />
      <FieldQuoteSection />
      <FieldPracticeSection />
    </>
  );
}
