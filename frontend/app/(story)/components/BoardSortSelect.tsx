'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { BOARD_SORT_OPTIONS, DEFAULT_BOARD_SORT, type BoardListSort } from '../constants/boardSort';

type BoardSortSelectProps = {
  current: BoardListSort;
};

export default function BoardSortSelect({ current }: BoardSortSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextSort = event.target.value as BoardListSort;
    const params = new URLSearchParams(searchParams.toString());

    if (nextSort === DEFAULT_BOARD_SORT) {
      params.delete('sort');
    } else {
      params.set('sort', nextSort);
    }
    params.delete('page');

    const query = params.toString();
    router.push(query === '' ? pathname : `${pathname}?${query}`);
  };

  return (
    <select
      value={current}
      onChange={handleChange}
      className="h-11 border border-[#ddd] bg-white px-2 text-[14px] text-[#121212] outline-none focus:border-[#1a3151]"
      aria-label="정렬"
    >
      {BOARD_SORT_OPTIONS.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
