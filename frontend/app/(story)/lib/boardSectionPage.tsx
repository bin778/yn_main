import type { Metadata } from 'next';

import BoardSectionListPage from '../components/BoardSectionListPage';
import { BOARD_META, SITE_NAME } from '../constants/boardContent';
import { buildBoardSectionListPath, getBoardSectionLabel, type SectionedBoTable } from '../constants/boardSections';
import type { BoardListSearchParams } from './parseBoardListQuery';

export function createBoardSectionMetadata(boTable: SectionedBoTable, category: string): Metadata {
  const { label, description } = BOARD_META[boTable];
  return {
    title: `${label} · ${getBoardSectionLabel(boTable, category)} | ${SITE_NAME}`,
    description,
    alternates: { canonical: buildBoardSectionListPath(boTable, category) },
  };
}

export function createBoardSectionPage(boTable: SectionedBoTable, category: string) {
  return async function BoardSectionPage({ searchParams }: { searchParams: Promise<BoardListSearchParams> }) {
    return <BoardSectionListPage boTable={boTable} category={category} searchParams={await searchParams} />;
  };
}
