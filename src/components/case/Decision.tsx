/**
 * An engineering decision, with what it cost.
 *
 * A case study that only lists what was chosen reads like marketing. The
 * trade-off is the part that shows someone actually weighed something, so the
 * `instead` prop is required — there is no way to record a decision here
 * without naming what it ruled out.
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
      <h3 className="decision-title">{title}</h3>
      <p className="decision-instead">
        <span>Instead of</span> {instead}
      </p>
      <div className="decision-body">{children}</div>
    </aside>
  );
}
