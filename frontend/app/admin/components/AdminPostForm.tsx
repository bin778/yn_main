'use client';

import { useRouter } from 'next/navigation';

import { BOARD_META } from '@/app/(story)/constants/boardContent';
import type { BoTable } from '@/app/(story)/types/board';

import { getAdminListPath } from '../lib/adminBoard';
import { emptyAdminPostInitial, type AdminPostInitial } from '../lib/adminPostFormTypes';
import { handleAdminPostCancel, useAdminPostLeaveGuard } from '../hooks/useAdminPostLeaveGuard';
import { useAdminPostForm, type PublishMode } from '../hooks/useAdminPostForm';

import AdminPostAttachmentSection from './admin-post-form/AdminPostAttachmentSection';
import AdminPostFormActions from './admin-post-form/AdminPostFormActions';
import AdminPostPreviewModal from './admin-post-form/AdminPostPreviewModal';
import AdminPostSeoSection from './admin-post-form/AdminPostSeoSection';
import AdminPostThumbnailSection from './admin-post-form/AdminPostThumbnailSection';
import SchedulePublishModal from './admin-post-form/SchedulePublishModal';
import ScheduledPostBanner from './admin-post-form/ScheduledPostBanner';
import BoardRichEditor from './BoardRichEditor';
import PostDraftPanel from './PostDraftPanel';

export type { AdminPostInitial, PublishMode };
export { emptyAdminPostInitial };

type AdminPostFormProps = {
  boTable: BoTable;
  mode: 'create' | 'edit';
  wrId?: number;
  initial: AdminPostInitial;
  onSaved: (wrId: number, publishMode: PublishMode) => void;
  onDelete?: () => Promise<void>;
};

export default function AdminPostForm({ boTable, mode, wrId, initial, onSaved, onDelete }: AdminPostFormProps) {
  const router = useRouter();
  const listPath = getAdminListPath(boTable);
  const meta = BOARD_META[boTable];

  const form = useAdminPostForm({ boTable, mode, wrId, initial, onSaved, onDelete });

  useAdminPostLeaveGuard(form.isDirty);

  function handleCancel() {
    handleAdminPostCancel(form.isDirty, () => router.push(listPath));
  }

  return (
    <main className="mx-auto max-w-[900px] px-4 py-10 md:px-6">
      <p className="mb-1 text-sm text-[#666]">{meta.label}</p>
      <h1 className="mb-6 text-2xl font-semibold text-[#1a3151]">
        {mode === 'create' ? '글쓰기' : '글 수정'}
        {mode === 'edit' && wrId !== undefined ? ` #${wrId}` : ''}
      </h1>

      {form.isScheduled && (
        <ScheduledPostBanner
          wrDatetime={form.scheduledAt}
          loading={form.loading}
          onCancelSchedule={() => void form.handleCancelSchedule()}
        />
      )}

      <form onSubmit={form.handleSubmit} className="space-y-5 border border-[#e8e8e8] bg-white p-6">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-[#333]">
            <input
              type="checkbox"
              checked={form.notice}
              onChange={event => form.setNotice(event.target.checked)}
              disabled={form.loading}
              className="h-4 w-4 cursor-pointer disabled:cursor-not-allowed"
            />
            공지
          </label>
          <p className="ml-auto text-xs text-[#999]">
            <span className="text-[#b42318] font-bold">*</span> 필수 입력
          </p>
          <div className="flex items-center gap-2">
            <PostDraftPanel boTable={boTable} onLoad={form.loadDraft} refreshKey={form.draftRefreshKey} />
            <button
              type="button"
              disabled={form.loading}
              onClick={form.handleSaveDraft}
              className="cursor-pointer rounded bg-[#f0f2f5] px-3 py-1.5 text-sm font-medium text-[#333] hover:bg-[#e4e7ec] disabled:cursor-not-allowed disabled:opacity-60"
            >
              임시 저장
            </button>
          </div>
        </div>

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
            value={form.subject}
            onChange={event => form.setSubject(event.target.value)}
            className="w-full border border-[#ddd] px-3 py-2 text-sm focus:border-[#1a3151] focus:outline-none"
          />
        </div>

        <AdminPostSeoSection
          boTable={boTable}
          wrId={wrId}
          subject={form.subject}
          seoTitle={form.seoTitle}
          seoSlug={form.seoSlug}
          seoDescription={form.seoDescription}
          showSlugInput={form.showSlugInput}
          bodyDescriptionFallback={form.bodyDescriptionFallback}
          seoPreviewDescription={form.seoPreviewDescription}
          onSeoTitleChange={form.setSeoTitle}
          onSeoDescriptionChange={form.setSeoDescription}
          onSeoSlugChange={form.setSeoSlug}
          onShowSlugInput={() => form.setShowSlugInput(true)}
          onResetSlug={() => {
            form.setSeoSlug('');
            form.setShowSlugInput(false);
          }}
        />

        <AdminPostThumbnailSection
          thumbnailUrl={form.thumbnailUrl}
          hasThumbnail={form.hasThumbnail}
          loading={form.loading}
          uploadingThumb={form.uploadingThumb}
          onFileSelect={file => void form.handleThumbnailFile(file)}
          onRemove={() => form.setThumbnailUrl('')}
        />

        <div>
          <span className="mb-1 flex items-center gap-1 text-sm font-medium">
            내용{' '}
            <span className="text-[#b42318]" aria-hidden>
              *
            </span>
          </span>
          <BoardRichEditor
            key={form.editorKey}
            value={form.content}
            onChange={form.setContent}
            disabled={form.loading}
            onUploadImage={form.handleEditorImageUpload}
          />
        </div>

        <AdminPostAttachmentSection
          loading={form.loading}
          uploadingAttachment={form.uploadingAttachment}
          hasAttachment={form.hasAttachment}
          attachmentHint={form.attachmentHint}
          attachmentPassword={form.attachmentPassword}
          attachmentHasPassword={form.attachmentHasPassword}
          downloadMode={form.downloadMode}
          onFileSelect={form.handleAttachmentFile}
          onRemove={form.handleRemoveAttachment}
          onPasswordChange={form.setAttachmentPassword}
          onDownloadModeChange={form.handleDownloadModeChange}
        />

        {form.error !== null && (
          <p className="text-sm text-[#b42318]" role="alert">
            {form.error}
          </p>
        )}

        <AdminPostFormActions
          loading={form.loading}
          mode={mode}
          showDelete={onDelete !== undefined && !form.isScheduled}
          onPreview={() => form.setShowPreview(true)}
          onCancel={handleCancel}
          onDelete={() => void form.handleDelete()}
          onScheduleClick={() => form.setShowScheduleModal(true)}
        />
      </form>

      {form.showScheduleModal && (
        <SchedulePublishModal
          loading={form.loading}
          onClose={() => form.setShowScheduleModal(false)}
          onConfirm={scheduledLocal => void form.handleScheduleSubmit(scheduledLocal)}
        />
      )}

      {form.showPreview && (
        <AdminPostPreviewModal subject={form.subject} content={form.content} onClose={form.handleClosePreview} />
      )}
    </main>
  );
}
