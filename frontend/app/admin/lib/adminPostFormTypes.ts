import type { AttachmentDownloadMode } from './buildBoardPostPayload';
import type { BoardPostFile } from './boardPostTypes';

export type AdminPostInitial = {
  subject: string;
  content: string;
  notice: boolean;
  wrDatetime: string;
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
    wrDatetime: '',
    thumbnailUrl: '',
    seoTitle: '',
    seoSlug: '',
    seoDescription: '',
    attachment: null,
  };
}
