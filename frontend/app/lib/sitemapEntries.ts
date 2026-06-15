import { ALLOWED_BO_TABLES, BOARD_PATH_SLUG } from '@/app/(story)/constants/boardContent';
import { getBoardPostPathSegment } from '@/app/(story)/lib/boardPostPath';
import type { BoardListItem, BoardListResponse } from '@/app/(story)/types/board';
import type { BoTable } from '@/app/(story)/types/board';
import { PEOPLE_IDS } from '@/app/constants/peopleContent';

import type { MetadataRoute } from 'next';

export const SITE_ORIGIN = 'https://yeoon.co.kr';
const BOARD_API_BASE = process.env.BOARD_API_URL ?? `${SITE_ORIGIN}/api/board`;
const SITEMAP_PER_PAGE = 50;

type SitemapPageConfig = {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
};

const STATIC_PAGES: readonly SitemapPageConfig[] = [
  { path: '/', changeFrequency: 'weekly', priority: 1 },
  { path: '/about/', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/field/', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/people/', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/contact/', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/privacy/', changeFrequency: 'yearly', priority: 0.3 },
] as const;

const BOARD_LIST_CONFIG: Record<BoTable, { changeFrequency: SitemapPageConfig['changeFrequency']; priority: number }> =
  {
    review: { changeFrequency: 'daily', priority: 0.7 },
    success: { changeFrequency: 'daily', priority: 0.7 },
    column: { changeFrequency: 'daily', priority: 0.7 },
    news: { changeFrequency: 'daily', priority: 0.7 },
  };

function toAbsoluteUrl(path: string): string {
  return `${SITE_ORIGIN}${path}`;
}

function toSitemapEntry(
  path: string,
  changeFrequency: SitemapPageConfig['changeFrequency'],
  priority: number,
  lastModified?: Date,
): MetadataRoute.Sitemap[number] {
  return {
    url: toAbsoluteUrl(path),
    changeFrequency,
    priority,
    ...(lastModified ? { lastModified } : {}),
  };
}

async function fetchBoardListPage(boTable: BoTable, page: number): Promise<BoardListResponse | null> {
  const searchParams = new URLSearchParams({
    bo_table: boTable,
    page: String(page),
    per_page: String(SITEMAP_PER_PAGE),
  });

  try {
    const res = await fetch(`${BOARD_API_BASE}/get_list.php?${searchParams.toString()}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return (await res.json()) as BoardListResponse;
  } catch (error) {
    console.error(`sitemap: 게시판 목록 조회 실패 (${boTable}, page ${page})`, error);
    return null;
  }
}

async function fetchBoardPostEntries(boTable: BoTable): Promise<MetadataRoute.Sitemap> {
  const slug = BOARD_PATH_SLUG[boTable];
  const listConfig = BOARD_LIST_CONFIG[boTable];
  const entries: MetadataRoute.Sitemap = [toSitemapEntry(`/${slug}/`, listConfig.changeFrequency, listConfig.priority)];

  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const data = await fetchBoardListPage(boTable, page);
    if (!data) break;

    totalPages = data.total_pages;
    for (const item of data.items) {
      entries.push(boardPostEntry(slug, item));
    }
    page += 1;
  }

  return entries;
}

function boardPostEntry(slug: string, item: BoardListItem): MetadataRoute.Sitemap[number] {
  const parsed = new Date(item.wr_datetime);
  const lastModified = Number.isNaN(parsed.getTime()) ? undefined : parsed;
  const postSegment = getBoardPostPathSegment(item.wr_id, item.wr_seo_slug);
  return toSitemapEntry(`/${slug}/${postSegment}/`, 'weekly', 0.6, lastModified);
}

export async function buildSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  const staticEntries = STATIC_PAGES.map(page => toSitemapEntry(page.path, page.changeFrequency, page.priority));

  const peopleEntries = PEOPLE_IDS.map(id => toSitemapEntry(`/people/${id}/`, 'monthly', 0.7));

  const boardEntries = await Promise.all(ALLOWED_BO_TABLES.map(fetchBoardPostEntries));

  return [...staticEntries, ...peopleEntries, ...boardEntries.flat()];
}
