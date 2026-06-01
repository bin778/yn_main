import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import BoardCategoryTabs from '../components/BoardCategoryTabs';
import BoardAdminBar from '../components/BoardAdminBar';
import BoardListSection from '../components/BoardListSection';
import { BOARD_META, getBoardPathSlug, resolveBoTableFromPathSlug, SITE_NAME } from '../constants/boardContent';
import { parseBoardListSort } from '../constants/boardSort';
import { fetchBoardList } from '../lib/boardApi';
import type { BoardListResponse, BoardSearchField } from '../types/board';

const EMPTY_LIST: BoardListResponse = {
  total: 0,
  page: 1,
  per_page: 12,
  total_pages: 0,
  items: [],
};

export const revalidate = 60;

type PageProps = {
  params: Promise<{ bo_table: string }>;
  searchParams: Promise<{ page?: string; q?: string; view?: string; sfl?: string; sort?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { bo_table: pathSlug } = await params;
  const boTable = resolveBoTableFromPathSlug(pathSlug);
  if (!boTable) return {};

  const { label, description } = BOARD_META[boTable];

  return {
    title: `${label} | ${SITE_NAME}`,
    description,
    alternates: { canonical: `/${getBoardPathSlug(boTable)}` },
  };
}

export default async function BoardListPage({ params, searchParams }: PageProps) {
  const { bo_table: pathSlug } = await params;
  const bo_table = resolveBoTableFromPathSlug(pathSlug);

  if (!bo_table) notFound();

  const { page: pageParam, q: qParam, view: viewParam, sfl: sflParam, sort: sortParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);
  const q = (qParam ?? '').trim();
  const viewMode = viewParam === 'grid' ? 'grid' : 'list';
  const sfl: BoardSearchField =
    sflParam === 'subject' || sflParam === 'content' || sflParam === 'name' || sflParam === 'subject_content'
      ? sflParam
      : 'subject_content';
  const sort = parseBoardListSort(sortParam);

  let data: BoardListResponse;
  try {
    data = await fetchBoardList(bo_table, page, q, sfl, sort);
  } catch {
    data = EMPTY_LIST;
  }

  const { label, description, heroBg } = BOARD_META[bo_table];

  return (
    <>
      <section className="relative w-full overflow-hidden" aria-labelledby="story-hero-heading">
        {heroBg ? (
          <>
            <Image src={heroBg} alt="" fill priority className="object-cover object-center" sizes="100vw" />
            <div className="absolute inset-0 bg-black/20" aria-hidden />
          </>
        ) : (
          <div className="absolute inset-0 bg-[#1a3151]" aria-hidden />
        )}
        <div className="relative z-[1] mx-auto max-w-[1200px] px-6 py-20 md:px-12 md:py-28">
          <div className="relative z-[1]">
            <p className="mb-2 text-[13px] font-medium uppercase tracking-widest text-white/50">여온의 이야기</p>
            <h1
              id="story-hero-heading"
              className="text-[35px] font-bold leading-none tracking-tight text-white md:text-[55px] md:tracking-[-1.5px]"
            >
              {label}
            </h1>
            <p className="mt-3 max-w-xl text-[15px] leading-[1.5] tracking-tight text-white/95 md:mt-4 md:text-lg md:leading-normal">
              {description}
            </p>
          </div>
        </div>
      </section>

      <BoardCategoryTabs current={bo_table} />
      <BoardAdminBar boTable={bo_table} />
      <BoardListSection boTable={bo_table} data={data} q={q} sfl={sfl} sort={sort} view={viewMode} />
    </>
  );
}
