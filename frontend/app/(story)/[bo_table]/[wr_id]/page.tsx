import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound, permanentRedirect } from 'next/navigation';

import BoardCategoryTabs from '../../components/BoardCategoryTabs';
import BoardAdminBar from '../../components/BoardAdminBar';
import BoardJsonLd from '../../components/BoardJsonLd';
import BoardViewSection from '../../components/BoardViewSection';
import PracticeAreaCategoryListPage from '../../components/PracticeAreaCategoryListPage';
import { BOARD_META, resolveBoTableFromPathSlug, SITE_NAME } from '../../constants/boardContent';
import {
  buildPracticeAreaListPath,
  getPracticeAreaCategoryLabel,
  hasPracticeAreaCategories,
  isPracticeAreaCategorySlug,
} from '../../constants/practiceAreaCategories';
import { fetchBoardView } from '../../lib/boardApi';
import { buildBoardPostHref, getBoardPostPathSegment } from '../../lib/boardPostPath';
import type { BoardListSearchParams } from '../../lib/parseBoardListQuery';
import { resolveBoardMetaDescription } from '../../lib/boardSeo';

export const revalidate = 60;

type PageProps = {
  params: Promise<{ bo_table: string; wr_id: string }>;
  searchParams: Promise<BoardListSearchParams>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { bo_table: pathSlug, wr_id: postKey } = await params;
  const boTable = resolveBoTableFromPathSlug(pathSlug);

  if (!boTable || postKey.trim() === '') return {};

  const trimmedKey = postKey.trim();

  if (hasPracticeAreaCategories(boTable) && isPracticeAreaCategorySlug(trimmedKey)) {
    const categoryLabel = getPracticeAreaCategoryLabel(trimmedKey);
    const { label, description } = BOARD_META[boTable];

    return {
      title: `${label} · ${categoryLabel} | ${SITE_NAME}`,
      description,
      alternates: { canonical: buildPracticeAreaListPath(boTable, trimmedKey) },
    };
  }

  try {
    const post = await fetchBoardView(boTable, postKey);
    const { label, description: boardDescription } = BOARD_META[boTable];
    const metaDescription = resolveBoardMetaDescription(post.wr_seo_description, post.wr_content) || boardDescription;
    const canonical = buildBoardPostHref(boTable, post.wr_id, post.wr_seo_slug);
    const ogImageUrl = post.og_image_url?.trim() ?? '';

    return {
      title: `${post.wr_subject} | ${label} | ${SITE_NAME}`,
      description: metaDescription,
      openGraph: {
        title: `${post.wr_subject} | ${label}`,
        description: metaDescription,
        ...(ogImageUrl !== '' ? { images: [{ url: ogImageUrl }] } : {}),
      },
      alternates: { canonical },
    };
  } catch {
    return {};
  }
}

export default async function BoardViewPage({ params, searchParams }: PageProps) {
  const { bo_table: pathSlug, wr_id: postKey } = await params;
  const bo_table = resolveBoTableFromPathSlug(pathSlug);

  if (!bo_table || postKey.trim() === '') notFound();

  const trimmedKey = postKey.trim();

  if (hasPracticeAreaCategories(bo_table) && isPracticeAreaCategorySlug(trimmedKey)) {
    const resolvedSearchParams = await searchParams;

    return (
      <PracticeAreaCategoryListPage boTable={bo_table} category={trimmedKey} searchParams={resolvedSearchParams} />
    );
  }

  let post;
  try {
    post = await fetchBoardView(bo_table, postKey);
  } catch {
    notFound();
  }

  const canonicalHref = buildBoardPostHref(bo_table, post.wr_id, post.wr_seo_slug);
  const canonicalSegment = getBoardPostPathSegment(post.wr_id, post.wr_seo_slug);

  if (postKey.trim() !== canonicalSegment) {
    permanentRedirect(canonicalHref);
  }

  const { label, heroBg } = BOARD_META[bo_table];

  return (
    <>
      {post.wr_schema && post.wr_schema.trim() !== '' && <BoardJsonLd wrId={post.wr_id} schema={post.wr_schema} />}
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
          <p id="story-detail-hero-heading" className="text-[30px] font-bold tracking-tight text-white md:text-[45px]">
            {label}
          </p>
        </div>
      </section>

      <BoardCategoryTabs current={bo_table} />
      <BoardAdminBar boTable={bo_table} wrId={post.wr_id} />
      <BoardViewSection boTable={bo_table} post={post} />
    </>
  );
}
