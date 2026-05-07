import {
  BookOpen,
  CalendarDays,
  Map,
  Heart,
  Home,
  Moon,
  Radio,
  School,
  Sparkles,
  TrainFront,
  Waves,
} from "lucide-react";
import { useState } from "react";
import { aprilScenario } from "../game/world";
import regionMapApril from "../assets/pixel/scenes/region_map_april.png";

type Language = "zh" | "en";

const timeIcons = {
  day: School,
  afterSchool: TrainFront,
  night: Moon,
};

const copy = {
  zh: {
    monthChip: "四月 · 白天",
    timeSlots: [
      {
        id: "day",
        label: "白天",
        scene: "教室",
        icon: timeIcons.day,
        active: true,
        note: "现实压力开始显形。",
      },
      {
        id: "after-school",
        label: "放学后",
        scene: "海边路",
        icon: timeIcons.afterSchool,
        active: false,
        note: "关系会在路上偏移。",
      },
      {
        id: "night",
        label: "夜里",
        scene: "房间",
        icon: timeIcons.night,
        active: false,
        note: "信号更容易被听见。",
      },
    ],
    speaker: "四月上旬 · 教室",
    actions: {
      map: "查看地图",
      diary: "查看日记",
      relationships: "关系温度",
      touch: "轻触碰",
      signal: "留一句信号",
    },
    regionMap: {
      title: "夏末沿海町",
      subtitle: "四月区域图",
      close: "关闭地图",
      hint: "第一版区域地图：山上神社、学校、住宅区、小车站、铁轨和海边路。",
      places: ["山上神社", "学校", "住宅区", "小车站", "商店街", "海边路"],
    },
    agentEyebrow: "Agent",
    agentName: "朝仓澪",
    avatarText: "澪",
    agentDescription:
      "17 岁。新学期第一周，她开始觉得这座小城像一件穿了太久的校服。",
    openingHandTitle: "初始牌",
    openingHand:
      "敏感 / 表达 / 抗拒束缚。她想被理解，却总在真正开口前先退半步。",
    stateTitle: "状态",
    agentState: [
      { label: "压力", value: 64, tone: "rust" },
      { label: "孤独", value: 57, tone: "sea" },
      { label: "未来感", value: 38, tone: "moss" },
      { label: "自我感", value: 46, tone: "ink" },
    ],
    relationshipTitle: "关系温度",
    warmthLabel: "温度",
    tensionLabel: "张力",
    relationships: [
      {
        name: "母亲",
        role: "家人",
        warmth: 62,
        tension: 74,
        note: "她没有逼问未来，但晚饭时总把你的碗放得很近。",
      },
      {
        name: "佐原",
        role: "同桌",
        warmth: 48,
        tension: 21,
        note: "他知道你在烦什么，却一直装作只是顺路去便利店。",
      },
      {
        name: "旧书店老板",
        role: "引路人",
        warmth: 36,
        tension: 8,
        note: "他记得你常借哪类书，只是从不主动说破。",
      },
    ],
  },
  en: {
    monthChip: "April · Day",
    timeSlots: [
      {
        id: "day",
        label: "Day",
        scene: "Classroom",
        icon: timeIcons.day,
        active: true,
        note: "The pressure of reality starts to show.",
      },
      {
        id: "after-school",
        label: "After School",
        scene: "Seaside Road",
        icon: timeIcons.afterSchool,
        active: false,
        note: "Relationships begin to drift on the way home.",
      },
      {
        id: "night",
        label: "Night",
        scene: "Bedroom",
        icon: timeIcons.night,
        active: false,
        note: "Signals are easier to hear after dark.",
      },
    ],
    speaker: "Early April · Classroom",
    actions: {
      map: "Map",
      diary: "Diary",
      relationships: "Relationship Warmth",
      touch: "Light Touch",
      signal: "Leave a Signal",
    },
    regionMap: {
      title: "Natsusue Coastal Town",
      subtitle: "April Region Map",
      close: "Close Map",
      hint: "First region map: hillside shrine, school, homes, station, railway, and seaside road.",
      places: [
        "Hillside Shrine",
        "School",
        "Residential Area",
        "Small Station",
        "Shopping Street",
        "Seaside Road",
      ],
    },
    agentEyebrow: "Agent",
    agentName: "Mio Asakura",
    avatarText: "Mio",
    agentDescription:
      "17 years old. In the first week of the new school year, the town starts to feel like a uniform she has worn for too long.",
    openingHandTitle: "Opening Hand",
    openingHand:
      "Sensitive / expressive / resistant to being contained. She wants to be understood, but steps back before she speaks plainly.",
    stateTitle: "State",
    agentState: [
      { label: "Pressure", value: 64, tone: "rust" },
      { label: "Loneliness", value: 57, tone: "sea" },
      { label: "Future Sense", value: 38, tone: "moss" },
      { label: "Self Sense", value: 46, tone: "ink" },
    ],
    relationshipTitle: "Relationship Warmth",
    warmthLabel: "Warmth",
    tensionLabel: "Tension",
    relationships: [
      {
        name: "Mother",
        role: "Family",
        warmth: 62,
        tension: 74,
        note: "She does not ask directly about the future, but always places the bowl close at dinner.",
      },
      {
        name: "Sahara",
        role: "Classmate",
        warmth: 48,
        tension: 21,
        note: "He seems to know something is wrong, but pretends the convenience store is just on the way.",
      },
      {
        name: "Old Bookshop Owner",
        role: "Guide",
        warmth: 36,
        tension: 8,
        note: "He remembers what kinds of books she borrows, but never says it first.",
      },
    ],
  },
} satisfies Record<Language, Record<string, unknown>>;

