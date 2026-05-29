import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://yeoon.co.kr/', changeFrequency: 'weekly', priority: 1 },
    { url: 'https://yeoon.co.kr/about/', changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://yeoon.co.kr/field/', changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://yeoon.co.kr/people/', changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://yeoon.co.kr/contact/', changeFrequency: 'monthly', priority: 0.7 },
    { url: 'https://yeoon.co.kr/privacy/', changeFrequency: 'yearly', priority: 0.3 },
  ];
}
