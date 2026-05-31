type DaySummaryViewProps = {
  ariaLabel: string;
  eyebrow: string;
  title: string;
  hint: string;
  closeLabel: string;
  footer: string;
  tracesTitle: string;
  traceText: string;
  routeTitle: string;
  routeText: string;
  moodTitle: string;
  moodLines: string[];
  nextTitle: string;
  nextText: string;
  onClose: () => void;
};

export function DaySummaryView({
  ariaLabel,
  eyebrow,
  title,
  hint,
  closeLabel,
  footer,
  tracesTitle,
  traceText,
  routeTitle,
  routeText,
  moodTitle,
  moodLines,
  nextTitle,
  nextText,
  onClose,
}: DaySummaryViewProps) {
  return (
    <section aria-label={ariaLabel} className="note-modal" role="dialog">
      <div className="note-paper day-summary-paper">
        <header className="diary-paper-header">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h2>{title}</h2>
          </div>
          <button onClick={onClose} type="button">
            {closeLabel}
          </button>
        </header>

        <p className="note-hint">{hint}</p>

        <div className="day-summary-grid">
          <article className="day-summary-card">
            <p className="eyebrow">{tracesTitle}</p>
            <p>{traceText}</p>
          </article>

          <article className="day-summary-card">
            <p className="eyebrow">{routeTitle}</p>
            <p>{routeText}</p>
          </article>

          <article className="day-summary-card">
            <p className="eyebrow">{moodTitle}</p>
            <div className="day-summary-list">
              {moodLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </article>

          <article className="day-summary-card">
            <p className="eyebrow">{nextTitle}</p>
            <p>{nextText}</p>
          </article>
        </div>

        <div className="note-footer diary-footer">
          <small>{footer}</small>
          <div>
            <button onClick={onClose} type="button">
              {closeLabel}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
