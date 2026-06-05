import type { AttachmentDownloadMode } from '../../lib/buildBoardPostPayload';
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
  downloadMode: AttachmentDownloadMode;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
  onPasswordChange: (value: string) => void;
  onDownloadModeChange: (mode: AttachmentDownloadMode) => void;
};

export default function AdminPostAttachmentSection({
  loading,
  uploadingAttachment,
  hasAttachment,
  attachmentHint,
  attachmentPassword,
  attachmentHasPassword,
  downloadMode,
  onFileSelect,
  onRemove,
  onPasswordChange,
  onDownloadModeChange,
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
        <div className="mt-3 space-y-3">
          <fieldset>
            <legend className="text-sm font-medium text-[#333]">다운로드 방식</legend>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-[#555]">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="attachment-download-mode"
                  checked={downloadMode === 'public'}
                  onChange={() => onDownloadModeChange('public')}
                  disabled={loading || uploadingAttachment}
                />
                공개 다운로드
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="attachment-download-mode"
                  checked={downloadMode === 'password'}
                  onChange={() => onDownloadModeChange('password')}
                  disabled={loading || uploadingAttachment}
                />
                비밀번호 보호
              </label>
            </div>
          </fieldset>

          {downloadMode === 'public' && attachmentHasPassword && (
            <p className="rounded border border-[#f0e6c8] bg-[#fffbeb] px-3 py-2 text-xs text-[#7a5b00]">
              저장하면 기존 다운로드 비밀번호가 제거되고 누구나 다운로드할 수 있습니다.
            </p>
          )}

          {downloadMode === 'password' && (
            <div>
              <label className="block text-sm font-medium text-[#333]" htmlFor="attachment-password">
                다운로드 비밀번호
              </label>
              <input
                id="attachment-password"
                type="password"
                value={attachmentPassword}
                onChange={event => onPasswordChange(event.target.value)}
                placeholder={`${BOARD_ATTACHMENT_PASSWORD_MIN}~${BOARD_ATTACHMENT_PASSWORD_MAX}자`}
                autoComplete="new-password"
                disabled={loading || uploadingAttachment}
                className="mt-1 w-full border border-[#ddd] px-3 py-2 text-sm disabled:bg-[#f5f5f5]"
              />
              {attachmentHasPassword && attachmentPassword === '' && (
                <p className="mt-1 text-xs text-[#888]">
                  비밀번호가 이미 설정되어 있습니다. 변경하려면 새 비밀번호를 입력하세요.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
