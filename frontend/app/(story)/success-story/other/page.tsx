import { createBoardSectionMetadata, createBoardSectionPage } from '../../lib/boardSectionPage';

export const revalidate = 3600;
export const metadata = createBoardSectionMetadata('success', 'other');
export default createBoardSectionPage('success', 'other');
