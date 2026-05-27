type NoteEchoDialogProps = {
  ariaLabel: string;
  eyebrow: string;
  title: string;
  hint: string;
  placeholder: string;
  draft: string;
  limit: number;
  remainingLabel?: string;
  unit?: string;
  cancelLabel: string;
  sendLabel: string;
  canSend: boolean;
  onDraftChange: (draft: string) => void;
  onCancel: () => void;
  onSend: () => void;
};

export function NoteEchoDialog({
  ariaLabel,
  eyebrow,
  title,
  hint,
  placeholder,
  draft,
  limit,
  remainingLabel,
  unit,
  cancelLabel,
  sendLabel,
  canSend,
  onDraftChange,
  onCancel,
  onSend,
}: NoteEchoDialogProps) {
  return (
    <section aria-label={ariaLabel} className="note-modal" role="dialog">
      <div className="note-paper">
        <header>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
        </header>
        <p className="note-hint">{hint}</p>
        <textarea
          autoFocus
          maxLength={limit}
          onChange={(event) => onDraftChange(event.target.value)}
          placeholder={placeholder}
          value={draft}
        />
        <div className="note-footer">
          {remainingLabel ? (
            <small>
              {remainingLabel} {limit - draft.length}
              {unit}
            </small>
          ) : (
            <small aria-hidden="true" />
          )}
          <div>
            <button onClick={onCancel} type="button">
              {cancelLabel}
            </button>
            <button disabled={!canSend} onClick={onSend} type="button">
              {sendLabel}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
