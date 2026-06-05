import { BOARD_ATTACHMENT_PASSWORD_MAX, BOARD_ATTACHMENT_PASSWORD_MIN } from './boardPostTypes';

export function validateAttachmentPassword(password: string): string | null {
  const trimmed = password.trim();
  if (trimmed === '') return null;
  if (trimmed.length < BOARD_ATTACHMENT_PASSWORD_MIN || trimmed.length > BOARD_ATTACHMENT_PASSWORD_MAX) {
    return `다운로드 비밀번호는 ${BOARD_ATTACHMENT_PASSWORD_MIN}~${BOARD_ATTACHMENT_PASSWORD_MAX}자여야 합니다.`;
  }
  return null;
}
