import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import BoardCategoryTabs from '../../components/BoardCategoryTabs';
import BoardAdminBar from '../../components/BoardAdminBar';
import BoardViewSection from '../../components/BoardViewSection';
import { BOARD_META, getBoardPathSlug, resolveBoTableFromPathSlug, SITE_NAME } from '../../constants/boardContent';
import { fetchBoardView } from '../../lib/boardApi';

export const revalidate = 300;

type PageProps = {
  params: Promise<{ bo_table: string; wr_id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { bo_table: pathSlug, wr_id } = await params;
  const boTable = resolveBoTableFromPathSlug(pathSlug);

  if (!boTable) return {};

  const wrIdNum = parseInt(wr_id, 10);
  if (!wrIdNum || wrIdNum <= 0) return {};

  try {
    const post = await fetchBoardView(boTable, wrIdNum);
    const { label } = BOARD_META[boTable];

    return {
      title: `${post.wr_subject} | ${label} | ${SITE_NAME}`,
      alternates: { canonical: `/${getBoardPathSlug(boTable)}/${wrIdNum}` },
    };
  } catch {
    return {};
  }
}

export default async function BoardViewPage({ params }: PageProps) {
  const { bo_table: pathSlug, wr_id } = await params;
  const bo_table = resolveBoTableFromPathSlug(pathSlug);

  if (!bo_table) notFound();

  const wrIdNum = parseInt(wr_id, 10);
  if (!wrIdNum || wrIdNum <= 0) notFound();

  let post;
  try {
    post = await fetchBoardView(bo_table, wrIdNum);
  } catch {
    notFound();
  }

  const { label, heroBg } = BOARD_META[bo_table];

  return (
    <>
      <section className="relative w-full overflow-hidden" aria-labelledby="story-detail-hero-heading">
        {heroBg ? (
          <>
            <Image src={heroBg} alt="" fill priority className="object-cover object-center" sizes="100vw" />
            <div className="absolute inset-0 bg-black/20" aria-hidden />
          </>
        ) : (
          <div className="absolute inset-0 bg-[#1a3151]" aria-hidden />
        )}
        <div className="relative z-[1] mx-auto max-w-[1200px] px-6 py-20 md:px-12 md:py-28">
          <p className="mb-2 text-[13px] font-medium uppercase tracking-widest text-white/50">여온의 이야기</p>
          <p id="story-detail-hero-heading" className="text-[22px] font-bold tracking-tight text-white md:text-[32px]">
            {label}
          </p>
        </div>
      </section>

      <BoardCategoryTabs current={bo_table} />
      <BoardAdminBar boTable={bo_table} wrId={wrIdNum} />
      <BoardViewSection boTable={bo_table} post={post} />
    </>
  );
}
