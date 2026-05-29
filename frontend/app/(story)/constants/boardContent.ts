import type { BoTable } from '../types/board';

export const ALLOWED_BO_TABLES: readonly BoTable[] = ['news', 'success', 'column', 'review'] as const;

export const BOARD_META: Record<BoTable, { label: string; description: string; heroBg?: string }> = {
  review: {
    label: '후기',
    description: '실제 의뢰인들의 생생한 후기를 확인하세요.',
    heroBg: '/img/3f2ae6827f971.webp',
  },
  success: {
    label: '성공사례',
    description: '법무법인 여온의 다양한 성공 사례를 소개합니다.',
    heroBg: '/img/3f2ae6827f971.webp',
  },
  column: {
    label: '칼럼',
    description: '변호사·법무사가 직접 쓴 법률 칼럼입니다.',
    heroBg: '/img/3f2ae6827f971.webp',
  },
  news: {
    label: '여온소식',
    description: '법무법인 여온의 최신 소식을 전합니다.',
    heroBg: '/img/3f2ae6827f971.webp',
  },
} as const;

export const SITE_NAME = '법무법인 여온';

/** 브라우저 경로 슬러그 (API bo_table과 다를 수 있음) */
export const BOARD_PATH_SLUG: Record<BoTable, string> = {
  review: 'review',
  success: 'success-story',
  column: 'column',
  news: 'news',
};

const slugEntries = Object.entries(BOARD_PATH_SLUG) as [BoTable, string][];

export const PATH_SLUG_TO_BO_TABLE = Object.fromEntries(
  slugEntries.map(([boTable, slug]) => [slug, boTable]),
) as Record<string, BoTable>;

export function resolveBoTableFromPathSlug(slug: string): BoTable | null {
  return PATH_SLUG_TO_BO_TABLE[slug] ?? null;
}

export function getBoardPathSlug(boTable: BoTable): string {
  return BOARD_PATH_SLUG[boTable];
}
