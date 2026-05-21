export type ReasonIconId = 'monthlyLimit' | 'guide' | 'strategy';

type ReasonIconProps = {
  iconId: ReasonIconId;
  className?: string;
};

const ICON_COLOR = '#023373';

export default function ReasonIcon({ iconId, className = 'h-16 w-16' }: ReasonIconProps) {
  switch (iconId) {
    case 'monthlyLimit':
      return (
        <svg
          className={className}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <rect x="14" y="12" width="36" height="44" rx="3" stroke={ICON_COLOR} strokeWidth="2.5" />
          <path d="M22 12V8M42 12V8" stroke={ICON_COLOR} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M14 22H50" stroke={ICON_COLOR} strokeWidth="2.5" />
          <path
            d="M24 32H28M36 32H40M24 40H28M36 40H40"
            stroke={ICON_COLOR}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="46" cy="46" r="10" fill="white" stroke={ICON_COLOR} strokeWidth="2.5" />
          <path d="M42 46H50M46 42V50" stroke={ICON_COLOR} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'guide':
      return (
        <svg
          className={className}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <circle cx="24" cy="22" r="8" stroke={ICON_COLOR} strokeWidth="2.5" />
          <path
            d="M10 50C10 40.5 16.5 34 24 34C31.5 34 38 40.5 38 50"
            stroke={ICON_COLOR}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="44" cy="24" r="7" stroke={ICON_COLOR} strokeWidth="2.5" />
          <path
            d="M34 50C34 41.5 38.5 36 44 36C49.5 36 54 41.5 54 50"
            stroke={ICON_COLOR}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'strategy':
      return (
        <svg
          className={className}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <rect x="12" y="14" width="28" height="36" rx="2" stroke={ICON_COLOR} strokeWidth="2.5" />
          <path d="M18 22H34M18 30H34M18 38H28" stroke={ICON_COLOR} strokeWidth="2.5" strokeLinecap="round" />
          <rect x="32" y="22" width="20" height="28" rx="2" stroke={ICON_COLOR} strokeWidth="2.5" />
          <path d="M38 30H46M38 36H46M38 42H44" stroke={ICON_COLOR} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}
