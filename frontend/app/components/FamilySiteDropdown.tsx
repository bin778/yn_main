'use client';

import { useEffect, useRef, useState } from 'react';

import { FAMILY_SITES } from '@/app/constants/footerContent';

type FamilySiteDropdownProps = {
  className?: string;
};

export default function FamilySiteDropdown({ className = '' }: FamilySiteDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="flex w-full cursor-pointer items-center justify-between border border-white bg-transparent px-4 py-3 text-sm font-bold uppercase tracking-wide text-white"
        aria-expanded={open}
        aria-controls="family-site-menu"
      >
        FAMILY SITE
        <span aria-hidden className={`text-xs transition-transform ${open ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {open && (
        <ul
          id="family-site-menu"
          className="absolute left-0 right-0 top-full z-10 border border-t-0 border-white/30 bg-black/90"
        >
          {FAMILY_SITES.map(site => (
            <li key={site.href}>
              <a
                href={site.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-3 text-sm font-bold text-white hover:bg-white/10"
                onClick={() => setOpen(false)}
              >
                {site.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
