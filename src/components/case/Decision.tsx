/**
 * An engineering decision, with what it cost.
 *
 * A case study that only lists what was chosen reads like marketing. The
 * trade-off is the part that shows someone actually weighed something, so the
 * `instead` prop is required: there is no way to record a decision here
 * without naming what it ruled out.
 *
 * It used to render as a bordered callout box, which is how every docs site
 * renders a tip. Now it is drawn as the fork it describes: what was chosen on
 * one side, what was ruled out on the other, and the ruled-out option is
 * struck through as it scrolls into view. The strike is a CSS scroll-driven
 * animation, so it needs no script; where that is unsupported the option is
 * simply shown already struck.
 */
export interface DecisionProps {
  /** What was decided. */
  title: string;
  /** What it was chosen over. Required. */
  instead: string;
  children: React.ReactNode;
}

export function Decision({ title, instead, children }: DecisionProps) {
  return (
    <aside className="decision">
      <div className="decision-fork">
        <div className="decision-side" data-side="chose">
          <span className="decision-label">Chose</span>
          <h3 className="decision-title">{title}</h3>
        </div>
        <span className="decision-split" aria-hidden="true" />
        <div className="decision-side" data-side="over">
          <span className="decision-label">Instead of</span>
          <p className="decision-instead">
            <s>{instead}</s>
          </p>
        </div>
      </div>
      <div className="decision-body">{children}</div>
    </aside>
  );
}
