/**
 * Site navigation links (header + footer mobile/tablet).
 * Desktop nav shows from 1024px (1023px and below use mobile menu).
 */

export const STORY_SUBLINKS = [
  { href: '/news', label: '여온소식' },
  { href: '/success-story', label: '성공사례' },
  { href: '/column', label: '칼럼' },
  { href: '/review', label: '후기' },
] as const;

export type NavSublink = {
  label: string;
  href?: string;
};

export const DRUNK_CONSULTATION_HREF = 'https://yeoon.co.kr/drunk';

export const CONSULTATION_SUBLINKS: readonly NavSublink[] = [{ href: DRUNK_CONSULTATION_HREF, label: '음주운전' }];

export const CONSULTATION_NAV_LABEL = '형사 전문';

/** 형사 전문 드롭다운 노출 여부 — `true`로 바꾸면 헤더·푸터에 즉시 표시. */
export const SHOW_CONSULTATION_NAV = true;

export const MAIN_NAV_LINKS = [
  { href: '/about', label: '여온의 약속' },
  { href: '/people', label: '여온의 사람들' },
  { href: '/field', label: '여온이 하는 일' },
] as const;

export const STORY_NAV_HREF = '/news';
export const STORY_NAV_LABEL = '여온의 이야기';
export const CONTACT_NAV_HREF = '/contact';
export const CONTACT_NAV_LABEL = '오시는 길';

/** Tailwind `lg` = 1024px; matches “1023px and below = mobile”. */
export const DESKTOP_NAV_MEDIA = '(min-width: 1024px)';
