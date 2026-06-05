import type { AttachmentDownloadMode } from './buildBoardPostPayload';
import { defaultDatetimeLocal, type BoardPostFile } from './boardPostTypes';

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

export type PostFormSnapshot = {
  subject: string;
  content: string;
  notice: boolean;
  datetimeLocal: string;
  thumbnailUrl: string;
  seoTitle: string;
  seoSlug: string;
  seoDescription: string;
  attachment: BoardPostFile | null;
  pendingAttachment: File | null;
  removeAttachment: boolean;
  attachmentPassword: string;
  downloadMode: AttachmentDownloadMode;
};

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
