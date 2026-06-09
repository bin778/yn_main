import { BOARD_PATH_SLUG } from '@/app/(story)/constants/boardContent';
import type { BoTable } from '@/app/(story)/types/board';

import { normalizeLegacySchemaJson } from './boardContentMode';

export type SchemaParseResult = { ok: true; json: string } | { ok: false; error: string };

export type SchemaPlaceholderContext = {
  wrId?: number;
  subject: string;
  boTable: BoTable;
  siteOrigin?: string;
};

export function parseBoardSchema(raw: string): SchemaParseResult {
  const trimmed = raw.trim();
  if (trimmed === '') {
    return { ok: true, json: '' };
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    return { ok: true, json: JSON.stringify(parsed) };
  } catch {
    return { ok: false, error: 'JSON 형식이 올바르지 않습니다.' };
  }
}

export { normalizeLegacySchemaJson };

export function applySchemaPlaceholders(json: string, ctx: SchemaPlaceholderContext): string {
  if (json.trim() === '') return '';

  const pathSlug = BOARD_PATH_SLUG[ctx.boTable];
  const origin = (ctx.siteOrigin ?? 'https://yeoon.co.kr').replace(/\/$/, '');
  const wrId = ctx.wrId ?? 0;
  const canonicalUrl = wrId > 0 ? `${origin}/${pathSlug}/${wrId}/` : `${origin}/${pathSlug}/`;

  return json
    .replace(/\[wr_id\]/gi, String(wrId))
    .replace(/\{\{wr_id\}\}/gi, String(wrId))
    .replace(/\{\{canonical_url\}\}/gi, canonicalUrl)
    .replace(/\{\{title\}\}/gi, ctx.subject)
    .replace(/\{\{subject\}\}/gi, ctx.subject);
}

export function buildBreadcrumbSchema(ctx: SchemaPlaceholderContext): Record<string, unknown> {
  const pathSlug = BOARD_PATH_SLUG[ctx.boTable];
  const origin = (ctx.siteOrigin ?? 'https://yeoon.co.kr').replace(/\/$/, '');
  const wrId = ctx.wrId ?? 0;
  const listUrl = `${origin}/${pathSlug}/`;
  const postUrl = wrId > 0 ? `${origin}/${pathSlug}/${wrId}/` : listUrl;
  const label = ctx.boTable === 'column' ? '법률칼럼' : ctx.boTable === 'news' ? '여온소식' : ctx.boTable;

  return {
    '@type': 'BreadcrumbList',
    '@id': `${postUrl}#breadcrumb`,
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': '홈', 'item': `${origin}/` },
      { '@type': 'ListItem', 'position': 2, 'name': label, 'item': listUrl },
      { '@type': 'ListItem', 'position': 3, 'name': ctx.subject || '게시글', 'item': postUrl },
    ],
  };
}

export function extractFaqSchemaFromHtml(html: string): Record<string, unknown> | null {
  if (typeof document === 'undefined') return null;

  const root = document.createElement('div');
  root.innerHTML = html;
  const headings = Array.from(root.querySelectorAll('h3'));

  const mainEntity: Record<string, unknown>[] = [];

  for (const heading of headings) {
    const questionText = (heading.textContent ?? '').trim();
    if (!questionText.startsWith('Q.')) continue;

    let answerNode = heading.nextElementSibling;
    while (answerNode !== null && answerNode.tagName !== 'P' && answerNode.tagName !== 'H3') {
      answerNode = answerNode.nextElementSibling;
    }
    if (answerNode === null || answerNode.tagName !== 'P') continue;

    const answerText = (answerNode.textContent ?? '').trim();
    if (answerText === '') continue;

    mainEntity.push({
      '@type': 'Question',
      'name': questionText.replace(/^Q\.\s*/, ''),
      'acceptedAnswer': { '@type': 'Answer', 'text': answerText },
    });
  }

  if (mainEntity.length === 0) return null;

  return {
    '@type': 'FAQPage',
    mainEntity,
  };
}

export function mergeSchemaGraph(existingJson: string, newNode: Record<string, unknown>): string {
  const trimmed = existingJson.trim();
  if (trimmed === '') {
    return JSON.stringify({ '@context': 'https://schema.org', '@graph': [newNode] }, null, 2);
  }

  const parsed = JSON.parse(trimmed) as Record<string, unknown>;
  if (Array.isArray(parsed['@graph'])) {
    const graph = parsed['@graph'] as Record<string, unknown>[];
    const type = newNode['@type'];
    const filtered = graph.filter(node => node['@type'] !== type);
    return JSON.stringify({ ...parsed, '@graph': [...filtered, newNode] }, null, 2);
  }

  if (parsed['@type'] === newNode['@type']) {
    return JSON.stringify({ '@context': 'https://schema.org', '@graph': [newNode] }, null, 2);
  }

  return JSON.stringify({ '@context': 'https://schema.org', '@graph': [parsed, newNode] }, null, 2);
}

export function formatSchemaJson(raw: string): string {
  const result = parseBoardSchema(normalizeLegacySchemaJson(raw));
  if (!result.ok || result.json === '') return raw;
  return JSON.stringify(JSON.parse(result.json), null, 2);
}
