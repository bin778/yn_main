import Image from 'next/image';

import BoardAdminBar from './BoardAdminBar';
import BoardCategoryTabs from './BoardCategoryTabs';
import BoardListSection from './BoardListSection';
import BoardSectionTabs from './BoardSectionTabs';
import { BOARD_META } from '../constants/boardContent';
import {
  getBoardSectionLabel,
  getBoardSubSectionLabel,
  type SectionedBoTable,
} from '../constants/boardSections';
import { fetchBoardList } from '../lib/boardApi';
import { parseBoardListQuery, type BoardListSearchParams } from '../lib/parseBoardListQuery';
import type { BoardListResponse } from '../types/board';

const EMPTY_LIST: BoardListResponse = {
  total: 0,
  page: 1,
  per_page: 12,
  total_pages: 0,
  items: [],
};

type BoardSectionListPageProps = {
  boTable: SectionedBoTable;
  category: string;
  subcategory?: string | null;
  searchParams: BoardListSearchParams;
};

export default async function BoardSectionListPage({
  boTable,
  category,
  subcategory = null,
  searchParams,
}: BoardSectionListPageProps) {
  const { page, q, viewMode, sfl, sort } = parseBoardListQuery(searchParams);

  let data: BoardListResponse;
  try {
    data = await fetchBoardList(boTable, page, q, sfl, sort, category, subcategory ?? undefined);
  } catch {
    data = EMPTY_LIST;
  }

  const { label, description, heroBg } = BOARD_META[boTable];
  const categoryLabel = getBoardSectionLabel(boTable, category);
  const subcategoryLabel =
    subcategory !== null && subcategory !== '' ? getBoardSubSectionLabel(boTable, category, subcategory) : null;

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
              className="text-[30px] md:text-[45px] font-bold leading-none tracking-tight text-white md:tracking-[-1.5px]"
            >
              {label}
              <span className="mt-2 block text-[22px] font-semibold text-white/90 md:mt-3 md:text-[28px]">
                {subcategoryLabel !== null ? `${categoryLabel} · ${subcategoryLabel}` : categoryLabel}
              </span>
            </h1>
            <p className="mt-3 max-w-xl text-[15px] leading-[1.5] tracking-tight text-white/95 md:mt-4 md:text-lg md:leading-normal">
              {description}
            </p>
          </div>
        </div>
      </section>

      <BoardCategoryTabs current={boTable} />
      <BoardSectionTabs boTable={boTable} category={category} subcategory={subcategory} />
      <BoardAdminBar boTable={boTable} />
      <BoardListSection
        boTable={boTable}
        data={data}
        q={q}
        sfl={sfl}
        sort={sort}
        view={viewMode}
        sectionCategory={category}
        sectionSubcategory={subcategory}
      />
    </>
  );
}
