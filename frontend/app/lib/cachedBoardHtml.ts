import 'server-only';

import { unstable_cache } from 'next/cache';

import { sanitizeLegacyBoardHtml } from '../admin/lib/sanitizeLegacyBoardHtml';

// Bump whenever the sanitizer or its formatting/URL helpers change policy.
export const BOARD_HTML_POLICY_VERSION = 'board-html-v2';

export const getCachedBoardHtml = unstable_cache(
  async (html: string): Promise<string> => sanitizeLegacyBoardHtml(html),
  [BOARD_HTML_POLICY_VERSION],
  // The HTML argument is part of the cache key, so edited content gets a new entry. A TTL would only
  // force the sanitizer to re-run on every ISR regeneration of unchanged posts.
  { revalidate: false },
);
