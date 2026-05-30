import type { RelationshipState } from "../game/relationships/relationshipDrift";

type RelationshipCopy = {
  id: string;
  name: string;
  role: string;
  note: string;
};

type RelationshipPanelProps = {
  ariaLabel: string;
  eyebrow: string;
  title: string;
  hint: string;
  closeLabel: string;
  warmthLabel: string;
  tensionLabel: string;
  footer: string;
  relationships: RelationshipState[];
  copies: RelationshipCopy[];
  onClose: () => void;
};

export function RelationshipPanel({
  ariaLabel,
  eyebrow,
  title,
  hint,
  closeLabel,
  warmthLabel,
  tensionLabel,
  footer,
  relationships,
  copies,
  onClose,
}: RelationshipPanelProps) {
  return (
    <section aria-label={ariaLabel} className="note-modal" role="dialog">
      <div className="note-paper diary-paper relationships-paper">
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

        <div className="relationship-list">
          {relationships.map((relationship) => {
            const localized =
              copies.find((copy) => copy.id === relationship.id) ?? {
                id: relationship.id,
                name: relationship.name,
                role: relationship.role,
                note: relationship.note,
              };

            return (
              <article className="relationship" key={relationship.id}>
                <div className="relationship-head">
                  <div>
                    <strong>{localized.name}</strong>
                    <small>{localized.role}</small>
                  </div>
                  <span>{relationship.warmth}°</span>
                </div>
                <div className="relationship-bars">
                  <label>
                    {warmthLabel}
                    <span className="mini-meter">
                      <i style={{ width: `${relationship.warmth}%` }} />
                    </span>
                  </label>
                  <label>
                    {tensionLabel}
                    <span className="mini-meter tension">
                      <i style={{ width: `${relationship.tension}%` }} />
                    </span>
                  </label>
                </div>
                <p>{localized.note}</p>
              </article>
            );
          })}
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
