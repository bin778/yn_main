import { BROCHURE_HREF } from '@/app/constants/footerContent';
import {
  BROCHURE_FILE_NAME,
  GA_EVENTS,
  GA_SOURCE_ATTR,
  GA_SOURCES,
  KAKAO_CHANNEL_HOST,
} from '@/app/constants/analyticsEvents';

type GaEventParams = Record<string, string | number | boolean>;

declare global {
  interface Window {
    gtag?: (command: 'event', eventName: string, params?: GaEventParams) => void;
  }
}

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function trackGaEvent(eventName: string, params?: GaEventParams): void {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', eventName, params);
}

function getLinkSource(anchor: HTMLAnchorElement): string {
  const explicit = anchor.getAttribute(GA_SOURCE_ATTR);
  if (explicit) return explicit;
  if (anchor.closest('.board-content')) return GA_SOURCES.BOARD_CONTENT;
  return GA_SOURCES.INLINE;
}

function getLinkText(anchor: HTMLAnchorElement): string {
  const label = anchor.getAttribute('aria-label') ?? anchor.textContent?.trim() ?? '';
  return label.slice(0, 100);
}

function isBrochureHref(href: string): boolean {
  return href.includes(BROCHURE_FILE_NAME) || href.endsWith(BROCHURE_HREF);
}

export function classifyAnchorClick(anchor: HTMLAnchorElement): { eventName: string; params: GaEventParams } | null {
  const href = anchor.getAttribute('href') ?? '';
  if (!href) return null;

  const linkSource = getLinkSource(anchor);
  const linkText = getLinkText(anchor);

  if (href.startsWith('tel:')) {
    return {
      eventName: GA_EVENTS.PHONE_CLICK,
      params: { link_text: linkText, link_source: linkSource, contact_type: 'phone' },
    };
  }

  if (href.includes(KAKAO_CHANNEL_HOST)) {
    return {
      eventName: GA_EVENTS.KAKAO_CLICK,
      params: { link_url: href, link_text: linkText, link_source: linkSource },
    };
  }

  if (isBrochureHref(href)) {
    return {
      eventName: GA_EVENTS.FILE_DOWNLOAD,
      params: {
        file_name: BROCHURE_FILE_NAME,
        file_extension: 'pdf',
        link_url: href,
        link_source: linkSource,
      },
    };
  }

  return null;
}
