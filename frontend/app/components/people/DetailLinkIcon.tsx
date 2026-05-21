type DetailLinkIconProps = {
  variant: 'light' | 'dark';
};

export default function DetailLinkIcon({ variant }: DetailLinkIconProps) {
  const stroke = variant === 'light' ? '#023373' : '#ffffff';

  return (
    <svg
      width={25}
      height={25}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="inline-block shrink-0"
    >
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
