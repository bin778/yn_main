import { sanitizeLegacyBoardHtml } from '../admin/lib/sanitizeLegacyBoardHtml';
import BoardContentMarkup from './BoardContentMarkup';

type BoardContentBodyProps = {
  html: string;
  className?: string;
  legacyLayout?: boolean;
};

/** 관리자 미리보기의 동기 정제. 공개 본문은 CachedBoardContentBody를 사용한다. */
export default function BoardContentBody({ html, className = '', legacyLayout = false }: BoardContentBodyProps) {
  const safeHtml = sanitizeLegacyBoardHtml(html);
  return <BoardContentMarkup safeHtml={safeHtml} className={className} legacyLayout={legacyLayout} />;
}
