import { SITE_ORIGIN } from '@/app/lib/sitemapEntries';

import type { MetadataRoute } from 'next';

const ROBOTS_RULES: MetadataRoute.Robots['rules'] = [
  { userAgent: '*', allow: '/', disallow: ['/admin/'] },
  { userAgent: 'Googlebot', allow: '/' },
  { userAgent: 'Bingbot', allow: '/' },
  { userAgent: 'Yeti', allow: '/' },
  { userAgent: 'OAI-SearchBot', allow: '/' },
  { userAgent: 'GPTBot', allow: '/' },
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: ROBOTS_RULES,
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
  };
}
