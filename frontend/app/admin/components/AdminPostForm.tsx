'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';

import { BOARD_META } from '@/app/(story)/constants/boardContent';
import { createBoardPost, updateBoardPost, uploadBoardFile } from '@/app/(story)/lib/boardAdminApi';
import type { BoTable } from '@/app/(story)/types/board';

import { saveBoardDraft } from '../lib/boardDraftStorage';
import { SEO_DESCRIPTION_MAX, stripHtmlForMetaDescription } from '@/app/(story)/lib/boardSeo';

import {
  BOARD_ATTACHMENT_PASSWORD_MAX,
  BOARD_ATTACHMENT_PASSWORD_MIN,
  defaultDatetimeLocal,
  toDatetimeLocalValue,
  toMysqlDatetime,
  type BoardPostFile,
  type BoardPostPayload,
} from '../lib/boardPostTypes';
import { getAdminListPath } from '../lib/adminBoard';
import {
  BOARD_ATTACHMENT_ACCEPT,
  BOARD_ATTACHMENT_HINT,
  BOARD_IMAGE_ACCEPT,
  BOARD_IMAGE_HINT,
  validateBoardAttachmentFile,
  validateBoardImageFile,
} from '../lib/boardAttachmentAccept';
import { boardHtmlIsEmpty, sanitizeBoardHtml, sanitizeBoardHtmlForSave } from '../lib/sanitizeBoardHtml';

import BoardRichEditor from './BoardRichEditor';
import FilePickerField from './FilePickerField';
import PostDraftPanel from './PostDraftPanel';
import SeoPreview from './SeoPreview';

export type AdminPostInitial = {
  subject: string;
  content: string;
  notice: boolean;
  datetimeLocal: string;
  thumbnailUrl: string;
  seoTitle: string;
  seoSlug: string;
  seoDescription: string;
  attachment: BoardPostFile | null;
};

type AdminPostFormProps = {
  boTable: BoTable;
  mode: 'create' | 'edit';
  wrId?: number;
  initial: AdminPostInitial;
  onSaved: (wrId: number) => void;
  onDelete?: () => Promise<void>;
};

function buildPayload(
  subject: string,
  content: string,
  notice: boolean,
  datetimeLocal: string,
  thumbnailUrl: string,
  seoTitle: string,
  seoSlug: string,
  seoDescription: string,
  removeAttachment: boolean,
  attachmentPassword: string,
  clearAttachmentPassword: boolean,
): BoardPostPayload {
  const payload: BoardPostPayload = {
    wr_subject: subject.trim(),
    wr_content: content,
    notice,
    wr_datetime: toMysqlDatetime(datetimeLocal),
    wr_1: thumbnailUrl.trim(),
    wr_seo_title: seoTitle.trim(),
    wr_seo_slug: seoSlug.trim(),
    wr_seo_description: seoDescription.trim(),
    remove_attachment: removeAttachment,
  };

  if (!removeAttachment) {
    if (clearAttachmentPassword) {
      payload.clear_attachment_password = true;
    } else if (attachmentPassword.trim() !== '') {
      payload.attachment_password = attachmentPassword.trim();
    }
  }

  return payload;
}

function validateAttachmentPassword(password: string): string | null {
  const trimmed = password.trim();
  if (trimmed === '') return null;
  if (trimmed.length < BOARD_ATTACHMENT_PASSWORD_MIN || trimmed.length > BOARD_ATTACHMENT_PASSWORD_MAX) {
    return `다운로드 비밀번호는 ${BOARD_ATTACHMENT_PASSWORD_MIN}~${BOARD_ATTACHMENT_PASSWORD_MAX}자여야 합니다.`;
  }
  return null;
}

