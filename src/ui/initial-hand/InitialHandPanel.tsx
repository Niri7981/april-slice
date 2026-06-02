import { Sparkles } from "lucide-react";
import { useState } from "react";
import type {
  InitialHand,
  InitialHandOutputLanguage,
} from "../../game/initial-hand/model/initialHand";
import { createFallbackInitialHand } from "../../game/initial-hand/resolver/createInitialHand";
import { requestInitialHand } from "../../llm/initial-hand/apiClient";
import { InitialHandBirthForm } from "./InitialHandBirthForm";
import { InitialHandResultView } from "./InitialHandResultView";
import {
  applyBirthPlaceLookup,
  buildBirthProfileInput,
  defaultFormState,
  type BirthFormState,
} from "./form-state";
import { copyByLanguage } from "./panel-copy";

type InitialHandResults = Partial<Record<InitialHandOutputLanguage, InitialHand>>;

export function InitialHandPanel() {
  const [form, setForm] = useState(defaultFormState);
  const [displayLanguage, setDisplayLanguage] =
    useState<InitialHandOutputLanguage>("zh");
  const [initialHands, setInitialHands] = useState<InitialHandResults>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const apiUrl = import.meta.env.VITE_INITIAL_HAND_API_URL;
  const copy = copyByLanguage[displayLanguage];
  const initialHand =
    initialHands[displayLanguage] ?? initialHands.zh ?? initialHands.en ?? null;

  const updateField = (key: keyof BirthFormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const updatePlace = (value: string) => {
    setForm((current) => applyBirthPlaceLookup(current, value));
  };

  const generateInitialHand = async () => {
    setLoading(true);
    setError(null);

    try {
      const input = buildBirthProfileInput(form);
      const generateForLanguage = async (
        outputLanguage: InitialHandOutputLanguage,
      ) => {
        if (!apiUrl) {
          return createFallbackInitialHand(input, outputLanguage);
        }

        try {
          return await requestInitialHand({ apiUrl, input, outputLanguage });
        } catch (caughtError) {
          setError(
            caughtError instanceof Error
              ? `${caughtError.message} Falling back to local Initial Hand.`
              : copy.errorFallback,
          );

          return createFallbackInitialHand(input, outputLanguage);
        }
      };

      const [zhInitialHand, enInitialHand] = await Promise.all([
        generateForLanguage("zh"),
        generateForLanguage("en"),
      ]);

      setInitialHands({
        zh: zhInitialHand,
        en: enInitialHand,
      });
    } catch {
      setError(copy.errorFallback);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="initial-hand-panel" aria-label="Initial Hand">
      <div className="initial-hand-head">
        <div>
          <p className="eyebrow">Initial Hand</p>
          <h2>{copy.title}</h2>
        </div>
        <div className="initial-hand-actions">
          <div className="initial-hand-language-toggle" aria-label="Output language">
            <button
              className={displayLanguage === "zh" ? "is-active" : ""}
              type="button"
              onClick={() => setDisplayLanguage("zh")}
            >
              中文
            </button>
            <button
              className={displayLanguage === "en" ? "is-active" : ""}
              type="button"
              onClick={() => setDisplayLanguage("en")}
            >
              EN
            </button>
          </div>
          <button
            className="initial-hand-submit"
            type="button"
            disabled={loading || !form.birthDate}
            onClick={generateInitialHand}
          >
            <Sparkles aria-hidden="true" size={16} />
            <span>{loading ? copy.generating : copy.generate}</span>
          </button>
        </div>
      </div>

      <InitialHandBirthForm
        copy={copy}
        form={form}
        onFieldChange={updateField}
        onPlaceChange={updatePlace}
      />

      {error ? <p className="initial-hand-error">{error}</p> : null}
      {initialHand ? (
        <InitialHandResultView copy={copy} initialHand={initialHand} />
      ) : null}
    </section>
  );
}
