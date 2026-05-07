import {
  BookOpen,
  CalendarDays,
  Heart,
  Home,
  Moon,
  Radio,
  School,
  Sparkles,
  TrainFront,
  Waves,
} from "lucide-react";
import { aprilScenario } from "../game/world";

const timeSlots = [
  {
    id: "day",
    label: "白天",
    scene: "教室",
    icon: School,
    active: true,
    note: "现实压力开始显形。",
  },
  {
    id: "after-school",
    label: "放学后",
    scene: "海边路",
    icon: TrainFront,
    active: false,
    note: "关系会在路上偏移。",
  },
  {
    id: "night",
    label: "夜里",
    scene: "房间",
    icon: Moon,
    active: false,
    note: "信号更容易被听见。",
  },
];

const agentState = [
  { label: "压力", value: 64, tone: "rust" },
  { label: "孤独", value: 57, tone: "sea" },
  { label: "未来感", value: 38, tone: "moss" },
  { label: "自我感", value: 46, tone: "ink" },
];

const relationships = [
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
];

export function App() {
  return (
    <main className="shell">
      <section className="scene-panel">
        <div className="scene-header">
          <div>
            <p className="eyebrow">April Slice</p>
            <h1>{aprilScenario.title}</h1>
          </div>
          <span className="month-chip">
            <CalendarDays size={16} />
            四月 · 白天
          </span>
        </div>

        <nav className="time-strip" aria-label="April time slots">
          {timeSlots.map((slot) => {
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

        <div className="pixel-stage" aria-label="Seaside pixel stage">
          <div className="sun" />
          <div className="cloud cloud-left" />
          <div className="cloud cloud-right" />
          <div className="school-building">
            <span />
            <span />
            <span />
          </div>
          <div className="sea" />
          <div className="rail" />
          <div className="avatar">
            <div className="head" />
            <div className="hair" />
            <div className="body" />
            <div className="bag" />
            <div className="legs" />
          </div>
        </div>

        <div className="text-box">
          <Waves size={18} />
          <div>
            <p className="text-speaker">四月上旬 · 教室</p>
            <p>{aprilScenario.openingText}</p>
          </div>
        </div>

        <section className="action-dock" aria-label="Current play actions">
          <button type="button">
            <BookOpen size={17} />
            查看日记
          </button>
          <button type="button">
            <Heart size={17} />
            关系温度
          </button>
          <button type="button">
            <Sparkles size={17} />
            轻触碰
          </button>
          <button type="button">
            <Radio size={17} />
            留一句信号
          </button>
        </section>
      </section>

      <aside className="control-panel">
        <section className="side-section">
          <p className="eyebrow">Agent</p>
          <div className="agent-card">
            <div className="agent-avatar-mini">澪</div>
            <div>
              <h2>朝仓澪</h2>
              <p>
                17 岁。新学期第一周，她开始觉得这座小城像一件穿了太久的校服。
              </p>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-title">
            <Home size={18} />
            初始牌
          </div>
          <p>
            敏感 / 表达 / 抗拒束缚。她想被理解，却总在真正开口前先退半步。
          </p>
        </section>

        <section className="card">
          <p className="eyebrow">状态</p>
          <div className="stat-list">
            {agentState.map((state) => (
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
          <p className="eyebrow">关系温度</p>
          <div className="relationship-list">
            {relationships.map((relationship) => (
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
                    温度
                    <span className="mini-meter">
                      <i style={{ width: `${relationship.warmth}%` }} />
                    </span>
                  </label>
                  <label>
                    张力
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
    </main>
  );
}
