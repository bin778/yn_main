import type { BoTable } from '../types/board';

export const ALLOWED_BO_TABLES: readonly BoTable[] = ['review', 'success', 'column', 'news'] as const;

export const BOARD_META: Record<BoTable, { label: string; description: string }> = {
  review: { label: '후기', description: '실제 의뢰인들의 생생한 후기를 확인하세요.' },
  success: { label: '성공사례', description: '법무법인 여온의 다양한 성공 사례를 소개합니다.' },
  column: { label: '칼럼', description: '변호사·법무사가 직접 쓴 법률 칼럼입니다.' },
  news: { label: '여온소식', description: '법무법인 여온의 최신 소식을 전합니다.' },
} as const;

export const SITE_NAME = '법무법인 여온';
export const BOARD_HERO_IMAGE_URL = '/img/3f2ae6827f971.webp';
