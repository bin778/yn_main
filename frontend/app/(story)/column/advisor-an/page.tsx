import { createBoardSectionMetadata, createBoardSectionPage } from '../../lib/boardSectionPage';

export const revalidate = 3600;
export const metadata = createBoardSectionMetadata('column', 'advisor-an');
export default createBoardSectionPage('column', 'advisor-an');
