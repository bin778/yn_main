/**
 * Privacy policy route (`/privacy`). Legacy `www/privacy.php` (L17966–18058).
 */
import type { Metadata } from 'next';

import PrivacyBody from '@/app/components/privacy/PrivacyBody';
import PrivacyHero from '@/app/components/privacy/PrivacyHero';
import { PRIVACY_PAGE_DESCRIPTION, PRIVACY_PAGE_TITLE } from '@/app/constants/privacyContent';

export const metadata: Metadata = {
  title: `${PRIVACY_PAGE_TITLE} | 법무법인 여온`,
  description: PRIVACY_PAGE_DESCRIPTION,
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <>
      <PrivacyHero />
      <PrivacyBody />
    </>
  );
}
