/** Next.js 게시판 관리자 로그인 (JWT). 구 /board/bbs/login.php 대신 사용. */
export const ADMIN_LOGIN_PATH = '/admin/login/';

export function buildAdminLoginUrl(returnPath = '/news/'): string {
  const params = new URLSearchParams({ url: returnPath });
  return `${ADMIN_LOGIN_PATH}?${params.toString()}`;
}
