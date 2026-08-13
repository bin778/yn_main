import { ALLOWED_BO_TABLES, BOARD_META, BOARD_PATH_SLUG, SITE_NAME } from '@/app/(story)/constants/boardContent';
import { getBoardPostPathSegment } from '@/app/(story)/lib/boardPostPath';
import type { BoardListItem, BoardListResponse, BoTable } from '@/app/(story)/types/board';
import { SITE_ORIGIN } from '@/app/lib/siteOrigin';

const BOARD_API_BASE = process.env.BOARD_API_URL ?? `${SITE_ORIGIN}/api/board`;
const RSS_PER_BOARD = 20;
const RSS_MAX_ITEMS = 50;
const RSS_PATH = '/rss.xml';

type RssItem = {
  title: string;
  link: string;
  pubDate: Date;
  guid: string;
  category: string;
  description: string;
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toRfc822(date: Date): string {
  return date.toUTCString();
}

async function fetchBoardListPage(boTable: BoTable): Promise<BoardListItem[]> {
  const searchParams = new URLSearchParams({
    bo_table: boTable,
    page: '1',
    per_page: String(RSS_PER_BOARD),
  });

  try {
    const res = await fetch(`${BOARD_API_BASE}/get_list.php?${searchParams.toString()}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as BoardListResponse;
    return data.items ?? [];
  } catch (error) {
    console.error(`rss: 게시판 목록 조회 실패 (${boTable})`, error);
    return [];
  }
}

function toRssItem(boTable: BoTable, item: BoardListItem): RssItem | null {
  const parsed = new Date(item.wr_datetime);
  if (Number.isNaN(parsed.getTime())) return null;

  const pathSlug = BOARD_PATH_SLUG[boTable];
  const segment = getBoardPostPathSegment(item.wr_id, item.wr_seo_slug);
  const link = `${SITE_ORIGIN}/${pathSlug}/${segment}/`;
  const category = BOARD_META[boTable].label;

  return {
    title: item.wr_subject,
    link,
    pubDate: parsed,
    guid: link,
    category,
    description: `${SITE_NAME} ${category} — ${item.wr_subject}`,
  };
}

async function collectRssItems(): Promise<RssItem[]> {
  const boards = await Promise.all(
    ALLOWED_BO_TABLES.map(async boTable => {
      const items = await fetchBoardListPage(boTable);
      return items.map(item => toRssItem(boTable, item)).filter((item): item is RssItem => item !== null);
    }),
  );

  return boards
    .flat()
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
    .slice(0, RSS_MAX_ITEMS);
}

export async function buildRssXml(): Promise<string> {
  const items = await collectRssItems();
  const selfUrl = `${SITE_ORIGIN}${RSS_PATH}`;
  const lastBuild = items[0]?.pubDate ?? new Date();

  const itemXml = items
    .map(
      item => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(item.link)}</link>
      <guid isPermaLink="true">${escapeXml(item.guid)}</guid>
      <pubDate>${toRfc822(item.pubDate)}</pubDate>
      <category>${escapeXml(item.category)}</category>
      <description>${escapeXml(item.description)}</description>
    </item>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${escapeXml(`${SITE_ORIGIN}/`)}</link>
    <description>${escapeXml('법무법인 여온 여온소식·성공사례·칼럼·후기 최신글')}</description>
    <language>ko</language>
    <lastBuildDate>${toRfc822(lastBuild)}</lastBuildDate>
    <atom:link href="${escapeXml(selfUrl)}" rel="self" type="application/rss+xml"/>
${itemXml}
  </channel>
</rss>
`;
}

export const RSS_FEED_URL = `${SITE_ORIGIN}${RSS_PATH}`;
