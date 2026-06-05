import { toMysqlDatetime, type BoardPostPayload } from './boardPostTypes';

export type AttachmentDownloadMode = 'public' | 'password';

export function buildBoardPostPayload(
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
  downloadMode: AttachmentDownloadMode,
  attachmentHasPassword: boolean,
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
    if (downloadMode === 'public' && attachmentHasPassword) {
      payload.clear_attachment_password = true;
    } else if (downloadMode === 'password' && attachmentPassword.trim() !== '') {
      payload.attachment_password = attachmentPassword.trim();
    }
  }

  return payload;
}
