import { getCachedBoardHtml } from '../lib/cachedBoardHtml';
import BoardContentMarkup from './BoardContentMarkup';

type Props = { html: string; className?: string; legacyLayout?: boolean };

export default async function CachedBoardContentBody({ html, ...props }: Props) {
  const safeHtml = await getCachedBoardHtml(html);
  return <BoardContentMarkup safeHtml={safeHtml} {...props} />;
}
