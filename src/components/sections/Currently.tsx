import { Reveal } from '@/components/motion/Reveal';
import { CURRENTLY } from '@/content/profile';

const COLUMNS = [
  { key: 'building', title: 'Building', items: CURRENTLY.building },
  { key: 'learning', title: 'Learning', items: CURRENTLY.learning },
  { key: 'exploring', title: 'Exploring', items: CURRENTLY.exploring },
] as const;

/**
 * Section 04 — Currently.
 *
 * The part of the site with a shelf life, and that is the point: it is the
 * cheapest possible signal that the thing is maintained rather than published
 * once and abandoned. Editing one array in `profile.ts` updates it, so there
 * is no excuse for it going stale.
 */
export function Currently() {
  return (
    <section className="section section-currently" id="currently" aria-labelledby="currently-title">
      <div className="section-head">
        <span className="section-index">04</span>
        <h2 className="section-title" id="currently-title">
          Currently
        </h2>
      </div>

      {/* Not three equal columns. Equal weight is no hierarchy, and a row of
          identical lists is one of the most recognisable generated layouts
          there is — so "Building" leads and the other two sit beside it. */}
      <div className="currently-grid">
        {COLUMNS.map((column, i) => (
          <Reveal key={column.key} delay={i * 0.06} className="currently-column" data-lead={i === 0}>
            <h3 className="currently-title">{column.title}</h3>
            <ul className="currently-list">
              {column.items.map((item) => (
                <li key={item.label}>
                  <span className="currently-label">{item.label}</span>
                  {item.note && <span className="currently-note">{item.note}</span>}
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
