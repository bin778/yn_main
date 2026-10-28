import { createBoardSectionMetadata, createBoardSectionPage } from '../../lib/boardSectionPage';

export const revalidate = 3600;
export const metadata = createBoardSectionMetadata('column', 'family');
export default createBoardSectionPage('column', 'family');
