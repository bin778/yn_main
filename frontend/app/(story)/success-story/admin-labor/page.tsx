import { createBoardSectionMetadata, createBoardSectionPage } from '../../lib/boardSectionPage';

export const revalidate = 3600;
export const metadata = createBoardSectionMetadata('success', 'admin-labor');
export default createBoardSectionPage('success', 'admin-labor');
