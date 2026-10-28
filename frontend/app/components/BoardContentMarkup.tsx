export type BoardContentMarkupProps = {
  safeHtml: string;
  className?: string;
  legacyLayout?: boolean;
};

/** Only sanitized HTML may cross this presentation boundary. */
export default function BoardContentMarkup({
  safeHtml,
  className = '',
  legacyLayout = false,
}: BoardContentMarkupProps) {
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

  return <div className={classes} dangerouslySetInnerHTML={{ __html: safeHtml }} />;
}
