import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound, permanentRedirect } from 'next/navigation';

import BoardCategoryTabs from '../../components/BoardCategoryTabs';
import BoardAdminBar from '../../components/BoardAdminBar';
import BoardJsonLd from '../../components/BoardJsonLd';
import BoardViewSection from '../../components/BoardViewSection';
import BoardSectionListPage from '../../components/BoardSectionListPage';
import { BOARD_META, getBoardPathSlug, resolveBoTableFromPathSlug, SITE_NAME } from '../../constants/boardContent';
import {
  buildBoardSectionListPath,
  getBoardSectionLabel,
  hasBoardSections,
  isBoardSectionSlug,
  LEGACY_REAL_ESTATE_PARENT,
  LEGACY_REAL_ESTATE_SLUG,
} from '../../constants/boardSections';
import { fetchBoardView } from '../../lib/boardApi';
import { buildBoardArticleSchema } from '../../lib/buildBoardArticleSchema';
import { buildBoardPostHref, getBoardPostPathSegment } from '../../lib/boardPostPath';
import type { BoardListSearchParams } from '../../lib/parseBoardListQuery';
import { resolveBoardMetaDescription } from '../../lib/boardSeo';

export const revalidate = 3600;

type PageProps = {
  params: Promise<{ bo_table: string; wr_id: string }>;
  searchParams: Promise<BoardListSearchParams>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { bo_table: pathSlug, wr_id: postKey } = await params;
  const boTable = resolveBoTableFromPathSlug(pathSlug);

  if (!boTable || postKey.trim() === '') return {};

  const trimmedKey = postKey.trim();

  if (hasBoardSections(boTable) && isBoardSectionSlug(boTable, trimmedKey)) {
    const categoryLabel = getBoardSectionLabel(boTable, trimmedKey);
    const { label, description } = BOARD_META[boTable];

    return {
      title: `${label} · ${categoryLabel} | ${SITE_NAME}`,
      description,
      alternates: { canonical: buildBoardSectionListPath(boTable, trimmedKey) },
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

  if ((bo_table === 'success' || bo_table === 'column') && trimmedKey === LEGACY_REAL_ESTATE_SLUG) {
    permanentRedirect(`/${getBoardPathSlug(bo_table)}/${LEGACY_REAL_ESTATE_PARENT}/${LEGACY_REAL_ESTATE_SLUG}/`);
  }

  if (hasBoardSections(bo_table) && isBoardSectionSlug(bo_table, trimmedKey)) {
    const resolvedSearchParams = await searchParams;

    return <BoardSectionListPage boTable={bo_table} category={trimmedKey} searchParams={resolvedSearchParams} />;
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

  const { label, heroBg, description: boardDescription } = BOARD_META[bo_table];
  const customSchema = post.wr_schema?.trim() ?? '';
  const articleSchema =
    bo_table === 'column'
      ? buildBoardArticleSchema({
          post,
          canonicalHref,
          description: resolveBoardMetaDescription(post.wr_seo_description, post.wr_content) || boardDescription,
        })
      : null;
  const jsonLdSchema = customSchema !== '' ? customSchema : articleSchema;

  return (
    <>
      {jsonLdSchema !== null && <BoardJsonLd wrId={post.wr_id} schema={jsonLdSchema} />}
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
