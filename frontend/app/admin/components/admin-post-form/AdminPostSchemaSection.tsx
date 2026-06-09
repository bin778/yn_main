'use client';

import { useMemo } from 'react';

import type { BoTable } from '@/app/(story)/types/board';

import {
  applySchemaPlaceholders,
  buildBreadcrumbSchema,
  extractFaqSchemaFromHtml,
  formatSchemaJson,
  mergeSchemaGraph,
  normalizeLegacySchemaJson,
  parseBoardSchema,
} from '../../lib/boardSchema';

type AdminPostSchemaSectionProps = {
  boTable: BoTable;
  wrId?: number;
  subject: string;
  content: string;
  schema: string;
  onSchemaChange: (value: string) => void;
  disabled?: boolean;
};

export default function AdminPostSchemaSection({
  boTable,
  wrId,
  subject,
  content,
  schema,
  onSchemaChange,
  disabled = false,
}: AdminPostSchemaSectionProps) {
  const validation = useMemo(() => parseBoardSchema(schema), [schema]);

  const placeholderCtx = useMemo(() => ({ boTable, wrId, subject }), [boTable, wrId, subject]);

  function handleNormalizeLegacy() {
    const normalized = formatSchemaJson(normalizeLegacySchemaJson(schema));
    onSchemaChange(applySchemaPlaceholders(normalized, placeholderCtx));
  }

  function handleExtractFaq() {
    const faqNode = extractFaqSchemaFromHtml(content);
    if (faqNode === null) {
      window.alert('본문에서 FAQ(Q./답변) 패턴을 찾지 못했습니다.');
      return;
    }

    const withPlaceholders = applySchemaPlaceholders(
      mergeSchemaGraph(schema, { ...faqNode, '@id': `${placeholderCtx.wrId ?? 'new'}#faq` }),
      placeholderCtx,
    );
    onSchemaChange(withPlaceholders);
  }

  function handleBuildBreadcrumb() {
    const breadcrumb = buildBreadcrumbSchema(placeholderCtx);
    onSchemaChange(applySchemaPlaceholders(mergeSchemaGraph(schema, breadcrumb), placeholderCtx));
  }

  return (
    <div className="space-y-2 border border-[#e8e8e8] bg-[#fafbfc] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor="wr_schema" className="text-sm font-medium text-[#333]">
          구조화 데이터 (JSON-LD)
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={handleExtractFaq}
            className="cursor-pointer rounded border border-[#ddd] bg-white px-2 py-1 text-xs text-[#555] hover:bg-[#f5f5f5] disabled:cursor-not-allowed disabled:opacity-60"
          >
            FAQ 본문에서 추출
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={handleBuildBreadcrumb}
            className="cursor-pointer rounded border border-[#ddd] bg-white px-2 py-1 text-xs text-[#555] hover:bg-[#f5f5f5] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Breadcrumb 자동 생성
          </button>
          <button
            type="button"
            disabled={disabled || schema.trim() === ''}
            onClick={handleNormalizeLegacy}
            className="cursor-pointer rounded border border-[#ddd] bg-white px-2 py-1 text-xs text-[#555] hover:bg-[#f5f5f5] disabled:cursor-not-allowed disabled:opacity-60"
          >
            레거시 스키마 정제
          </button>
        </div>
      </div>

      <textarea
        id="wr_schema"
        disabled={disabled}
        value={schema}
        onChange={event => onSchemaChange(event.target.value)}
        rows={12}
        spellCheck={false}
        placeholder='{"@context":"https://schema.org","@graph":[]}'
        className="w-full border border-[#ddd] bg-white px-3 py-2 font-mono text-xs leading-relaxed text-[#333]"
      />

      <p className={`text-xs ${validation.ok ? 'text-[#667085]' : 'text-[#b42318]'}`}>
        {schema.trim() === ''
          ? '비어 있으면 상세 페이지에 구조화 데이터를 출력하지 않습니다.'
          : validation.ok
            ? '유효한 JSON입니다.'
            : validation.error}
      </p>
    </div>
  );
}
