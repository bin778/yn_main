/**
 * Contact route (`/contact`). Legacy `www/contact.php`:
 * 1. Hero
 * 2. Seoul office
 * 3. Bucheon office
 * 4. Inquiry form band
 */
import type { Metadata } from 'next';

import ContactHero from '@/app/components/contact/ContactHero';
import ContactInquirySection from '@/app/components/contact/ContactInquirySection';
import OfficeSection from '@/app/components/contact/OfficeSection';
import { CONTACT_OFFICES, CONTACT_PAGE_DESCRIPTION, CONTACT_PAGE_TITLE } from '@/app/constants/contactContent';

export const metadata: Metadata = {
  title: CONTACT_PAGE_TITLE,
  description: CONTACT_PAGE_DESCRIPTION,
  alternates: { canonical: '/contact/' },
};

export default function ContactPage() {
  return (
    <>
      <ContactHero />
      {CONTACT_OFFICES.map(office => (
        <OfficeSection key={office.id} office={office} />
      ))}
      <ContactInquirySection />
    </>
  );
}