export function App() {
  const [language, setLanguage] = useState<Language>("zh");
  const [isMapOpen, setIsMapOpen] = useState(false);
  const text = copy[language];

  return (
    <main className="shell">
      <section className="scene-panel">
        <div className="scene-header">
          <div>
            <p className="eyebrow">April Slice</p>
            <h1>{aprilScenario.title}</h1>
          </div>
          <div className="top-controls">
            <div className="language-toggle" aria-label="Language switch">
              <button
                className={language === "zh" ? "is-active" : ""}
                onClick={() => setLanguage("zh")}
                type="button"
              >
                中文
              </button>
              <button
                className={language === "en" ? "is-active" : ""}
                onClick={() => setLanguage("en")}
                type="button"
              >
                EN
              </button>
            </div>
            <span className="month-chip">
              <CalendarDays size={16} />
              {text.monthChip}
            </span>
          </div>
        </div>

        <div className="pixel-stage" aria-label="Seaside pixel stage">
          <nav className="map-hud time-strip" aria-label="April time slots">
            {text.timeSlots.map((slot) => {
              const Icon = slot.icon;

              return (
                <article
                  className={`time-card ${slot.active ? "is-active" : ""}`}
                  key={slot.id}
                >
                  <div className="time-card-top">
                    <Icon size={18} />
                    <span>{slot.label}</span>
                  </div>
                  <strong>{slot.scene}</strong>
                  <small>{slot.note}</small>
                </article>
              );
            })}
          </nav>

          <div className="map-label">
            <span>{text.speaker}</span>
          </div>

          <div className="sea" />
          <div className="shoreline" />
          <div className="grass grass-top" />
          <div className="grass grass-bottom" />
          <div className="road road-left" />
          <div className="road road-bottom" />
          <div className="station">
            <div className="station-roof" />
            <div className="station-room" />
            <div className="bench" />
            <div className="vending-machine" />
          </div>
          <div className="tracks" />
          <div className="lamp lamp-left" />
          <div className="lamp lamp-right" />
          <div className="tree" />
          <div className="topdown-avatar">
            <span className="avatar-hair" />
            <span className="avatar-face" />
            <span className="avatar-body" />
          </div>
        </div>

        <div className="text-box">
          <Waves size={18} />
          <div>
            <p className="text-speaker">{text.speaker}</p>
            <p>{aprilScenario.openingText}</p>
          </div>
        </div>

        <section className="action-dock" aria-label="Current play actions">
          <button onClick={() => setIsMapOpen(true)} type="button">
            <Map size={17} />
            {text.actions.map}
          </button>
          <button type="button">
            <BookOpen size={17} />
            {text.actions.diary}
          </button>
          <button type="button">
            <Heart size={17} />
            {text.actions.relationships}
          </button>
          <button type="button">
            <Sparkles size={17} />
            {text.actions.touch}
          </button>
          <button type="button">
            <Radio size={17} />
            {text.actions.signal}
          </button>
        </section>
      </section>

      <aside className="control-panel">
        <section className="side-section">
          <p className="eyebrow">{text.agentEyebrow}</p>
          <div className="agent-card">
            <div className="agent-avatar-mini">{text.avatarText}</div>
            <div>
              <h2>{text.agentName}</h2>
              <p>{text.agentDescription}</p>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-title">
            <Home size={18} />
            {text.openingHandTitle}
          </div>
          <p>{text.openingHand}</p>
        </section>

        <section className="card">
          <p className="eyebrow">{text.stateTitle}</p>
          <div className="stat-list">
            {text.agentState.map((state) => (
              <div className="stat-row" key={state.label}>
                <div>
                  <span>{state.label}</span>
                  <strong>{state.value}</strong>
                </div>
                <div className="meter">
                  <span
                    className={`meter-fill tone-${state.tone}`}
                    style={{ width: `${state.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card relationships-card">
          <p className="eyebrow">{text.relationshipTitle}</p>
          <div className="relationship-list">
            {text.relationships.map((relationship) => (
              <article className="relationship" key={relationship.name}>
                <div className="relationship-head">
                  <div>
                    <strong>{relationship.name}</strong>
                    <small>{relationship.role}</small>
                  </div>
                  <span>{relationship.warmth}°</span>
                </div>
                <div className="relationship-bars">
                  <label>
                    {text.warmthLabel}
                    <span className="mini-meter">
                      <i style={{ width: `${relationship.warmth}%` }} />
                    </span>
                  </label>
                  <label>
                    {text.tensionLabel}
                    <span className="mini-meter tension">
                      <i style={{ width: `${relationship.tension}%` }} />
                    </span>
                  </label>
                </div>
                <p>{relationship.note}</p>
              </article>
            ))}
          </div>
        </section>
      </aside>

      {isMapOpen ? (
        <section
          aria-label={text.regionMap.title}
          className="map-modal"
          role="dialog"
        >
          <div className="map-modal-card">
            <header className="map-modal-header">
              <div>
                <p className="eyebrow">{text.regionMap.subtitle}</p>
                <h2>{text.regionMap.title}</h2>
              </div>
              <button onClick={() => setIsMapOpen(false)} type="button">
                {text.regionMap.close}
              </button>
            </header>

            <div className="region-map-frame">
              <img alt={text.regionMap.title} src={regionMapApril} />
            </div>

            <footer className="map-modal-footer">
              <p>{text.regionMap.hint}</p>
              <div className="map-place-list">
                {text.regionMap.places.map((place) => (
                  <span key={place}>{place}</span>
                ))}
              </div>
            </footer>
          </div>
        </section>
      ) : null}
    </main>
  );
}
