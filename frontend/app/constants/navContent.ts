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

export type NavLinkItem = {
  label: string;
  href: string;
};

export type NavGroupItem = {
  label: string;
  children: readonly NavItem[];
};

export type NavItem = NavLinkItem | NavGroupItem;

export function isNavGroup(item: NavItem): item is NavGroupItem {
  return 'children' in item;
}

export const DRUNK_CONSULTATION_HREF = 'https://www.yeoon.co.kr/criminal/drunk-driving/';
export const INDECENT_ASSAULT_CONSULTATION_HREF = 'https://www.yeoon.co.kr/criminal/indecent-assault/';
export const STALKING_CONSULTATION_HREF = 'https://www.yeoon.co.kr/criminal/interim-measure/';

export const CONSULTATION_SUBLINKS: readonly NavLinkItem[] = [
  { href: DRUNK_CONSULTATION_HREF, label: '음주운전' },
  { href: INDECENT_ASSAULT_CONSULTATION_HREF, label: '강제추행' },
  { href: STALKING_CONSULTATION_HREF, label: '스토킹' },
];

export const CONSULTATION_NAV_LABEL = '형사 전문 센터';

export const INHERITANCE_HREF = 'https://www.yeoon.co.kr/familylawcase/inheritance/';

export const FAMILY_LAWCASE_SUBLINKS: readonly NavLinkItem[] = [{ href: INHERITANCE_HREF, label: '상속' }];

export const FAMILY_LAWCASE_NAV_LABEL = '가사 전문 센터';

export const DEPOSIT_HREF = 'https://www.yeoon.co.kr/deposit/';
export const DEPOSIT_NAV_LABEL = '임대차 보증금 반환청구';

export const OVERSEAS_KOREANS_HREF = 'https://www.yeoon.co.kr/overseas-koreans/';
export const OVERSEAS_KOREANS_NAV_LABEL = '재외동포 센터';

export const FIELD_NAV_HREF = '/field';
export const FIELD_NAV_LABEL = '여온이 하는 일';
export const FIELD_OVERVIEW_NAV_LABEL = '여온이 하는 일';

/** 여온이 하는 일 하위 메뉴 — 각 센터 랜딩 URL은 `next.config.ts` 리라이트와 일치해야 한다. */
export const FIELD_NAV_CHILDREN: readonly NavItem[] = [
  { label: CONSULTATION_NAV_LABEL, children: CONSULTATION_SUBLINKS },
  { label: FAMILY_LAWCASE_NAV_LABEL, children: FAMILY_LAWCASE_SUBLINKS },
  { label: DEPOSIT_NAV_LABEL, href: DEPOSIT_HREF },
  { label: OVERSEAS_KOREANS_NAV_LABEL, href: OVERSEAS_KOREANS_HREF },
];

/** 모바일에서는 라벨이 아코디언 토글 역할만 하므로 `/field` 진입점을 첫 항목으로 둔다. */
export const FIELD_NAV_MOBILE_ITEM: NavGroupItem = {
  label: FIELD_NAV_LABEL,
  children: [{ label: FIELD_OVERVIEW_NAV_LABEL, href: FIELD_NAV_HREF }, ...FIELD_NAV_CHILDREN],
};

export const MAIN_NAV_LINKS = [
  { href: '/about', label: '여온의 약속' },
  { href: '/people', label: '여온의 사람들' },
] as const;

export const STORY_NAV_HREF = '/news';
export const STORY_NAV_LABEL = '여온의 이야기';

/** 모바일 드로어·푸터용. 데스크톱은 라벨 자체가 `STORY_NAV_HREF` 링크라서 `STORY_SUBLINKS`를 직접 쓴다. */
export const STORY_NAV_ITEM: NavGroupItem = { label: STORY_NAV_LABEL, children: STORY_SUBLINKS };
export const CONTACT_NAV_HREF = '/contact';
export const CONTACT_NAV_LABEL = '오시는 길';

/** Tailwind `lg` = 1024px; matches “1023px and below = mobile”. */
export const DESKTOP_NAV_MEDIA = '(min-width: 1024px)';
