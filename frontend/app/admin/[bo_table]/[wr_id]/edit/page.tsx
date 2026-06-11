'use client';

import { notFound, useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { deleteBoardPost, fetchBoardPostAdmin } from '@/app/(story)/lib/boardAdminApi';
import type { BoTable } from '@/app/(story)/types/board';

import AdminPostForm, { type AdminPostInitial } from '../../../components/AdminPostForm';
import { getAdminListPath, getRedirectPathAfterSave, resolveAdminBoTable } from '../../../lib/adminBoard';

type AdminEditFormProps = {
  boTable: BoTable;
  wrId: number;
};

function AdminEditForm({ boTable, wrId }: AdminEditFormProps) {
  const router = useRouter();
  const [initial, setInitial] = useState<AdminPostInitial | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchBoardPostAdmin(boTable, wrId)
      .then(item => {
        if (cancelled) return;
        const attachment = item.files.find(file => file.no === 0) ?? item.files[0] ?? null;
        setInitial({
          subject: item.wr_subject,
          content: item.wr_content,
          notice: item.notice,
          wrDatetime: item.wr_datetime,
          thumbnailUrl: item.wr_1,
          seoTitle: item.wr_seo_title,
          seoSlug: item.wr_seo_slug,
          seoDescription: item.wr_seo_description ?? '',
          schema: item.wr_schema ?? '',
          attachment,
        });
      })
      .catch(() => {
        if (!cancelled) setLoadError('게시물을 불러오지 못했습니다.');
      });

    return () => {
      cancelled = true;
    };
  }, [boTable, wrId]);

  async function handleDelete() {
    await deleteBoardPost(boTable, wrId);
    router.push(getAdminListPath(boTable));
    router.refresh();
  }

  if (loadError !== null) {
    return <main className="mx-auto max-w-[1200px] px-4 py-10 text-sm text-[#b42318] md:px-6">{loadError}</main>;
  }

  if (initial === null) {
    return <main className="mx-auto max-w-[1200px] px-4 py-10 text-sm text-[#666] md:px-6">불러오는 중…</main>;
  }

  return (
    <AdminPostForm
      key={`edit-${wrId}`}
      boTable={boTable}
      mode="edit"
      wrId={wrId}
      initial={initial}
      onSaved={(_wrId, publishMode) => {
        router.push(getRedirectPathAfterSave(boTable, wrId, publishMode));
        router.refresh();
      }}
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
