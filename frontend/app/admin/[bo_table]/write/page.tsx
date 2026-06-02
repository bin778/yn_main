'use client';

import { notFound, useParams, useRouter } from 'next/navigation';

import type { BoTable } from '@/app/(story)/types/board';

import AdminPostForm, { emptyAdminPostInitial } from '../../components/AdminPostForm';
import { getAdminListPath, resolveAdminBoTable } from '../../lib/adminBoard';

type AdminWriteFormProps = {
  boTable: BoTable;
};

function AdminWriteForm({ boTable }: AdminWriteFormProps) {
  const router = useRouter();

  return (
    <AdminPostForm
      boTable={boTable}
      mode="create"
      initial={emptyAdminPostInitial()}
      onSaved={wrId => {
        router.push(`${getAdminListPath(boTable)}${wrId}/`);
        router.refresh();
      }}
    />
  );
}

export default function AdminWritePage() {
  const params = useParams<{ bo_table: string }>();
  const boTable = resolveAdminBoTable(params.bo_table);

  if (boTable === null) {
    notFound();
  }

  return <AdminWriteForm boTable={boTable} />;
}
