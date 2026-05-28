import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import BoardViewSection from '../../components/BoardViewSection';
import { ALLOWED_BO_TABLES, BOARD_META, SITE_NAME } from '../../constants/boardContent';
import { fetchBoardView } from '../../lib/boardApi';
import type { BoTable } from '../../types/board';

export const revalidate = 300;

type PageProps = {
  params: Promise<{ bo_table: string; wr_id: string }>;
};

function isValidBoTable(value: string): value is BoTable {
  return (ALLOWED_BO_TABLES as readonly string[]).includes(value);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { bo_table, wr_id } = await params;

  if (!isValidBoTable(bo_table)) return {};

  const wrIdNum = parseInt(wr_id, 10);
  if (!wrIdNum || wrIdNum <= 0) return {};

  try {
    const post = await fetchBoardView(bo_table, wrIdNum);
    const { label } = BOARD_META[bo_table];

    return {
      title: `${post.wr_subject} | ${label} | ${SITE_NAME}`,
      alternates: { canonical: `/${bo_table}/${wrIdNum}` },
    };
  } catch {
    return {};
  }
}

export default async function BoardViewPage({ params }: PageProps) {
  const { bo_table, wr_id } = await params;

  if (!isValidBoTable(bo_table)) notFound();

  const wrIdNum = parseInt(wr_id, 10);
  if (!wrIdNum || wrIdNum <= 0) notFound();

  let post;
  try {
    post = await fetchBoardView(bo_table, wrIdNum);
  } catch {
    notFound();
  }

  const { label } = BOARD_META[bo_table];

  return (
    <>
      <section className="bg-[#1a3151] px-6 py-14 md:py-20">
        <div className="mx-auto max-w-[900px]">
          <p className="mb-2 text-[13px] font-medium uppercase tracking-widest text-white/50">여온의 이야기</p>
          <p className="text-[22px] font-bold tracking-tight text-white md:text-[32px]">{label}</p>
        </div>
      </section>

      <BoardViewSection boTable={bo_table} post={post} />
    </>
  );
}
