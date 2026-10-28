import type { BoTable } from '../(story)/types/board';

export const BOARD_CACHE_REFRESH_EVENT = 'board-cache-refresh';

export type BoardCacheRefreshRequest = {
  bo_table: BoTable;
  wr_id: number;
  wr_seo_slug?: string;
  extra_bo_tables?: BoTable[];
};

export type BoardCacheRefreshResult = { request: BoardCacheRefreshRequest; ok: boolean };

/** Failure here must never turn a completed write into a failed save/delete. */
export async function refreshBoardCache(request: BoardCacheRefreshRequest): Promise<boolean> {
  let ok = false;
  try {
    const response = await fetch('/api/board/revalidate', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    const result = (await response.json()) as { ok?: boolean };
    ok = response.ok && result.ok === true;
  } catch {
    // The global notice retains the refresh request for retry, never the write.
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent<BoardCacheRefreshResult>(BOARD_CACHE_REFRESH_EVENT, {
        detail: { request, ok },
      }),
    );
  }
  return ok;
}
