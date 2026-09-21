'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

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
 * Hidden while the hero owns the screen. After that it gets out of the way
 * while you read downward and comes back the moment you scroll up, which is
 * when people are actually looking for it. It is always in the DOM and always
 * focusable, so a keyboard user is never stranded behind a scroll position.
 *
 * On narrow screens the six links did not fit. Three of them ran off the
 * right edge and could not be reached at all, so below the breakpoint the
 * list becomes a full-screen menu.
 */
export function Nav() {
  const [past, setPast] = useState(false);
  const [tucked, setTucked] = useState(false);
  const [current, setCurrent] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    let lastY = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;

      // With no hero, or a page too short to scroll, the nav shows
      // immediately: hiding it would just make the site unnavigable.
      const hero = document.querySelector('.hero');
      if (!hero) {
        setPast(true);
      } else {
        // Measured against the pin spacer, which is the hero's actual end.
        const spacer = hero.closest('.pin-spacer') ?? hero;
        setPast(spacer.getBoundingClientRect().bottom <= 96);
      }

      // A small dead zone so trackpad jitter does not flicker the bar.
      if (y > lastY + 8) setTucked(true);
      else if (y < lastY - 8) setTucked(false);
      lastY = y;
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

  // The open menu owns the screen: focus moves into it, Escape closes it,
  // the page behind does not scroll, and focus returns to the button.
  useEffect(() => {
    if (!open) return;

    firstLinkRef.current?.focus();
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);

    const toggle = toggleRef.current;
    return () => {
      window.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = previous;
      toggle?.focus();
    };
  }, [open]);

  const close = () => setOpen(false);

  // Rendered twice: once as the desktop row, once inside the mobile menu.
  // Only the menu copy takes the focus ref, since it is the one that receives
  // focus when the menu opens.
  const renderLinks = (inMenu: boolean) => (
    <>
      {SECTIONS.map((section, i) => (
        <li key={section.id}>
          <a
            ref={inMenu && i === 0 ? firstLinkRef : undefined}
            href={`/#${section.id}`}
            onClick={close}
            data-current={current === section.id ? 'true' : undefined}
            aria-current={current === section.id ? 'true' : undefined}
          >
            {section.label}
          </a>
        </li>
      ))}
      <li>
        <Link href="/lab" onClick={close} data-cursor="Open">
          Lab
        </Link>
      </li>
    </>
  );

  return (
    <nav
      className="nav"
      data-past={past}
      data-tucked={past && tucked && !open ? 'true' : 'false'}
      data-open={open}
      aria-label="Sections"
    >
      <Link className="nav-home" href="/#top" data-cursor="Top">
        {PROFILE.short}
      </Link>

      <ul className="nav-list">{renderLinks(false)}</ul>

      <button
        ref={toggleRef}
        type="button"
        className="nav-toggle"
        aria-expanded={open}
        aria-controls="nav-menu"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? 'Close' : 'Menu'}
      </button>

      <div className="nav-menu" id="nav-menu" hidden={!open}>
        <ul className="nav-menu-list">{renderLinks(true)}</ul>
        <p className="nav-menu-foot">
          <a href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a>
        </p>
      </div>
    </nav>
  );
}
