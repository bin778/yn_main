export const SUCCESS_STORY_CATEGORIES = [
  { slug: 'criminal', label: '형사' },
  { slug: 'civil', label: '민사' },
  { slug: 'family', label: '가사' },
  { slug: 'real-estate', label: '부동산' },
] as const;

export type SuccessStoryCategory = (typeof SUCCESS_STORY_CATEGORIES)[number]['slug'];

const CATEGORY_SLUG_SET = new Set<string>(SUCCESS_STORY_CATEGORIES.map(item => item.slug));

export function isSuccessStoryCategorySlug(slug: string): slug is SuccessStoryCategory {
  return CATEGORY_SLUG_SET.has(slug);
}

export function getSuccessStoryCategoryLabel(slug: SuccessStoryCategory): string {
  const found = SUCCESS_STORY_CATEGORIES.find(item => item.slug === slug);
  return found?.label ?? slug;
}

export function buildSuccessStoryListPath(category?: SuccessStoryCategory | null): string {
  if (category) {
    return `/success-story/${category}`;
  }
  return '/success-story';
}
