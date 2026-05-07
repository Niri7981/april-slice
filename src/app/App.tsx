import { CalendarDays, Radio, Waves } from "lucide-react";
import { aprilScenario } from "../game/world";

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
            April
          </span>
        </div>

        <div className="pixel-stage" aria-label="Seaside pixel stage">
          <div className="sun" />
          <div className="cloud cloud-left" />
          <div className="cloud cloud-right" />
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
          <p>{aprilScenario.openingText}</p>
        </div>
      </section>

      <aside className="control-panel">
        <section>
          <p className="eyebrow">Game Loop</p>
          <h2>One playable month</h2>
          <ol className="phase-list">
            {aprilScenario.phases.map((phase) => (
              <li key={phase}>{phase}</li>
            ))}
          </ol>
        </section>

        <section className="card">
          <div className="card-title">
            <Radio size={18} />
            Player role
          </div>
          <p>
            You are a quiet outside signal. You can observe, touch, and leave a
            sentence, but the agent chooses how to live through April.
          </p>
        </section>

        <section className="card">
          <p className="eyebrow">Next Build Step</p>
          <p>
            Define the data model, then replace this placeholder with the
            setup, investigation, intervention, prediction, and result phases.
          </p>
        </section>
      </aside>
    </main>
  );
}
