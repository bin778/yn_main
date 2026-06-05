import { BOARD_ATTACHMENT_ACCEPT, BOARD_ATTACHMENT_HINT } from '../../lib/boardAttachmentAccept';
import { BOARD_ATTACHMENT_PASSWORD_MAX, BOARD_ATTACHMENT_PASSWORD_MIN } from '../../lib/boardPostTypes';
import FilePickerField from '../FilePickerField';

type AdminPostAttachmentSectionProps = {
  loading: boolean;
  uploadingAttachment: boolean;
  hasAttachment: boolean;
  attachmentHint: string | null;
  attachmentPassword: string;
  attachmentHasPassword: boolean;
  clearAttachmentPassword: boolean;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
  onPasswordChange: (value: string) => void;
  onClearPasswordToggle: (checked: boolean) => void;
};

export default function AdminPostAttachmentSection({
  loading,
  uploadingAttachment,
  hasAttachment,
  attachmentHint,
  attachmentPassword,
  attachmentHasPassword,
  clearAttachmentPassword,
  onFileSelect,
  onRemove,
  onPasswordChange,
  onClearPasswordToggle,
}: AdminPostAttachmentSectionProps) {
  return (
    <div>
      <span className="mb-1 block text-sm font-medium">
        파일 첨부 (1개) <span className="text-xs font-normal text-[#999]">({BOARD_ATTACHMENT_HINT})</span>
      </span>
      <FilePickerField
        accept={BOARD_ATTACHMENT_ACCEPT}
        uploadLabel="파일 첨부"
        changeLabel="파일 변경"
        removeLabel="첨부 제거"
        busyLabel="첨부 업로드 중…"
        disabled={loading || uploadingAttachment}
        busy={uploadingAttachment}
        hasSelection={hasAttachment}
        hint={attachmentHint}
        onFileSelect={onFileSelect}
        onRemove={onRemove}
      />
      {hasAttachment && (
        <div className="mt-3 space-y-2">
          <label className="block text-sm font-medium text-[#333]" htmlFor="attachment-password">
            다운로드 비밀번호 <span className="text-xs font-normal text-[#999]">(선택)</span>
          </label>
          <input
            id="attachment-password"
            type="password"
            value={attachmentPassword}
            onChange={event => onPasswordChange(event.target.value)}
            placeholder={`${BOARD_ATTACHMENT_PASSWORD_MIN}~${BOARD_ATTACHMENT_PASSWORD_MAX}자, 미입력 시 공개 다운로드`}
            autoComplete="new-password"
            disabled={loading || uploadingAttachment || clearAttachmentPassword}
            className="w-full border border-[#ddd] px-3 py-2 text-sm disabled:bg-[#f5f5f5]"
          />
          {attachmentHasPassword && (
            <label className="flex items-center gap-2 text-sm text-[#555]">
              <input
                type="checkbox"
                checked={clearAttachmentPassword}
                onChange={event => onClearPasswordToggle(event.target.checked)}
                disabled={loading || uploadingAttachment}
              />
              기존 비밀번호 제거 (공개 다운로드로 변경)
            </label>
          )}
          {attachmentHasPassword && !clearAttachmentPassword && attachmentPassword === '' && (
            <p className="text-xs text-[#888]">비밀번호가 설정되어 있습니다. 변경하려면 새 비밀번호를 입력하세요.</p>
          )}
        </div>
      )}
    </div>
  );
}
