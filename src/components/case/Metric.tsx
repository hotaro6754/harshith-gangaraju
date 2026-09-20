/**
 * A number, and where it came from.
 *
 * The brief's hardest content rule is "never invent a number". A rule like
 * that survives exactly as long as the discipline of whoever is writing at
 * 1 a.m., so this makes it a property of the type system instead: there is no
 * way to render a figure without attaching its source.
 *
 * The second variant matters just as much. CYBER-OS publishes no benchmarks,
 * so its case study says so — in the same visual slot a number would occupy,
 * with the reason it has not been measured. An engineer reading "not measured
 * under controlled load" trusts the page more than one reading a figure that
 * appeared from nowhere, not less.
 */

type MetricProps =
  | {
      /** The figure, exactly as the source states it. */
      value: string;
      label: string;
      /** Where this came from. Required — that is the entire point. */
      source: string;
      href?: string;
      reason?: never;
    }
  | {
      value: 'not-measured';
      label: string;
      /** Why it has not been measured. Also required. */
      reason: string;
      source?: never;
      href?: never;
    };

export function Metric(props: MetricProps) {
  const unmeasured = props.value === 'not-measured';

  return (
    <div className="metric" data-unmeasured={unmeasured}>
      <span className="metric-value">{unmeasured ? '—' : props.value}</span>
      <span className="metric-label">{props.label}</span>
      <span className="metric-source">
        {unmeasured ? (
          props.reason
        ) : props.href ? (
          <a href={props.href} target="_blank" rel="noreferrer noopener">
            {props.source}
          </a>
        ) : (
          props.source
        )}
      </span>
    </div>
  );
}
