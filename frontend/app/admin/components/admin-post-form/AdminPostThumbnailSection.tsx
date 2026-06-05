import Image from 'next/image';

import { BOARD_IMAGE_ACCEPT, BOARD_IMAGE_HINT } from '../../lib/boardAttachmentAccept';
import FilePickerField from '../FilePickerField';

type AdminPostThumbnailSectionProps = {
  thumbnailUrl: string;
  hasThumbnail: boolean;
  loading: boolean;
  uploadingThumb: boolean;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
};

export default function AdminPostThumbnailSection({
  thumbnailUrl,
  hasThumbnail,
  loading,
  uploadingThumb,
  onFileSelect,
  onRemove,
}: AdminPostThumbnailSectionProps) {
  return (
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
          onFileSelect={onFileSelect}
          onRemove={onRemove}
        />
      </div>
    </div>
  );
}
