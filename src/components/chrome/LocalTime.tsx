'use client';

import { useSyncExternalStore } from 'react';

/**
 * The time where he actually is.
 *
 * A real value, not decoration: it tells someone in another timezone whether
 * a reply today is plausible. Rendered only on the client (the server has no
 * idea when you are reading), and subscribed once a second through
 * `useSyncExternalStore` rather than a state-setting effect.
 */

const ZONE = 'Asia/Kolkata';

const format = new Intl.DateTimeFormat('en-GB', {
  timeZone: ZONE,
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

function subscribe(onChange: () => void) {
  const timer = window.setInterval(onChange, 1000);
  return () => window.clearInterval(timer);
}

// Minute resolution, so the snapshot is stable within a minute and React
// only re-renders when the displayed value changes.
const getSnapshot = () => format.format(new Date());
const getServerSnapshot = () => null;

export function LocalTime() {
  const time = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <span className="local-time">
      <span className="local-time-dot" aria-hidden="true" />
      {time ? (
        <>
          <time>{time}</time> IST
        </>
      ) : (
        'IST'
      )}
    </span>
  );
}
