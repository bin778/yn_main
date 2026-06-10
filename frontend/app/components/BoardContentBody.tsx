type BoardContentBodyProps = {
  html: string;
  className?: string;
  legacyLayout?: boolean;
};

/** 게시판 상세·관리자 미리보기 공통 본문 렌더 (board-content.css 적용) */
export default function BoardContentBody({ html, className = '', legacyLayout = false }: BoardContentBodyProps) {
  const classes = [
    'board-content',
    legacyLayout ? 'board-content--legacy-layout' : '',
    'min-h-[200px]',
    'leading-[1.75]',
    'text-[#333]',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={classes} dangerouslySetInnerHTML={{ __html: html }} />;
}
