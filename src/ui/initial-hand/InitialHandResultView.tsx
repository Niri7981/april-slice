import { useMemo } from "react";
import type { InitialHand } from "../../game/initial-hand/model/initialHand";
import type { InitialHandPanelCopy } from "./panel-copy";

type InitialHandResultViewProps = {
  copy: InitialHandPanelCopy;
  initialHand: InitialHand;
};

const buildImagePrompt = (initialHand: InitialHand) =>
  [
    initialHand.summary,
    ...initialHand.cards,
    ...initialHand.tags.map((tag) => tag.image),
  ].join(" / ");

export function InitialHandResultView({
  copy,
  initialHand,
}: InitialHandResultViewProps) {
  const imagePrompt = useMemo(() => buildImagePrompt(initialHand), [initialHand]);

  return (
    <div className="initial-hand-result">
      <div className="initial-hand-summary">
        <span>
          {copy.sourceLabel}: {initialHand.source}
        </span>
        <p>{initialHand.summary}</p>
      </div>

      <div className="initial-hand-card-grid">
        {initialHand.cards.map((card) => (
          <article className="initial-hand-card" key={card}>
            {card}
          </article>
        ))}
      </div>

      <div className="initial-hand-tags">
        {initialHand.tags.map((tag) => (
          <article className="initial-hand-tag" key={tag.id}>
            <h3>{tag.id}</h3>
            <p>{tag.toneToken}</p>
            <dl>
              <div>
                <dt>{copy.misread}</dt>
                <dd>{tag.misreadBias}</dd>
              </div>
              <div>
                <dt>{copy.pressure}</dt>
                <dd>{tag.pressureBias}</dd>
              </div>
              <div>
                <dt>{copy.relationship}</dt>
                <dd>{tag.relationshipBias}</dd>
              </div>
              <div>
                <dt>{copy.image}</dt>
                <dd>{tag.image}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      <textarea
        className="initial-hand-image-prompt"
        readOnly
        value={imagePrompt}
        aria-label={copy.imagePromptLabel}
      />
    </div>
  );
}
