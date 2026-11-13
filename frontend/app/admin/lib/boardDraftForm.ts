import { sanitizeContentForSave } from './boardContentSanitize';
import type { BoardPostPayload } from './boardPostTypes';

export function readBoardDraftFields(draft: BoardPostPayload) {
  return {
    subject: draft.wr_subject,
    content: sanitizeContentForSave(draft.wr_content),
    schema: draft.wr_schema ?? '',
    notice: draft.notice,
    thumbnailUrl: draft.wr_1,
    seoTitle: draft.wr_seo_title,
    seoSlug: draft.wr_seo_slug,
    seoDescription: draft.wr_seo_description ?? '',
    wr7: draft.wr_7 ?? '',
    wr8: draft.wr_8 ?? '',
  };
}
