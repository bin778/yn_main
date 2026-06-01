'use client';

import { notFound, useParams, useRouter } from 'next/navigation';

import { createBoardPost } from '@/app/(story)/lib/boardAdminApi';
import type { BoTable } from '@/app/(story)/types/board';

import AdminPostForm from '../../components/AdminPostForm';
import { getAdminListPath, resolveAdminBoTable } from '../../lib/adminBoard';

type AdminWriteFormProps = {
  boTable: BoTable;
};

function AdminWriteForm({ boTable }: AdminWriteFormProps) {
  const router = useRouter();

  async function handleSubmit(subject: string, content: string) {
    const { wr_id: wrId } = await createBoardPost(boTable, subject, content);
    router.push(`${getAdminListPath(boTable)}${wrId}/`);
    router.refresh();
  }

  return <AdminPostForm boTable={boTable} mode="create" onSubmit={handleSubmit} />;
}

export default function AdminWritePage() {
  const params = useParams<{ bo_table: string }>();
  const boTable = resolveAdminBoTable(params.bo_table);

  if (boTable === null) {
    notFound();
  }

  return <AdminWriteForm boTable={boTable} />;
}
