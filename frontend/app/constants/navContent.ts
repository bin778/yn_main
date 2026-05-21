/**
 * Site navigation links (header + footer mobile/tablet).
 * Desktop nav shows from 1024px (1023px and below use mobile menu).
 */

export const STORY_SUBLINKS = [
  { href: '/board/bbs/board.php?bo_table=review', label: '후기' },
  { href: '/board/bbs/board.php?bo_table=success', label: '성공사례' },
  { href: '/board/bbs/board.php?bo_table=column', label: '칼럼' },
  { href: '/board/bbs/board.php?bo_table=news', label: '여온소식' },
] as const;

export const MAIN_NAV_LINKS = [
  { href: '/about', label: '여온의 약속' },
  { href: '/people', label: '여온의 사람들' },
  { href: '/field', label: '여온이 하는 일' },
] as const;

export const STORY_NAV_HREF = '/board/bbs/board.php?bo_table=review';
export const STORY_NAV_LABEL = '여온의 이야기';
export const CONTACT_NAV_HREF = '/contact';
export const CONTACT_NAV_LABEL = '오시는 길';

/** Tailwind `lg` = 1024px; matches “1023px and below = mobile”. */
export const DESKTOP_NAV_MEDIA = '(min-width: 1024px)';
