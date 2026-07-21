'use client';

import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export interface SectionNavItem {
  id: string;
  title: string;
}

export function SectionNav({ sections }: { sections: SectionNavItem[] }) {
  const [activeId, setActiveId] = useState<string | null>(
    sections[0]?.id ?? null,
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-20% 0px -70% 0px' },
    );

    for (const section of sections) {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav aria-label='Seitenabschnitte'>
      <ul className='space-y-1'>
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className={cn(
                'block rounded-lg border-l-2 border-transparent px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground',
                activeId === section.id &&
                  'border-primary bg-primary/5 font-semibold text-primary',
              )}
            >
              {section.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
