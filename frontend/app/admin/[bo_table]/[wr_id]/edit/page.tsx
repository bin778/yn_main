'use client';

import { notFound, useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { fetchBoardView } from '@/app/(story)/lib/boardApi';
import { deleteBoardPost, updateBoardPost } from '@/app/(story)/lib/boardAdminApi';
import type { BoTable } from '@/app/(story)/types/board';

import AdminPostForm from '../../../components/AdminPostForm';
import { getAdminListPath, resolveAdminBoTable } from '../../../lib/adminBoard';

type AdminEditFormProps = {
  boTable: BoTable;
  wrId: number;
};

function AdminEditForm({ boTable, wrId }: AdminEditFormProps) {
  const router = useRouter();
  const [initialSubject, setInitialSubject] = useState('');
  const [initialContent, setInitialContent] = useState('');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetchBoardView(boTable, wrId)
      .then(view => {
        if (!cancelled) {
          setInitialSubject(view.wr_subject);
          setInitialContent(view.wr_content);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError('게시물을 불러오지 못했습니다.');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [boTable, wrId]);

  async function handleSubmit(subject: string, content: string) {
    await updateBoardPost(boTable, wrId, subject, content);
    router.push(`${getAdminListPath(boTable)}${wrId}/`);
    router.refresh();
  }

  async function handleDelete() {
    await deleteBoardPost(boTable, wrId);
    router.push(getAdminListPath(boTable));
    router.refresh();
  }

  if (loading) {
    return <main className="mx-auto max-w-[900px] px-4 py-10 text-sm text-[#666] md:px-6">불러오는 중…</main>;
  }

  if (loadError !== null) {
    return <main className="mx-auto max-w-[900px] px-4 py-10 text-sm text-[#b42318] md:px-6">{loadError}</main>;
  }

  return (
    <AdminPostForm
      key={`edit-${wrId}-${initialSubject}`}
      boTable={boTable}
      mode="edit"
      wrId={wrId}
      initialSubject={initialSubject}
      initialContent={initialContent}
      onSubmit={handleSubmit}
      onDelete={handleDelete}
    />
  );
}

export default function AdminEditPage() {
  const params = useParams<{ bo_table: string; wr_id: string }>();
  const boTable = resolveAdminBoTable(params.bo_table);
  const wrId = Number(params.wr_id);

  if (boTable === null || !Number.isFinite(wrId) || wrId <= 0) {
    notFound();
  }

  return <AdminEditForm boTable={boTable} wrId={wrId} />;
}
