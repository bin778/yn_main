import type { Metadata } from 'next';

import { SITE_ORIGIN } from '../../lib/siteOrigin';
import { BOARD_META, getBoardPathSlug, SITE_NAME } from '../constants/boardContent';
import type { BoTable } from '../types/board';

export const BOARD_LIST_QUERY_KEYS = ['page', 'q', 'view', 'sfl', 'sort'] as const;
export const BOARD_LIST_ISR_PREFIX = '/board-list-isr';

export function getBoardListIsrPath(boTable: BoTable): string {
  return `${BOARD_LIST_ISR_PREFIX}/${getBoardPathSlug(boTable)}/`;
}

export function getBoardListMetadata(boTable: BoTable): Metadata {
  const { label, description, pageTitle, pageDescription } = BOARD_META[boTable];

  return {
    title: pageTitle ?? `${label} | ${SITE_NAME}`,
    description: pageDescription ?? description,
    alternates: { canonical: `${SITE_ORIGIN}/${getBoardPathSlug(boTable)}/` },
  };
}
