import { createBoardSectionMetadata, createBoardSectionPage } from '../../lib/boardSectionPage';

export const revalidate = 3600;
export const metadata = createBoardSectionMetadata('column', 'overseas-dispute');
export default createBoardSectionPage('column', 'overseas-dispute');
