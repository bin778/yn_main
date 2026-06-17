import Link from 'next/link';

import {
  SUCCESS_STORY_CATEGORIES,
  buildSuccessStoryListPath,
  type SuccessStoryCategory,
} from '../constants/successStoryCategories';

type SuccessStorySubTabsProps = {
  current: SuccessStoryCategory | null;
};

export default function SuccessStorySubTabs({ current }: SuccessStorySubTabsProps) {
  const tabs: { slug: SuccessStoryCategory | null; label: string }[] = [
    { slug: null, label: '전체' },
    ...SUCCESS_STORY_CATEGORIES.map(item => ({ slug: item.slug, label: item.label })),
  ];

  return (
    <nav className="mx-auto mb-6 max-w-[900px] px-4 md:px-6" aria-label="성공사례 분류 선택">
      <ul className="grid grid-cols-3 gap-2 md:grid-cols-5">
        {tabs.map(tab => {
          const isActive = current === tab.slug;
          const href = buildSuccessStoryListPath(tab.slug);

          return (
            <li key={tab.slug ?? 'all'}>
              <Link
                href={href}
                className={`flex h-11 items-center justify-center border text-[14px] font-medium tracking-tight transition-colors ${
                  isActive
                    ? 'border-[#1a3151] bg-[#1a3151] text-white'
                    : 'border-[#ddd] bg-white text-[#555] hover:border-[#1a3151] hover:text-[#1a3151]'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
