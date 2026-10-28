import { createBoardSectionMetadata, createBoardSectionPage } from '../../lib/boardSectionPage';

export const revalidate = 3600;
export const metadata = createBoardSectionMetadata('news', 'newsletter');
export default createBoardSectionPage('news', 'newsletter');
