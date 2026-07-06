/**
 * About route (`/about`). Section order matches legacy `www/about.php` (L30319–31326):
 * 1. Hero
 * 2. Intro (온전한 당신 편)
 * 3. Core values
 * 4. Certificates swiper
 * 5. Expertise band + CTA
 * 6. Three pillars (맞춤 전략 / 수임 제한 / 여행 가이드)
 * 7. Office gallery swiper
 *
 * Parent `<main>` is in `app/layout.tsx`.
 */
import type { Metadata } from 'next';

import { AboutCertificatesSection, AboutOfficeGallerySection } from '@/app/components/about/AboutSwiperSections';
import AboutHero from '@/app/components/about/AboutHero';
import AboutIntro from '@/app/components/about/AboutIntro';
import AboutPillarsSection from '@/app/components/about/AboutPillarsSection';
import CoreValuesSection from '@/app/components/about/CoreValuesSection';
import ExpertiseSection from '@/app/components/about/ExpertiseSection';
import { ABOUT_PAGE_DESCRIPTION, ABOUT_PAGE_TITLE } from '@/app/constants/aboutContent';

export const metadata: Metadata = {
  title: ABOUT_PAGE_TITLE,
  description: ABOUT_PAGE_DESCRIPTION,
};

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <AboutIntro />
      <CoreValuesSection />
      <AboutCertificatesSection />
      <ExpertiseSection />
      <AboutPillarsSection />
      <AboutOfficeGallerySection />
    </>
  );
}
