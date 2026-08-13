import { buildRssXml } from '@/app/lib/rssFeed';

export const revalidate = 3600;

export async function GET(): Promise<Response> {
  const xml = await buildRssXml();

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
