'use client';

import { useMemo, useState } from 'react';
import type { FloatingNavItem } from '@/types';

interface FloatingNavProps {
  items: FloatingNavItem[];
}

export default function FloatingNav({ items }: FloatingNavProps) {
  const [open, setOpen] = useState(false);

  const menuItems = useMemo(() => items.filter((item) => item.id && item.label), [items]);

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setOpen(false);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {open && (
        <div className="mb-3 w-40 rounded-xl border border-wedding-brown/20 bg-white/95 p-2 shadow-xl backdrop-blur">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-wedding-brown hover:bg-wedding-beige"
              onClick={() => scrollToSection(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="rounded-full bg-wedding-brown px-4 py-3 text-xs font-semibold tracking-[0.1em] text-white shadow-lg"
        aria-label="섹션 빠른 이동 메뉴"
      >
        MENU
      </button>
    </div>
  );
}
