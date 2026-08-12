'use client';

import type { FormEvent } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { EDITOR_CONTENT_DEBOUNCE_MS } from '../components/board-editor/constants';

import { validateBoardSectionSelection } from '@/app/(story)/constants/boardSections';
import {
  createBoardPost,
  revalidateBoardPost,
  updateBoardPost,
  uploadBoardFile,
} from '@/app/(story)/lib/boardAdminApi';
import { stripHtmlForMetaDescription } from '@/app/(story)/lib/boardSeo';
import type { BoTable } from '@/app/(story)/types/board';

import { isPostFormDirty } from '../lib/adminPostFormDirty';
import type { AdminPostInitial } from '../lib/adminPostFormTypes';
import { buildBoardPostPayload, type AttachmentDownloadMode } from '../lib/buildBoardPostPayload';
import { validateBoardAttachmentFile, validateBoardImageFile } from '../lib/boardAttachmentAccept';
import { saveBoardDraft } from '../lib/boardDraftStorage';
import {
  defaultDatetimeLocal,
  formatScheduledDatetime,
  isScheduledPost,
  toDatetimeLocalValue,
  validateFutureDatetime,
  type BoardPostFile,
  type BoardPostPayload,
} from '../lib/boardPostTypes';
import { contentIsEmpty, sanitizeContentForEditor, sanitizeContentForSave } from '../lib/boardContentSanitize';
import { validateAttachmentPassword } from '../lib/validateAttachmentPassword';

export type PublishMode = 'now' | 'scheduled';

type UseAdminPostFormOptions = {
  boTable: BoTable;
  mode: 'create' | 'edit';
  wrId?: number;
  initial: AdminPostInitial;
  onSaved: (wrId: number, publishMode: PublishMode, seoSlug: string) => void;
  onDelete?: () => Promise<void>;
};

