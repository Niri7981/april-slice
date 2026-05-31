import { birthPlaceSuggestions } from "../../game/initial-hand/profileSeed/birthPlaceLookup";
import { InitialHandField } from "./InitialHandField";
import type { BirthFormState } from "./form-state";
import type { InitialHandPanelCopy } from "./panel-copy";

type InitialHandBirthFormProps = {
  copy: InitialHandPanelCopy;
  form: BirthFormState;
  onFieldChange: (key: keyof BirthFormState, value: string) => void;
  onPlaceChange: (value: string) => void;
};

export function InitialHandBirthForm({
  copy,
  form,
  onFieldChange,
  onPlaceChange,
}: InitialHandBirthFormProps) {
  return (
    <>
      <div className="initial-hand-form">
        <InitialHandField
          label={copy.name}
          value={form.name}
          onChange={(value) => onFieldChange("name", value)}
        />
        <InitialHandField
          label={copy.birthDate}
          type="date"
          value={form.birthDate}
          onChange={(value) => onFieldChange("birthDate", value)}
        />
        <InitialHandField
          label={copy.birthTime}
          type="time"
          value={form.birthTime}
          onChange={(value) => onFieldChange("birthTime", value)}
        />
        <InitialHandField
          label={copy.birthCity}
          list="birth-place-suggestions"
          placeholder={copy.cityPlaceholder}
          value={form.placeLabel}
          onChange={onPlaceChange}
        />
        <datalist id="birth-place-suggestions" aria-label={copy.placeSuggestionsLabel}>
          {birthPlaceSuggestions.map((city) => (
            <option key={city} value={city} />
          ))}
        </datalist>
      </div>

      <details className="initial-hand-advanced">
        <summary>{copy.advancedSummary}</summary>
        <div className="initial-hand-place-fields">
          <p>{copy.correctionHint}</p>
          <InitialHandField
            label={copy.latitude}
            placeholder={copy.latitudePlaceholder}
            step="0.01"
            type="number"
            value={form.latitude}
            onChange={(value) => onFieldChange("latitude", value)}
          />
          <InitialHandField
            label={copy.longitude}
            placeholder={copy.longitudePlaceholder}
            step="0.01"
            type="number"
            value={form.longitude}
            onChange={(value) => onFieldChange("longitude", value)}
          />
          <InitialHandField
            label={copy.timezone}
            placeholder={copy.timezonePlaceholder}
            step="1"
            type="number"
            value={form.timeZoneOffsetHours}
            onChange={(value) => onFieldChange("timeZoneOffsetHours", value)}
          />
        </div>
      </details>
    </>
  );
}
