import 'server-only';

import { unstable_cache } from 'next/cache';

// Bump whenever the sanitizer or its formatting/URL helpers change policy.
export const BOARD_HTML_POLICY_VERSION = 'board-html-v1';

export const getCachedBoardHtml = unstable_cache(
  async (html: string): Promise<string> => {
    const { sanitizeLegacyBoardHtml } = await import('../admin/lib/sanitizeLegacyBoardHtml');
    return sanitizeLegacyBoardHtml(html);
  },
  [BOARD_HTML_POLICY_VERSION],
  { revalidate: 3600 },
);
