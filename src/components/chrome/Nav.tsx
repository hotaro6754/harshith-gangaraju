'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { PROFILE } from '@/content/profile';

/** In-page anchors, observed for the current-section state. */
const SECTIONS = [
  { id: 'position', label: 'Position' },
  { id: 'work', label: 'Work' },
  { id: 'practice', label: 'Practice' },
  { id: 'currently', label: 'Currently' },
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
    const onScroll = () => {
      // The nav hides only because the hero is a composition that a bar sits
      // badly on top of. On a page with no hero — or one too short to ever
      // scroll past the threshold — hiding it would simply make the site
      // unnavigable, so it shows immediately.
      const hero = document.querySelector('.hero');
      if (!hero) {
        setPast(true);
        return;
      }

      const reachable = document.documentElement.scrollHeight - window.innerHeight;
      const threshold = Math.min(window.innerHeight * 0.9, reachable * 0.35);
      setPast(window.scrollY > threshold);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
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
              href={`/#${section.id}`}
              data-current={current === section.id ? 'true' : undefined}
              aria-current={current === section.id ? 'true' : undefined}
            >
              {section.label}
            </a>
          </li>
        ))}
        <li>
          <Link href="/lab" data-cursor="Open">
            Lab
          </Link>
        </li>
      </ul>
    </nav>
  );
}
