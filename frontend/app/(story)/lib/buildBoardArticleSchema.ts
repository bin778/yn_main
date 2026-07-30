import { SITE_ORIGIN } from '@/app/lib/siteOrigin';

import { SITE_NAME } from '../constants/boardContent';
import type { BoardView } from '../types/board';

type BuildBoardArticleSchemaParams = {
  post: BoardView;
  canonicalHref: string;
  description: string;
};

function toIsoDateTime(dateTime: string): string {
  const trimmed = dateTime.trim();
  const mysqlDateTimePattern = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

  if (mysqlDateTimePattern.test(trimmed)) {
    return `${trimmed.replace(' ', 'T')}+09:00`;
  }

  return trimmed;
}

function toAbsoluteUrl(url: string): string {
  return new URL(url, SITE_ORIGIN).toString();
}

export function buildBoardArticleSchema({
  post,
  canonicalHref,
  description,
}: BuildBoardArticleSchemaParams): Record<string, unknown> {
  const canonicalUrl = toAbsoluteUrl(canonicalHref);
  const imageUrl = post.og_image_url?.trim() ?? '';

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': post.wr_subject,
    'description': description,
    'datePublished': toIsoDateTime(post.wr_datetime),
    'url': canonicalUrl,
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    'author': {
      '@type': 'Organization',
      'name': SITE_NAME,
      'url': SITE_ORIGIN,
    },
    'publisher': {
      '@type': 'Organization',
      'name': SITE_NAME,
      'url': SITE_ORIGIN,
    },
    ...(imageUrl !== '' ? { image: toAbsoluteUrl(imageUrl) } : {}),
  };
}
