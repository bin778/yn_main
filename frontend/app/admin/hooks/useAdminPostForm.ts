'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';

import { createBoardPost, updateBoardPost, uploadBoardFile } from '@/app/(story)/lib/boardAdminApi';
import { stripHtmlForMetaDescription } from '@/app/(story)/lib/boardSeo';
import type { BoTable } from '@/app/(story)/types/board';

import { isPostFormDirty } from '../lib/adminPostFormDirty';
import type { AdminPostInitial } from '../lib/adminPostFormTypes';
import { buildBoardPostPayload } from '../lib/buildBoardPostPayload';
import { validateBoardAttachmentFile, validateBoardImageFile } from '../lib/boardAttachmentAccept';
import { saveBoardDraft } from '../lib/boardDraftStorage';
import {
  defaultDatetimeLocal,
  toDatetimeLocalValue,
  type BoardPostFile,
  type BoardPostPayload,
} from '../lib/boardPostTypes';
import { boardHtmlIsEmpty, sanitizeBoardHtml, sanitizeBoardHtmlForSave } from '../lib/sanitizeBoardHtml';
import { validateAttachmentPassword } from '../lib/validateAttachmentPassword';

type UseAdminPostFormOptions = {
  boTable: BoTable;
  mode: 'create' | 'edit';
  wrId?: number;
  initial: AdminPostInitial;
  onSaved: (wrId: number) => void;
  onDelete?: () => Promise<void>;
};

export function useAdminPostForm({ boTable, mode, wrId, initial, onSaved, onDelete }: UseAdminPostFormOptions) {
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

  const editorKey = `${mode}-${wrId ?? 'new'}-${initial.subject}`;

  const bodyDescriptionFallback = useMemo(() => stripHtmlForMetaDescription(content), [content]);
  const seoPreviewDescription = seoDescription.trim() || bodyDescriptionFallback;

  const isDirty = useMemo(
    () =>
      isPostFormDirty(initial, {
        subject,
        content,
        notice,
        datetimeLocal,
        thumbnailUrl,
        seoTitle,
        seoSlug,
        seoDescription,
        attachment,
        pendingAttachment,
        removeAttachment,
        attachmentPassword,
        clearAttachmentPassword,
      }),
    [
      initial,
      subject,
      content,
      notice,
      datetimeLocal,
      thumbnailUrl,
      seoTitle,
      seoSlug,
      seoDescription,
      attachment,
      pendingAttachment,
      removeAttachment,
      attachmentPassword,
      clearAttachmentPassword,
    ],
  );

  const handleClosePreview = useCallback(() => setShowPreview(false), []);

  useEffect(() => {
    if (!showPreview) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') handleClosePreview();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [showPreview, handleClosePreview]);

  const attachmentLabel = pendingAttachment?.name ?? attachment?.source ?? null;
  const hasThumbnail = thumbnailUrl !== '';
  const hasAttachment = attachmentLabel !== null && !removeAttachment;
  const attachmentHasPassword = attachment?.has_password === true && !removeAttachment;

  const attachmentHint = (() => {
    if (!hasAttachment || attachmentLabel === null) return null;
    if (mode === 'create' && pendingAttachment !== null) {
      return `저장 시 함께 업로드: ${pendingAttachment.name}`;
    }
    return `현재: ${attachmentLabel}`;
  })();

  function buildCurrentPayload(cleanedContent: string): BoardPostPayload {
    return buildBoardPostPayload(
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

  return {
    boTable,
    mode,
    wrId,
    editorKey,
    subject,
    setSubject,
    content,
    setContent,
    notice,
    setNotice,
    datetimeLocal,
    setDatetimeLocal,
    thumbnailUrl,
    setThumbnailUrl,
    seoTitle,
    setSeoTitle,
    seoSlug,
    setSeoSlug,
    seoDescription,
    setSeoDescription,
    showSlugInput,
    setShowSlugInput,
    attachmentPassword,
    setAttachmentPassword,
    clearAttachmentPassword,
    setClearAttachmentPassword,
    error,
    loading,
    draftRefreshKey,
    showPreview,
    setShowPreview,
    uploadingThumb,
    uploadingAttachment,
    isDirty,
    hasThumbnail,
    hasAttachment,
    attachmentHasPassword,
    attachmentHint,
    bodyDescriptionFallback,
    seoPreviewDescription,
    handleClosePreview,
    handleThumbnailFile,
    handleEditorImageUpload,
    handleSaveDraft,
    loadDraft,
    handleSubmit,
    handleDelete,
    handleAttachmentFile,
    handleRemoveAttachment,
  };
}

export type AdminPostFormState = ReturnType<typeof useAdminPostForm>;