export default function AdminPostForm({ boTable, mode, wrId, initial, onSaved, onDelete }: AdminPostFormProps) {
  const [subject, setSubject] = useState(initial.subject);
  const [content, setContent] = useState(() => sanitizeBoardHtml(initial.content));
  const [notice, setNotice] = useState(initial.notice);
  const [datetimeLocal, setDatetimeLocal] = useState(initial.datetimeLocal);
  const [thumbnailUrl, setThumbnailUrl] = useState(initial.thumbnailUrl);
  const [seoTitle, setSeoTitle] = useState(initial.seoTitle);
  const [seoSlug, setSeoSlug] = useState(initial.seoSlug);
  const [seoDescription, setSeoDescription] = useState(initial.seoDescription);
  const [showSlugInput, setShowSlugInput] = useState(initial.seoSlug !== '');
  const [attachment, setAttachment] = useState<BoardPostFile | null>(initial.attachment);
  const [pendingAttachment, setPendingAttachment] = useState<File | null>(null);
  const [removeAttachment, setRemoveAttachment] = useState(false);
  const [attachmentPassword, setAttachmentPassword] = useState('');
  const [clearAttachmentPassword, setClearAttachmentPassword] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [draftRefreshKey, setDraftRefreshKey] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  const meta = BOARD_META[boTable];
  const listPath = getAdminListPath(boTable);
  const editorKey = `${mode}-${wrId ?? 'new'}-${initial.subject}`;

  const bodyDescriptionFallback = useMemo(() => stripHtmlForMetaDescription(content), [content]);
  const seoPreviewDescription = seoDescription.trim() || bodyDescriptionFallback;

  function handleSubjectChange(value: string) {
    setSubject(value);
  }

  async function handleThumbnailFile(file: File) {
    const validationError = validateBoardImageFile(file);
    if (validationError !== null) {
      setError(validationError);
      return;
    }

    setUploadingThumb(true);
    setError(null);
    try {
      const uploaded = await uploadBoardFile(boTable, file, 'thumbnail', wrId);
      if (uploaded.url) setThumbnailUrl(uploaded.url);
    } catch (thumbError) {
      setError(thumbError instanceof Error ? thumbError.message : '썸네일 업로드에 실패했습니다.');
    } finally {
      setUploadingThumb(false);
    }
  }

  async function handleEditorImageUpload(file: File): Promise<string> {
    const validationError = validateBoardImageFile(file);
    if (validationError !== null) throw new Error(validationError);

    const uploaded = await uploadBoardFile(boTable, file, 'editor_image', wrId);
    if (!uploaded.url) throw new Error('이미지 URL을 받지 못했습니다.');
    return uploaded.url;
  }

  function buildCurrentPayload(cleanedContent: string): BoardPostPayload {
    return buildPayload(
      subject,
      cleanedContent,
      notice,
      datetimeLocal,
      thumbnailUrl,
      seoTitle,
      seoSlug,
      seoDescription,
      removeAttachment,
      attachmentPassword,
      clearAttachmentPassword,
    );
  }

  function handleSaveDraft() {
    const cleaned = sanitizeBoardHtmlForSave(content);
    saveBoardDraft(boTable, buildCurrentPayload(cleaned));
    setDraftRefreshKey(key => key + 1);
    window.alert('임시 저장되었습니다.');
  }

  function loadDraft(draft: BoardPostPayload & { preview: string }) {
    setSubject(draft.wr_subject);
    setContent(sanitizeBoardHtmlForSave(draft.wr_content));
    setNotice(draft.notice);
    setDatetimeLocal(toDatetimeLocalValue(draft.wr_datetime) || defaultDatetimeLocal());
    setThumbnailUrl(draft.wr_1);
    setSeoTitle(draft.wr_seo_title);
    setSeoSlug(draft.wr_seo_slug);
    setSeoDescription(draft.wr_seo_description ?? '');
    if (draft.wr_seo_slug !== '') setShowSlugInput(true);
    setPendingAttachment(null);
    setRemoveAttachment(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const cleanedContent = sanitizeBoardHtmlForSave(content);
    if (boardHtmlIsEmpty(cleanedContent)) {
      setError('내용을 입력해 주세요.');
      return;
    }

    const passwordError = validateAttachmentPassword(attachmentPassword);
    if (passwordError !== null) {
      setError(passwordError);
      return;
    }

    const payload = buildCurrentPayload(cleanedContent);
    setLoading(true);

    try {
      let savedId = wrId ?? 0;

      if (mode === 'create') {
        const created = await createBoardPost(boTable, payload);
        savedId = created.wr_id;
      } else if (wrId !== undefined) {
        await updateBoardPost(boTable, wrId, payload);
        savedId = wrId;
      }

      if (pendingAttachment !== null && savedId > 0) {
        const passwordForUpload = clearAttachmentPassword ? '' : attachmentPassword;
        const uploaded = await uploadBoardFile(boTable, pendingAttachment, 'attachment', savedId, passwordForUpload);
        setAttachment({
          no: 0,
          source: pendingAttachment.name,
          url: uploaded.url,
          size: pendingAttachment.size,
          is_image: pendingAttachment.type.startsWith('image/'),
          width: null,
          height: null,
          has_password: uploaded.has_password,
        });
        setPendingAttachment(null);
        setAttachmentPassword('');
        setClearAttachmentPassword(false);
      }

      onSaved(savedId);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '저장에 실패했습니다.');
      setPendingAttachment(null);
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

  const handleClosePreview = useCallback(() => setShowPreview(false), []);

  useEffect(() => {
    if (!showPreview) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') handleClosePreview();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [showPreview, handleClosePreview]);

  const attachmentLabel = pendingAttachment?.name ?? attachment?.source ?? null;
  const hasThumbnail = thumbnailUrl !== '';
  const hasAttachment = attachmentLabel !== null && !removeAttachment;

  function handleAttachmentFile(file: File) {
    const fileError = validateBoardAttachmentFile(file);
    if (fileError !== null) {
      setError(fileError);
      setPendingAttachment(null);
      return;
    }

    const passwordError = validateAttachmentPassword(attachmentPassword);
    if (passwordError !== null) {
      setError(passwordError);
      return;
    }

    if (mode === 'edit' && wrId !== undefined && wrId > 0) {
      setUploadingAttachment(true);
      setError(null);
      const passwordForUpload = clearAttachmentPassword ? '' : attachmentPassword;
      uploadBoardFile(boTable, file, 'attachment', wrId, passwordForUpload)
        .then(uploaded => {
          setAttachment({
            no: 0,
            source: file.name,
            url: uploaded.url,
            size: file.size,
            is_image: file.type.startsWith('image/'),
            width: null,
            height: null,
            has_password: uploaded.has_password,
          });
          setRemoveAttachment(false);
          setPendingAttachment(null);
          setAttachmentPassword('');
          setClearAttachmentPassword(false);
        })
        .catch(uploadError => {
          setError(uploadError instanceof Error ? uploadError.message : '첨부 업로드에 실패했습니다.');
          setPendingAttachment(null);
        })
        .finally(() => setUploadingAttachment(false));
      return;
    }
    setPendingAttachment(file);
    setRemoveAttachment(false);
  }

  function handleRemoveAttachment() {
    setRemoveAttachment(true);
    setPendingAttachment(null);
    setAttachmentPassword('');
    setClearAttachmentPassword(false);
  }

  const attachmentHasPassword = attachment?.has_password === true && !removeAttachment;

  const attachmentHint = (() => {
    if (!hasAttachment || attachmentLabel === null) return null;
    if (mode === 'create' && pendingAttachment !== null) {
      return `저장 시 함께 업로드: ${pendingAttachment.name}`;
    }
    return `현재: ${attachmentLabel}`;
  })();

  return (
    <main className="mx-auto max-w-[900px] px-4 py-10 md:px-6">
      <p className="mb-1 text-sm text-[#666]">{meta.label}</p>
      <h1 className="mb-6 text-2xl font-semibold text-[#1a3151]">
        {mode === 'create' ? '글쓰기' : '글 수정'}
        {mode === 'edit' && wrId !== undefined ? ` #${wrId}` : ''}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5 border border-[#e8e8e8] bg-white p-6">
        {/* 상단: 공지 + 임시저장 */}
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-[#333]">
            <input
              type="checkbox"
              checked={notice}
              onChange={event => setNotice(event.target.checked)}
              disabled={loading}
              className="h-4 w-4"
            />
            공지
          </label>
          <p className="ml-auto text-xs text-[#999]">
            <span className="text-[#b42318] font-bold">*</span> 필수 입력
          </p>
          <div className="flex items-center gap-2">
            <PostDraftPanel boTable={boTable} onLoad={loadDraft} refreshKey={draftRefreshKey} />
            <button
              type="button"
              disabled={loading}
              onClick={handleSaveDraft}
              className="rounded bg-[#f0f2f5] px-3 py-1.5 text-sm font-medium text-[#333] hover:bg-[#e4e7ec]"
            >
              임시 저장
            </button>
          </div>
        </div>

        {/* 필수: 제목 */}
        <div>
          <label htmlFor="wr_subject" className="mb-1 flex items-center gap-1 text-sm font-medium">
            제목{' '}
            <span className="text-[#b42318]" aria-hidden>
              *
            </span>
          </label>
          <input
            id="wr_subject"
            required
            value={subject}
            onChange={event => handleSubjectChange(event.target.value)}
            className="w-full border border-[#ddd] px-3 py-2 text-sm focus:border-[#1a3151] focus:outline-none"
          />
        </div>

        {/* 발행일 */}
        <div className="w-full sm:w-72">
          <label htmlFor="wr_datetime" className="mb-1 block text-sm font-medium">
            발행일 <span className="text-xs font-normal text-[#999]">(기본: 현재 시각)</span>
          </label>
          <input
            id="wr_datetime"
            type="datetime-local"
            value={datetimeLocal}
            onChange={event => setDatetimeLocal(event.target.value)}
            className="w-full border border-[#ddd] px-3 py-2 text-sm"
          />
        </div>

        {/* SEO 섹션 */}
        <details className="rounded border border-[#e0e8f4] bg-[#f8fafc]">
          <summary className="cursor-pointer select-none px-4 py-3 text-sm font-medium text-[#1a3151]">
            SEO 설정 <span className="text-xs font-normal text-[#999]">(선택, 비우면 제목·글번호로 자동 설정)</span>
          </summary>
          <div className="space-y-4 border-t border-[#e0e8f4] px-4 py-4">
            <SeoPreview
              boTable={boTable}
              title={seoTitle.trim() || subject}
              slug={seoSlug}
              wrId={wrId}
              description={seoPreviewDescription}
            />
            <div>
              <label htmlFor="wr_seo_title" className="mb-1 block text-sm font-medium">
                SEO 제목 <span className="text-xs font-normal text-[#999]">(비우면 제목 사용)</span>
              </label>
              <input
                id="wr_seo_title"
                value={seoTitle}
                placeholder={subject || '제목을 입력하면 자동으로 사용됩니다'}
                onChange={event => setSeoTitle(event.target.value)}
                className="w-full border border-[#ddd] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="wr_seo_description" className="mb-1 block text-sm font-medium">
                SEO 설명{' '}
                <span className="text-xs font-normal text-[#999]">
                  (비우면 본문 요약 사용, 최대 {SEO_DESCRIPTION_MAX}자)
                </span>
              </label>
              <textarea
                id="wr_seo_description"
                rows={3}
                maxLength={SEO_DESCRIPTION_MAX}
                value={seoDescription}
                placeholder={bodyDescriptionFallback || '본문을 입력하면 검색 결과 설명 미리보기에 반영됩니다'}
                onChange={event => setSeoDescription(event.target.value)}
                className="w-full resize-y border border-[#ddd] px-3 py-2 text-sm leading-relaxed"
              />
              <p className="mt-1 text-xs text-[#999]">
                {seoDescription.length}/{SEO_DESCRIPTION_MAX}자 · 본문과 다른 검색용 요약을 쓸 수 있습니다.
              </p>
            </div>
            <div>
              {!showSlugInput ? (
                <button
                  type="button"
                  className="text-xs text-[#1a3151] underline"
                  onClick={() => setShowSlugInput(true)}
                >
                  Slug 직접 입력 (기본: 글 번호)
                </button>
              ) : (
                <>
                  <label htmlFor="wr_seo_slug" className="mb-1 block text-sm font-medium">
                    Slug <span className="text-xs font-normal text-[#999]">(비우면 글 번호로 저장)</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="wr_seo_slug"
                      value={seoSlug}
                      onChange={event => setSeoSlug(event.target.value)}
                      className="flex-1 border border-[#ddd] px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      className="border border-[#ddd] px-3 py-2 text-xs text-[#999] hover:text-[#b42318]"
                      onClick={() => {
                        setSeoSlug('');
                        setShowSlugInput(false);
                      }}
                    >
                      초기화
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </details>

        {/* 썸네일 */}
        <div>
          <span className="mb-1 block text-sm font-medium">
            썸네일 <span className="text-xs font-normal text-[#999]">(선택)</span>
          </span>
          <div className="flex flex-wrap items-start gap-4">
            {hasThumbnail && (
              <div className="relative h-24 w-40 shrink-0 overflow-hidden rounded border border-[#ddd] bg-[#f5f5f5]">
                <Image src={thumbnailUrl} alt="" fill className="object-cover" sizes="160px" unoptimized />
              </div>
            )}
            <FilePickerField
              accept={BOARD_IMAGE_ACCEPT}
              uploadLabel="썸네일 업로드"
              changeLabel="이미지 변경"
              removeLabel="썸네일 제거"
              busyLabel="썸네일 업로드 중…"
              disabled={loading}
              busy={uploadingThumb}
              hasSelection={hasThumbnail}
              hint={BOARD_IMAGE_HINT}
              onFileSelect={file => void handleThumbnailFile(file)}
              onRemove={() => setThumbnailUrl('')}
            />
          </div>
        </div>

        <div>
          <span className="mb-1 flex items-center gap-1 text-sm font-medium">
            내용{' '}
            <span className="text-[#b42318]" aria-hidden>
              *
            </span>
          </span>
          <BoardRichEditor
            key={editorKey}
            value={content}
            onChange={setContent}
            disabled={loading}
            onUploadImage={handleEditorImageUpload}
          />
        </div>

        <div>
          <span className="mb-1 block text-sm font-medium">
            파일 첨부 (1개) <span className="text-xs font-normal text-[#999]">({BOARD_ATTACHMENT_HINT})</span>
          </span>
          <FilePickerField
            accept={BOARD_ATTACHMENT_ACCEPT}
            uploadLabel="파일 첨부"
            changeLabel="파일 변경"
            removeLabel="첨부 제거"
            busyLabel="첨부 업로드 중…"
            disabled={loading || uploadingAttachment}
            busy={uploadingAttachment}
            hasSelection={hasAttachment}
            hint={attachmentHint}
            onFileSelect={handleAttachmentFile}
            onRemove={handleRemoveAttachment}
          />
          {hasAttachment && (
            <div className="mt-3 space-y-2">
              <label className="block text-sm font-medium text-[#333]" htmlFor="attachment-password">
                다운로드 비밀번호 <span className="text-xs font-normal text-[#999]">(선택)</span>
              </label>
              <input
                id="attachment-password"
                type="password"
                value={attachmentPassword}
                onChange={event => {
                  setAttachmentPassword(event.target.value);
                  if (event.target.value.trim() !== '') setClearAttachmentPassword(false);
                }}
                placeholder={`${BOARD_ATTACHMENT_PASSWORD_MIN}~${BOARD_ATTACHMENT_PASSWORD_MAX}자, 미입력 시 공개 다운로드`}
                autoComplete="new-password"
                disabled={loading || uploadingAttachment || clearAttachmentPassword}
                className="w-full border border-[#ddd] px-3 py-2 text-sm disabled:bg-[#f5f5f5]"
              />
              {attachmentHasPassword && (
                <label className="flex items-center gap-2 text-sm text-[#555]">
                  <input
                    type="checkbox"
                    checked={clearAttachmentPassword}
                    onChange={event => {
                      setClearAttachmentPassword(event.target.checked);
                      if (event.target.checked) setAttachmentPassword('');
                    }}
                    disabled={loading || uploadingAttachment}
                  />
                  기존 비밀번호 제거 (공개 다운로드로 변경)
                </label>
              )}
              {attachmentHasPassword && !clearAttachmentPassword && attachmentPassword === '' && (
                <p className="text-xs text-[#888]">
                  비밀번호가 설정되어 있습니다. 변경하려면 새 비밀번호를 입력하세요.
                </p>
              )}
            </div>
          )}
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
          <button
            type="button"
            disabled={loading}
            onClick={() => setShowPreview(true)}
            className="border border-[#1a3151] px-4 py-2 text-sm font-medium text-[#1a3151] hover:bg-[#f0f4f9] disabled:opacity-60"
          >
            미리보기
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

      {/* 미리보기 모달 */}
      {showPreview && (
        <div
          className="fixed inset-0 z-[110] flex items-start justify-center bg-black/50 px-4 pb-6 pt-[120px]"
          onClick={handleClosePreview}
        >
          <div
            className="relative w-full max-w-3xl max-h-[calc(100vh-8.5rem)] overflow-y-auto rounded bg-white shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-[#e8e8e8] bg-white px-6 py-4">
              <div>
                <p className="text-xs text-[#999]">미리보기</p>
                <h2 className="text-lg font-semibold text-[#1a3151]">{subject || '(제목 없음)'}</h2>
              </div>
              <button
                type="button"
                onClick={handleClosePreview}
                className="rounded border border-[#ddd] px-3 py-1.5 text-sm text-[#666] hover:bg-[#f5f5f5]"
              >
                닫기 (ESC)
              </button>
            </div>
            <div
              className="board-preview px-6 py-6 text-sm text-[#333]"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </div>
      )}
    </main>
  );
}

export function emptyAdminPostInitial(): AdminPostInitial {
  return {
    subject: '',
    content: '',
    notice: false,
    datetimeLocal: defaultDatetimeLocal(),
    thumbnailUrl: '',
    seoTitle: '',
    seoSlug: '',
    seoDescription: '',
    attachment: null,
  };
}
