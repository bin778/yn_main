'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';

import { BOARD_META } from '@/app/(story)/constants/boardContent';
import type { BoTable } from '@/app/(story)/types/board';

import { getAdminListPath } from '../lib/adminBoard';
import { boardHtmlIsEmpty, sanitizeBoardHtml } from '../lib/sanitizeBoardHtml';

import BoardRichEditor from './BoardRichEditor';

type AdminPostFormProps = {
  boTable: BoTable;
  mode: 'create' | 'edit';
  wrId?: number;
  initialSubject?: string;
  initialContent?: string;
  onSubmit: (subject: string, content: string) => Promise<void>;
  onDelete?: () => Promise<void>;
};

export default function AdminPostForm({
  boTable,
  mode,
  wrId,
  initialSubject = '',
  initialContent = '',
  onSubmit,
  onDelete,
}: AdminPostFormProps) {
  const [subject, setSubject] = useState(initialSubject);
  const [content, setContent] = useState(() => sanitizeBoardHtml(initialContent));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const meta = BOARD_META[boTable];
  const listPath = getAdminListPath(boTable);
  const editorKey = `${mode}-${wrId ?? 'new'}-${initialSubject}`;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const cleanedContent = sanitizeBoardHtml(content);
    if (boardHtmlIsEmpty(cleanedContent)) {
      setError('내용을 입력해 주세요.');
      return;
    }

    setLoading(true);

    try {
      await onSubmit(subject.trim(), cleanedContent);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '저장에 실패했습니다.');
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (onDelete === undefined) return;
    if (!window.confirm('이 게시물을 삭제하시겠습니까?')) return;

    setError(null);
    setLoading(true);

    try {
      await onDelete();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : '삭제에 실패했습니다.');
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-[900px] px-4 py-10 md:px-6">
      <p className="mb-1 text-sm text-[#666]">{meta.label}</p>
      <h1 className="mb-6 text-2xl font-semibold text-[#1a3151]">
        {mode === 'create' ? '글쓰기' : '글 수정'}
        {mode === 'edit' && wrId !== undefined ? ` #${wrId}` : ''}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4 border border-[#e8e8e8] bg-white p-6">
        <div>
          <label htmlFor="wr_subject" className="mb-1 block text-sm font-medium">
            제목
          </label>
          <input
            id="wr_subject"
            required
            value={subject}
            onChange={event => setSubject(event.target.value)}
            className="w-full border border-[#ddd] px-3 py-2 text-sm"
          />
        </div>
        <div>
          <span className="mb-1 block text-sm font-medium">내용</span>
          <BoardRichEditor key={editorKey} value={content} onChange={setContent} disabled={loading} />
        </div>
        {error !== null && (
          <p className="text-sm text-[#b42318]" role="alert">
            {error}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#1a3151] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? '저장 중…' : '저장'}
          </button>
          <Link href={listPath} className="inline-flex items-center border border-[#ddd] px-4 py-2 text-sm">
            취소
          </Link>
          {mode === 'edit' && onDelete !== undefined && (
            <button
              type="button"
              disabled={loading}
              onClick={handleDelete}
              className="ml-auto border border-[#b42318] px-4 py-2 text-sm text-[#b42318] disabled:opacity-60"
            >
              삭제
            </button>
          )}
        </div>
      </form>
    </main>
  );
}
