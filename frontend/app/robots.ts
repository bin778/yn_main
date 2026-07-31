import { SITE_ORIGIN } from '@/app/lib/sitemapEntries';

import type { MetadataRoute } from 'next';

/** 검색 인덱싱 대상이 아닌 경로 — 첨부 다운로드 API 포함 */
const DISALLOW_PATHS = ['/admin/', '/api/board/download_file.php'] as const;

const CRAWLER_USER_AGENTS = ['*', 'Googlebot', 'Bingbot', 'Yeti', 'OAI-SearchBot', 'GPTBot'] as const;

const ROBOTS_RULES: MetadataRoute.Robots['rules'] = CRAWLER_USER_AGENTS.map(userAgent => ({
  userAgent,
  allow: '/',
  disallow: [...DISALLOW_PATHS],
}));

export default function robots(): MetadataRoute.Robots {
  return {
    rules: ROBOTS_RULES,
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
  };
}
