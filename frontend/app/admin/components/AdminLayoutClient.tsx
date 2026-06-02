'use client';

import { usePathname } from 'next/navigation';

import AdminShell from './AdminShell';

type AdminLayoutClientProps = {
  children: React.ReactNode;
};

export default function AdminLayoutClient({ children }: AdminLayoutClientProps) {
  const pathname = usePathname();

  if (pathname.startsWith('/admin/login')) {
    return <>{children}</>;
  }

  return <AdminShell>{children}</AdminShell>;
}
