'use client';

import { useState } from 'react';

import { downloadBoardAttachment } from '../lib/boardApi';
import type { BoTable, BoardFile } from '../types/board';

type BoardAttachmentItemProps = {
  boTable: BoTable;
  wrId: number;
  file: BoardFile;
  formatFileSize: (bytes: number) => string;
};

function saveBlobAsFile(blob: Blob, filename: string): void {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(objectUrl);
}

export default function BoardAttachmentItem({ boTable, wrId, file, formatFileSize }: BoardAttachmentItemProps) {
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleProtectedDownload(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const blob = await downloadBoardAttachment(boTable, wrId, file.no, password);
      saveBlobAsFile(blob, file.source);
      setShowModal(false);
      setPassword('');
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : '다운로드에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  const fileLabel = (
    <>
      <span aria-hidden>{file.is_image ? '🖼' : '📎'}</span>
      <span>{file.source}</span>
      <span className="text-[12px] text-[#aaa]">({formatFileSize(file.size)})</span>
      {file.has_password && <span className="text-[12px] text-[#888]">🔒</span>}
    </>
  );

  if (!file.has_password && file.url) {
    return (
      <a
        href={file.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-[14px] text-[#1a3151] underline underline-offset-2 hover:text-[#1a3151]/70"
      >
        {fileLabel}
      </a>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setPassword('');
          setShowModal(true);
        }}
        className="inline-flex items-center gap-2 text-[14px] text-[#1a3151] underline underline-offset-2 hover:text-[#1a3151]/70"
      >
        {fileLabel}
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="attachment-password-title"
        >
          <form onSubmit={handleProtectedDownload} className="w-full max-w-sm rounded bg-white p-6 shadow-lg">
            <h3 id="attachment-password-title" className="text-base font-semibold text-[#121212]">
              첨부파일 다운로드
            </h3>
            <p className="mt-1 text-sm text-[#666]">{file.source}</p>

            <label className="mt-4 block text-sm font-medium text-[#333]" htmlFor="attachment-download-password">
              비밀번호
            </label>
            <input
              id="attachment-download-password"
              type="password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              autoComplete="off"
              className="mt-1 w-full border border-[#ddd] px-3 py-2 text-sm"
              disabled={loading}
            />

            {error !== null && (
              <p className="mt-2 text-sm text-[#b42318]" role="alert">
                {error}
              </p>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="border border-[#ddd] px-4 py-2 text-sm text-[#666] hover:bg-[#f5f5f5] disabled:opacity-60"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={loading || password.trim() === ''}
                className="bg-[#1a3151] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {loading ? '다운로드 중…' : '다운로드'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
