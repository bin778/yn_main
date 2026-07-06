import type { BoTable } from '../types/board';

export const ALLOWED_BO_TABLES: readonly BoTable[] = ['news', 'success', 'column', 'review'] as const;

export const BOARD_META: Record<
  BoTable,
  { label: string; description: string; pageTitle?: string; pageDescription?: string; heroBg?: string }
> = {
  review: {
    label: '후기',
    description: '실제 의뢰인들의 생생한 후기를 확인하세요.',
    pageTitle: '실제 의뢰인 후기 | 법무법인 여온 변호사 상담 후기',
    pageDescription:
      '음주운전·성범죄·이혼 등 실제 의뢰인이 직접 남긴 후기. 법무법인 여온의 담당 변호사가 처음부터 끝까지 함께한 사례들입니다.',
    heroBg: '/img/3f2ae6827f971.webp',
  },
  success: {
    label: '성공사례',
    description: '법무법인 여온의 다양한 성공 사례를 소개합니다.',
    pageTitle: '음주운전·성범죄·마약 형사 성공사례 | 법무법인 여온',
    pageDescription: '음주운전 2진아웃 집행유예, 카촬죄 기소유예, 마약 무죄. 담당 변호사가 직접 수행한 실제 사례.',
    heroBg: '/img/3f2ae6827f971.webp',
  },
  column: {
    label: '칼럼',
    description: '변호사·법무사가 직접 쓴 법률 칼럼입니다.',
    pageTitle: '음주운전·성범죄·마약 형사법률 정보 | 법무법인 여온 칼럼',
    pageDescription:
      '음주운전 처벌기준, 카촬죄 초범 대응, 마약 기소유예 조건. 형사전문 변호사가 직접 작성한 법률 정보.',
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
