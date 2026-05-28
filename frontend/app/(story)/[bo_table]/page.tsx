import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import BoardListSection from '../components/BoardListSection';
import { ALLOWED_BO_TABLES, BOARD_META, SITE_NAME } from '../constants/boardContent';
import { fetchBoardList } from '../lib/boardApi';
import type { BoTable, BoardListResponse } from '../types/board';

const EMPTY_LIST: BoardListResponse = {
  total: 0, page: 1, per_page: 10, total_pages: 0, items: [],
};

export const revalidate = 60;

type PageProps = {
  params: Promise<{ bo_table: string }>;
  searchParams: Promise<{ page?: string }>;
};

function isValidBoTable(value: string): value is BoTable {
  return (ALLOWED_BO_TABLES as readonly string[]).includes(value);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { bo_table } = await params;
  if (!isValidBoTable(bo_table)) return {};

  const { label, description } = BOARD_META[bo_table];

  return {
    title: `${label} | ${SITE_NAME}`,
    description,
    alternates: { canonical: `/${bo_table}` },
  };
}

export default async function BoardListPage({ params, searchParams }: PageProps) {
  const { bo_table } = await params;

  if (!isValidBoTable(bo_table)) notFound();

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);

  let data: BoardListResponse;
  try {
    data = await fetchBoardList(bo_table, page);
  } catch {
    data = EMPTY_LIST;
  }

  const { label, description } = BOARD_META[bo_table];

  return (
    <>
      <section className="bg-[#1a3151] px-6 py-16 md:py-24">
        <div className="mx-auto max-w-[900px]">
          <p className="mb-2 text-[13px] font-medium uppercase tracking-widest text-white/50">여온의 이야기</p>
          <h1 className="text-[32px] font-bold tracking-tight text-white md:text-[44px]">{label}</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-white/70 md:text-[17px]">{description}</p>
        </div>
      </section>

      <BoardListSection boTable={bo_table} data={data} />
    </>
  );
}
