import { toMysqlDatetime, type BoardPostPayload } from './boardPostTypes';

export type AttachmentDownloadMode = 'public' | 'password';

type BoardPostFormFields = {
  subject: string;
  content: string;
  notice: boolean;
  thumbnailUrl: string;
  seoTitle: string;
  seoSlug: string;
  seoDescription: string;
  schema: string;
  removeAttachment: boolean;
  attachmentPassword: string;
  downloadMode: AttachmentDownloadMode;
  attachmentHasPassword: boolean;
  wr7: string;
  wr8: string;
};

export function buildBoardPostPayload(
  fields: BoardPostFormFields,
  wrDatetime: string,
  options?: { scheduled?: boolean },
): BoardPostPayload {
  const {
    subject,
    content,
    notice,
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
  } = fields;
  const payload: BoardPostPayload = {
    wr_subject: subject.trim(),
    wr_content: content,
    notice,
    wr_datetime: toMysqlDatetime(wrDatetime),
    wr_1: thumbnailUrl.trim(),
    wr_seo_title: seoTitle.trim(),
    wr_seo_slug: seoSlug.trim(),
    wr_seo_description: seoDescription.trim(),
    wr_schema: schema.trim(),
    wr_7: wr7.trim(),
    wr_8: wr8.trim(),
    remove_attachment: removeAttachment,
  };

  if (options?.scheduled === true) {
    payload.scheduled = true;
  }

  if (!removeAttachment) {
    if (downloadMode === 'public' && attachmentHasPassword) {
      payload.clear_attachment_password = true;
    } else if (downloadMode === 'password' && attachmentPassword.trim() !== '') {
      payload.attachment_password = attachmentPassword.trim();
    }
  }

  return payload;
}
