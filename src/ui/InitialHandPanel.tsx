import { Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import type { InitialHand } from "../game/initial-hand/model/initialHand";
import type { InitialHandOutputLanguage } from "../game/initial-hand/model/initialHand";
import {
  birthPlaceSuggestions,
  lookupBirthPlace,
} from "../game/initial-hand/profileSeed/birthPlaceLookup";
import { createFallbackInitialHand } from "../game/initial-hand/resolver/createInitialHand";
import { requestInitialHand } from "../llm/initialHandApiClient";

type BirthFormState = {
  birthDate: string;
  birthTime: string;
  latitude: string;
  longitude: string;
  name: string;
  placeLabel: string;
  timeZoneOffsetHours: string;
};

type InitialHandResults = Partial<Record<InitialHandOutputLanguage, InitialHand>>;

type InitialHandPanelCopy = {
  advancedSummary: string;
  birthCity: string;
  birthDate: string;
  birthTime: string;
  cityPlaceholder: string;
  correctionHint: string;
  errorFallback: string;
  generate: string;
  generating: string;
  imagePromptLabel: string;
  latitude: string;
  latitudePlaceholder: string;
  longitude: string;
  longitudePlaceholder: string;
  misread: string;
  name: string;
  placeSuggestionsLabel: string;
  pressure: string;
  relationship: string;
  image: string;
  sourceLabel: string;
  timezone: string;
  timezonePlaceholder: string;
  title: string;
};

const copyByLanguage: Record<InitialHandOutputLanguage, InitialHandPanelCopy> = {
  zh: {
    advancedSummary: "校正地点",
    birthCity: "出生城市",
    birthDate: "生日",
    birthTime: "时间",
    cityPlaceholder: "城市",
    correctionHint: "城市命中后会自动填；如果没命中，可以手动校正。",
    errorFallback: "生成失败",
    generate: "生成两份",
    generating: "生成中",
    imagePromptLabel: "图片生成提示词",
    latitude: "纬度",
    latitudePlaceholder: "39.90",
    longitude: "经度",
    longitudePlaceholder: "116.40",
    misread: "误读",
    name: "名字",
    placeSuggestionsLabel: "城市建议",
    pressure: "压力",
    relationship: "关系",
    image: "图像",
    sourceLabel: "来源",
    timezone: "时区",
    timezonePlaceholder: "8",
    title: "初始手牌",
  },
  en: {
    advancedSummary: "Adjust Place",
    birthCity: "Birth City",
    birthDate: "Birth Date",
    birthTime: "Birth Time",
    cityPlaceholder: "City",
    correctionHint:
      "Known cities are filled automatically. Open this if you need to correct the place.",
    errorFallback: "Generation failed",
    generate: "Generate Both",
    generating: "Generating",
    imagePromptLabel: "Image prompt seed",
    latitude: "Latitude",
    latitudePlaceholder: "39.90",
    longitude: "Longitude",
    longitudePlaceholder: "116.40",
    misread: "Misread",
    name: "Name",
    placeSuggestionsLabel: "City suggestions",
    pressure: "Pressure",
    relationship: "Relationship",
    image: "Image",
    sourceLabel: "Source",
    timezone: "Time Zone",
    timezonePlaceholder: "8",
    title: "Initial Hand",
  },
};

const defaultFormState: BirthFormState = {
  name: "Irin",
  birthDate: "2006-07-17",
  birthTime: "09:20",
  placeLabel: "",
  latitude: "",
  longitude: "",
  timeZoneOffsetHours: "8",
};

const field = (
  label: string,
  value: string,
  onChange: (value: string) => void,
  props: {
    list?: string;
    min?: string;
    placeholder?: string;
    step?: string;
    type?: string;
  } = {},
) => (
  <label className="initial-hand-field">
    <span>{label}</span>
    <input
      min={props.min}
      list={props.list}
      placeholder={props.placeholder}
      step={props.step}
      type={props.type ?? "text"}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  </label>
);

const buildImagePrompt = (initialHand: InitialHand) =>
  [
    initialHand.summary,
    ...initialHand.cards,
    ...initialHand.tags.map((tag) => tag.image),
  ].join(" / ");

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
  const imagePrompt = useMemo(
    () => (initialHand ? buildImagePrompt(initialHand) : ""),
    [initialHand],
  );

  const updateField = (key: keyof BirthFormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const updatePlace = (value: string) => {
    const birthPlace = lookupBirthPlace(value);

    setForm((current) => ({
      ...current,
      placeLabel: value,
      latitude: birthPlace ? String(birthPlace.latitude) : current.latitude,
      longitude: birthPlace ? String(birthPlace.longitude) : current.longitude,
      timeZoneOffsetHours: birthPlace?.timeZoneOffsetHours !== undefined
        ? String(birthPlace.timeZoneOffsetHours)
        : current.timeZoneOffsetHours,
    }));
  };

  const buildInput = () => {
    const latitude = Number(form.latitude);
    const longitude = Number(form.longitude);
    const timeZoneOffsetHours = Number(form.timeZoneOffsetHours);
    const hasBirthPlace =
      form.placeLabel.trim().length > 0 &&
      Number.isFinite(latitude) &&
      Number.isFinite(longitude);

    return {
      name: form.name.trim() || "April",
      birthDate: form.birthDate,
      birthTime: form.birthTime || undefined,
      birthPlace: hasBirthPlace
        ? {
            label: form.placeLabel.trim(),
            latitude,
            longitude,
            timeZoneOffsetHours: Number.isFinite(timeZoneOffsetHours)
              ? timeZoneOffsetHours
              : undefined,
          }
        : undefined,
    };
  };

  const generateInitialHand = async () => {
    setLoading(true);
    setError(null);

    try {
      const input = buildInput();
      const generateForLanguage = (outputLanguage: InitialHandOutputLanguage) =>
        apiUrl
          ? requestInitialHand({ apiUrl, input, outputLanguage })
          : Promise.resolve(createFallbackInitialHand(input, outputLanguage));
      const [zhInitialHand, enInitialHand] = await Promise.all(
        [generateForLanguage("zh"), generateForLanguage("en")],
      );

      setInitialHands({
        zh: zhInitialHand,
        en: enInitialHand,
      });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : copy.errorFallback);
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

      <div className="initial-hand-form">
        {field(copy.name, form.name, (value) => updateField("name", value))}
        {field(copy.birthDate, form.birthDate, (value) => updateField("birthDate", value), {
          type: "date",
        })}
        {field(copy.birthTime, form.birthTime, (value) => updateField("birthTime", value), {
          type: "time",
        })}
        {field(copy.birthCity, form.placeLabel, updatePlace, {
          list: "birth-place-suggestions",
          placeholder: copy.cityPlaceholder,
        })}
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
          {field(copy.latitude, form.latitude, (value) => updateField("latitude", value), {
            placeholder: copy.latitudePlaceholder,
            step: "0.01",
            type: "number",
          })}
          {field(copy.longitude, form.longitude, (value) => updateField("longitude", value), {
            placeholder: copy.longitudePlaceholder,
            step: "0.01",
            type: "number",
          })}
          {field(
            copy.timezone,
            form.timeZoneOffsetHours,
            (value) => updateField("timeZoneOffsetHours", value),
            {
              placeholder: copy.timezonePlaceholder,
              step: "1",
              type: "number",
            },
          )}
        </div>
      </details>

      {error ? <p className="initial-hand-error">{error}</p> : null}

      {initialHand ? (
        <div className="initial-hand-result">
          <div className="initial-hand-summary">
            <span>{copy.sourceLabel}: {initialHand.source}</span>
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
      ) : null}
    </section>
  );
}
