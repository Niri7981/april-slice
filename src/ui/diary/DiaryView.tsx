type DiaryViewProps = {
  ariaLabel: string;
  eyebrow: string;
  title: string;
  closeLabel: string;
  meta: string[];
  hint: string;
  entryDate: string;
  paragraphs: string[];
  traceLabel: string;
  traceSummary: string;
  footer: string;
  onClose: () => void;
};

export function DiaryView({
  ariaLabel,
  eyebrow,
  title,
  closeLabel,
  meta,
  hint,
  entryDate,
  paragraphs,
  traceLabel,
  traceSummary,
  footer,
  onClose,
}: DiaryViewProps) {
  return (
    <section aria-label={ariaLabel} className="note-modal" role="dialog">
      <div className="note-paper diary-paper">
        <header className="diary-paper-header">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h2>{title}</h2>
          </div>
          <button onClick={onClose} type="button">
            {closeLabel}
          </button>
        </header>

        <div className="diary-meta">
          {meta.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>

        <p className="note-hint">{hint}</p>

        <article className="diary-entry-card">
          <p className="diary-entry-date">{entryDate}</p>
          <div className="diary-entry-body">
            {paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </article>

        <aside className="diary-note-preview">
          <p className="eyebrow">{traceLabel}</p>
          <p>{traceSummary}</p>
        </aside>

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
