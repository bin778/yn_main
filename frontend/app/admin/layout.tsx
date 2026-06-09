import type { Metadata } from 'next';

import '../board-content.css';

import AdminLayoutClient from './components/AdminLayoutClient';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
