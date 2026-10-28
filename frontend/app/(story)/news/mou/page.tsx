import { createBoardSectionMetadata, createBoardSectionPage } from '../../lib/boardSectionPage';

export const revalidate = 3600;
export const metadata = createBoardSectionMetadata('news', 'mou');
export default createBoardSectionPage('news', 'mou');
