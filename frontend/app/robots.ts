import { SITE_ORIGIN } from '@/app/lib/sitemapEntries';

import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        disallow: ['/board/bbs/faq.php', '/admin/'],
      },
      {
        userAgent: ['AdsBot-Google-Mobile', 'AdsBot-Google', 'Googlebot'],
        allow: ['/'],
      },
    ],
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
  };
}
