import Image from 'next/image';

import BoardCategoryTabs from './BoardCategoryTabs';
import BoardAdminBar from './BoardAdminBar';
import BoardListSection from './BoardListSection';
import BoardSectionTabs from './BoardSectionTabs';
import { BOARD_META } from '../constants/boardContent';
import { hasBoardSections } from '../constants/boardSections';
import type { ParsedBoardListQuery } from '../lib/parseBoardListQuery';
import type { BoardListResponse, BoTable } from '../types/board';

type Props = {
  boTable: BoTable;
  data: BoardListResponse;
  query: ParsedBoardListQuery;
};

export default function BoardListPageContent({ boTable, data, query }: Props) {
  const { q, sfl, sort, viewMode } = query;
  const { label, description, heroBg } = BOARD_META[boTable];

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
            </h1>
            <p className="mt-3 max-w-xl text-[15px] leading-[1.5] tracking-tight text-white/95 md:mt-4 md:text-lg md:leading-normal">
              {description}
            </p>
          </div>
        </div>
      </section>

      <BoardCategoryTabs current={boTable} />
      {hasBoardSections(boTable) ? <BoardSectionTabs boTable={boTable} category={null} /> : null}
      <BoardAdminBar boTable={boTable} />
      <BoardListSection boTable={boTable} data={data} q={q} sfl={sfl} sort={sort} view={viewMode} />
    </>
  );
}
