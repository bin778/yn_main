/**
 * Home route (`/`). Section order matches legacy `www/index.php` flow:
 * 1. Hero (Swiper, mobile + desktop)
 * 2. Who we are
 * 3. FAQ accordion (all breakpoints)
 * 5. Three reasons + CTA
 * 6. Process + social links
 * 7. Optional popup (client)
 *
 * Parent `<main>` is defined in `app/layout.tsx` — do not wrap with another `<main>`.
 */
import FaqAccordion from './components/home/FaqAccordion';
import HeroSwiper from './components/home/HeroSwiper';
import HomePopup from './components/home/HomePopup';
import ProcessSocialSection from './components/home/ProcessSocialSection';
import ThreeReasonsSection from './components/home/ThreeReasonsSection';
import WhoWeAreSection from './components/home/WhoWeAreSection';

export default function Home() {
  return (
    <>
      <HeroSwiper />
      <WhoWeAreSection />
      <FaqAccordion />
      <ThreeReasonsSection />
      <ProcessSocialSection />
      <HomePopup />
    </>
  );
}
