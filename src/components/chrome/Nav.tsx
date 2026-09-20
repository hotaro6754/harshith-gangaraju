'use client';

import { useEffect, useState } from 'react';

import { PROFILE } from '@/content/profile';

const SECTIONS = [
  { id: 'position', label: 'Position' },
  { id: 'work', label: 'Work' },
  { id: 'contact', label: 'Contact' },
];

/**
 * Site chrome.
 *
 * Hidden while the hero owns the screen and revealed once the visitor has
 * left it — the hero is a composition and a nav bar sitting on top of it is
 * just clutter. It is still in the DOM the whole time and still focusable, so
 * a keyboard user is never stranded waiting for a scroll position.
 */
export function Nav() {
  const [past, setPast] = useState(false);
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setPast(window.scrollY > window.innerHeight * 0.9);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const targets = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setCurrent(entry.target.id);
        }
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );

    for (const target of targets) observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="nav" data-past={past} aria-label="Sections">
      <a className="nav-home" href="#top" data-cursor="Top">
        {PROFILE.short}
      </a>

      <ul className="nav-list">
        {SECTIONS.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              data-current={current === section.id ? 'true' : undefined}
              aria-current={current === section.id ? 'true' : undefined}
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
