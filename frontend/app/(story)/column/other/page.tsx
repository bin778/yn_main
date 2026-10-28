import { createBoardSectionMetadata, createBoardSectionPage } from '../../lib/boardSectionPage';

export const revalidate = 3600;
export const metadata = createBoardSectionMetadata('column', 'other');
export default createBoardSectionPage('column', 'other');