export function useAdminPostForm({ boTable, mode, wrId, initial, onSaved, onDelete }: UseAdminPostFormOptions) {
  const initialContent = sanitizeContentForEditor(initial.content);
  const [subject, setSubject] = useState(initial.subject);
  const [content, setContent] = useState(initialContent);
  const [contentVersion, setContentVersion] = useState(0);
  const contentRef = useRef(initialContent);
  const contentDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [schema, setSchema] = useState(initial.schema);
  const [wr7, setWr7] = useState(initial.wr_7);
  const [wr8, setWr8] = useState(initial.wr_8);
  const [notice, setNotice] = useState(initial.notice);
  const [thumbnailUrl, setThumbnailUrl] = useState(initial.thumbnailUrl);
  const [seoTitle, setSeoTitle] = useState(initial.seoTitle);
  const [seoSlug, setSeoSlug] = useState(initial.seoSlug);
  const [seoDescription, setSeoDescription] = useState(initial.seoDescription);
  const [showSlugInput, setShowSlugInput] = useState(initial.seoSlug !== '');
  const [attachment, setAttachment] = useState<BoardPostFile | null>(initial.attachment);
  const [pendingAttachment, setPendingAttachment] = useState<File | null>(null);
  const [removeAttachment, setRemoveAttachment] = useState(false);
  const [attachmentPassword, setAttachmentPassword] = useState('');
  const [downloadMode, setDownloadMode] = useState<AttachmentDownloadMode>(
    initial.attachment?.has_password === true ? 'password' : 'public',
  );
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [draftRefreshKey, setDraftRefreshKey] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const editorKey = `${mode}-${wrId ?? 'new'}-${initial.subject}`;
  const isScheduled = isScheduledPost(initial.wrDatetime);

  const flushDebouncedContent = useCallback(() => {
    if (contentDebounceRef.current !== null) {
      clearTimeout(contentDebounceRef.current);
      contentDebounceRef.current = null;
      setContent(contentRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (contentDebounceRef.current !== null) {
        clearTimeout(contentDebounceRef.current);
      }
    };
  }, []);

  const bodyDescriptionFallback = useMemo(() => stripHtmlForMetaDescription(content), [content]);
  const seoPreviewDescription = seoDescription.trim() || bodyDescriptionFallback;

  const isDirty = useMemo(
    () =>
      isPostFormDirty(initial, {
        subject,
        content,
        notice,
        thumbnailUrl,
        seoTitle,
        seoSlug,
        seoDescription,
        schema,
        wr_7: wr7,
        wr_8: wr8,
        attachment,
        pendingAttachment,
        removeAttachment,
        attachmentPassword,
        downloadMode,
      }),
    [
      initial,
      subject,
      content,
      notice,
      thumbnailUrl,
      seoTitle,
      seoSlug,
      seoDescription,
      schema,
      wr7,
      wr8,
      attachment,
      pendingAttachment,
      removeAttachment,
      attachmentPassword,
      downloadMode,
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

  function validateBeforeSubmit(): string | null {
    const sectionError = validateBoardSectionSelection(boTable, wr7, wr8);
    if (sectionError !== null) return sectionError;

    if (contentIsEmpty(contentRef.current)) {
      return '내용을 입력해 주세요.';
    }

    if (downloadMode === 'password') {
      const passwordError = validateAttachmentPassword(attachmentPassword);
      if (passwordError !== null) return passwordError;
      if (attachmentPassword.trim() === '' && !attachmentHasPassword) {
        return '비밀번호 보호를 선택했으면 다운로드 비밀번호를 입력해 주세요.';
      }
    }

    return null;
  }

  async function submitPost(publishMode: PublishMode, scheduledLocal?: string) {
    flushDebouncedContent();
    const validationError = validateBeforeSubmit();
    if (validationError !== null) {
      setError(validationError);
      return;
    }

    if (publishMode === 'scheduled') {
      const scheduleError = validateFutureDatetime(scheduledLocal ?? '');
      if (scheduleError !== null) {
        setError(scheduleError);
        return;
      }
    }

    const cleanedContent = sanitizeContentForSave(contentRef.current);
    const cleanedSchema = schema.trim();
    const wrDatetimeLocal =
      publishMode === 'scheduled'
        ? (scheduledLocal ?? '')
        : mode === 'edit'
          ? toDatetimeLocalValue(initial.wrDatetime) || initial.wrDatetime
          : defaultDatetimeLocal();

    const payload = buildBoardPostPayload(
      subject,
      cleanedContent,
      notice,
      wrDatetimeLocal,
      thumbnailUrl,
      seoTitle,
      seoSlug,
      seoDescription,
      cleanedSchema,
      removeAttachment,
      attachmentPassword,
      downloadMode,
      attachmentHasPassword,
      wr7,
      wr8,
      publishMode === 'scheduled' ? { scheduled: true } : undefined,
    );

    setLoading(true);
    setError(null);

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
        const passwordForUpload = downloadMode === 'password' ? attachmentPassword : '';
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
        setDownloadMode(uploaded.has_password ? 'password' : 'public');
      }

      await revalidateBoardPost(boTable, savedId, payload.wr_seo_slug);

      if (publishMode === 'scheduled') {
        window.alert(
          `${formatScheduledDatetime(payload.wr_datetime)}에 발행 예정입니다.\n발행 시각 이후 목록에 표시됩니다.`,
        );
      }

      setShowScheduleModal(false);
      onSaved(savedId, publishMode, payload.wr_seo_slug);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '저장에 실패했습니다.');
      setPendingAttachment(null);
      setLoading(false);
    }
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
    flushDebouncedContent();
    const cleaned = sanitizeContentForSave(contentRef.current);
    saveBoardDraft(
      boTable,
      buildBoardPostPayload(
        subject,
        cleaned,
        notice,
        '',
        thumbnailUrl,
        seoTitle,
        seoSlug,
        seoDescription,
        schema,
        removeAttachment,
        attachmentPassword,
        downloadMode,
        attachmentHasPassword,
        wr7,
        wr8,
      ),
    );
    setDraftRefreshKey(key => key + 1);
    window.alert('임시 저장되었습니다.');
  }

  function loadDraft(draft: BoardPostPayload & { preview: string }) {
    if (contentDebounceRef.current !== null) {
      clearTimeout(contentDebounceRef.current);
      contentDebounceRef.current = null;
    }

    const draftContent = sanitizeContentForSave(draft.wr_content);
    contentRef.current = draftContent;
    setSubject(draft.wr_subject);
    setContent(draftContent);
    setContentVersion(version => version + 1);
    setSchema(draft.wr_schema ?? '');
    setNotice(draft.notice);
    setThumbnailUrl(draft.wr_1);
    setSeoTitle(draft.wr_seo_title);
    setSeoSlug(draft.wr_seo_slug);
    setSeoDescription(draft.wr_seo_description ?? '');
    setWr7(draft.wr_7 ?? '');
    setWr8(draft.wr_8 ?? '');
    if (draft.wr_seo_slug !== '') setShowSlugInput(true);
    setPendingAttachment(null);
    setRemoveAttachment(false);
  }

  const syncContent = useCallback((html: string) => {
    if (contentDebounceRef.current !== null) {
      clearTimeout(contentDebounceRef.current);
      contentDebounceRef.current = null;
    }
    contentRef.current = html;
    setContent(html);
  }, []);

  const handleContentChange = useCallback((html: string) => {
    contentRef.current = html;

    if (contentDebounceRef.current !== null) {
      clearTimeout(contentDebounceRef.current);
    }

    contentDebounceRef.current = setTimeout(() => {
      setContent(html);
      contentDebounceRef.current = null;
    }, EDITOR_CONTENT_DEBOUNCE_MS);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    await submitPost('now');
  }

  async function handleScheduleSubmit(scheduledLocal: string) {
    setError(null);
    await submitPost('scheduled', scheduledLocal);
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

  async function handleCancelSchedule() {
    if (onDelete === undefined) return;
    if (!window.confirm('정말 예약을 취소하고 글을 삭제하시겠습니까?')) return;

    setError(null);
    setLoading(true);

    try {
      await onDelete();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : '예약 취소에 실패했습니다.');
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

    if (downloadMode === 'password') {
      const passwordError = validateAttachmentPassword(attachmentPassword);
      if (passwordError !== null) {
        setError(passwordError);
        return;
      }
      if (attachmentPassword.trim() === '' && !attachmentHasPassword) {
        setError('비밀번호 보호를 선택했으면 다운로드 비밀번호를 입력해 주세요.');
        return;
      }
    }

    if (mode === 'edit' && wrId !== undefined && wrId > 0) {
      setUploadingAttachment(true);
      setError(null);
      const passwordForUpload = downloadMode === 'password' ? attachmentPassword : '';
      uploadBoardFile(boTable, file, 'attachment', wrId, passwordForUpload)
        .then(async uploaded => {
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
          setDownloadMode(uploaded.has_password ? 'password' : 'public');
          await revalidateBoardPost(boTable, wrId, seoSlug);
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
    setDownloadMode('public');
  }

  function handleDownloadModeChange(nextMode: AttachmentDownloadMode) {
    setDownloadMode(nextMode);
    if (nextMode === 'public') {
      setAttachmentPassword('');
    }
  }

  function handleCategoryChange(nextCategory: string) {
    setWr7(nextCategory);
    setWr8('');
  }

  return {
    boTable,
    mode,
    wrId,
    editorKey,
    contentVersion,
    flushDebouncedContent,
    subject,
    setSubject,
    content,
    handleContentChange,
    syncContent,
    notice,
    setNotice,
    thumbnailUrl,
    setThumbnailUrl,
    seoTitle,
    setSeoTitle,
    seoSlug,
    setSeoSlug,
    seoDescription,
    setSeoDescription,
    wr7,
    wr8,
    handleCategoryChange,
    setWr8,
    showSlugInput,
    setShowSlugInput,
    attachmentPassword,
    setAttachmentPassword,
    downloadMode,
    handleDownloadModeChange,
    error,
    loading,
    draftRefreshKey,
    showPreview,
    setShowPreview,
    showScheduleModal,
    setShowScheduleModal,
    uploadingThumb,
    uploadingAttachment,
    isDirty,
    isScheduled,
    scheduledAt: initial.wrDatetime,
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
    handleScheduleSubmit,
    handleDelete,
    handleCancelSchedule,
    handleAttachmentFile,
    handleRemoveAttachment,
  };
}

export type AdminPostFormState = ReturnType<typeof useAdminPostForm>;
