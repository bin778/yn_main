import Image from 'next/image';

import BoardCategoryTabs from './BoardCategoryTabs';
import BoardAdminBar from './BoardAdminBar';
import BoardListSection from './BoardListSection';
import SuccessStorySubTabs from './SuccessStorySubTabs';
import { BOARD_META } from '../constants/boardContent';
import { getSuccessStoryCategoryLabel, type SuccessStoryCategory } from '../constants/successStoryCategories';
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

type SuccessStoryCategoryListPageProps = {
  category: SuccessStoryCategory;
  searchParams: BoardListSearchParams;
};

export default async function SuccessStoryCategoryListPage({
  category,
  searchParams,
}: SuccessStoryCategoryListPageProps) {
  const { page, q, viewMode, sfl, sort } = parseBoardListQuery(searchParams);

  let data: BoardListResponse;
  try {
    data = await fetchBoardList('success', page, q, sfl, sort, category);
  } catch {
    data = EMPTY_LIST;
  }

  const { label, description, heroBg } = BOARD_META.success;
  const categoryLabel = getSuccessStoryCategoryLabel(category);

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
                {categoryLabel}
              </span>
            </h1>
            <p className="mt-3 max-w-xl text-[15px] leading-[1.5] tracking-tight text-white/95 md:mt-4 md:text-lg md:leading-normal">
              {description}
            </p>
          </div>
        </div>
      </section>

      <BoardCategoryTabs current="success" />
      <SuccessStorySubTabs current={category} />
      <BoardAdminBar boTable="success" />
      <BoardListSection
        boTable="success"
        data={data}
        q={q}
        sfl={sfl}
        sort={sort}
        view={viewMode}
        successCategory={category}
      />
    </>
  );
}
