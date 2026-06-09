import { sanitizeContentForSave } from './boardContentSanitize';

import type { AdminPostInitial, PostFormSnapshot } from './adminPostFormTypes';

export const LEAVE_CONFIRM_MESSAGE =
  '작성 중인 내용이 저장되지 않습니다.\n이 페이지를 나가면 입력한 내용이 사라집니다.';

export function confirmLeave(): boolean {
  return window.confirm(LEAVE_CONFIRM_MESSAGE);
}

export function isPostFormDirty(initial: AdminPostInitial, current: PostFormSnapshot): boolean {
  if (current.subject !== initial.subject) return true;
  if (
    sanitizeContentForSave(current.content, current.contentMode) !==
    sanitizeContentForSave(initial.content, initial.contentMode)
  ) {
    return true;
  }
  if (current.notice !== initial.notice) return true;
  if (current.thumbnailUrl !== initial.thumbnailUrl) return true;
  if (current.seoTitle !== initial.seoTitle) return true;
  if (current.seoSlug !== initial.seoSlug) return true;
  if (current.seoDescription !== initial.seoDescription) return true;
  if (current.schema !== initial.schema) return true;
  if (current.contentMode !== initial.contentMode) return true;
  if (current.pendingAttachment !== null) return true;
  if (current.removeAttachment) return true;
  if (current.attachmentPassword.trim() !== '') return true;

  const initialDownloadMode = initial.attachment?.has_password === true ? 'password' : 'public';
  if (current.downloadMode !== initialDownloadMode) return true;

  const initialAttachmentSource = initial.attachment?.source ?? null;
  const currentAttachmentSource = current.removeAttachment ? null : (current.attachment?.source ?? null);
  if (initialAttachmentSource !== currentAttachmentSource) return true;

  return false;
}
