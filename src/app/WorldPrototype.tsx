import { Application } from "@pixi/react";
import { useRef, useState } from "react";
import { buildDayRecord, type DayRecord } from "../game/dayRecord";
import { type DailyEchoRecord, resolveEchoOutcome } from "../game/echoResolution";
import type { AgentSignalState } from "../game/agentState";
import type { RelationshipState } from "../game/relationshipDrift";
import { resolveAgentBrainFake } from "../llm/fakeResolver";
import { DiaryView } from "../ui/DiaryView";
import { NoteEchoDialog } from "../ui/NoteEchoDialog";
import { viewportSize } from "../world/data/worldConfig";
import { type EchoBehaviorEffect, WorldStage } from "../world/presentation/WorldStage";

const noteLimit = 48;

const initialAgentState: AgentSignalState = {
  pressure: 64,
  loneliness: 56,
  futureSense: 45,
  selfSense: 52,
  trust: 50,
};

const initialRelationships: RelationshipState[] = [
  {
    id: "mina",
    name: "Mina",
    role: "Classmate",
    roleKey: "classmate",
    warmth: 42,
    tension: 36,
    note: "同路时会点头，但还没有真正说上话。",
  },
  {
    id: "family",
    name: "Mother",
    role: "Family",
    roleKey: "family",
    warmth: 54,
    tension: 44,
    note: "早晨的餐桌安静得像一张没有寄出的明信片。",
  },
  {
    id: "guide",
    name: "Station Light",
    role: "Guide",
    roleKey: "guide",
    warmth: 38,
    tension: 24,
    note: "远处的铁轨像是在替她记住离开的方向。",
  },
];

const fallbackDiaryParagraphs = [
  "今天好像没有什么特别的事。只是路经过窗边的时候，光把地板切成了几块。",
  "我还是照常回来了。房间里很安静，安静得像四月还没有真正开始。",
];

export function WorldPrototype() {
  const [day, setDay] = useState(1);
  const [noteAvailable, setNoteAvailable] = useState(true);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [diaryOpen, setDiaryOpen] = useState(false);
  const [diaryRecord, setDiaryRecord] = useState<DayRecord | null>(null);
  const [agentState, setAgentState] = useState<AgentSignalState>(initialAgentState);
  const [relationships, setRelationships] =
    useState<RelationshipState[]>(initialRelationships);
  const [dailyEchoes, setDailyEchoes] = useState<DailyEchoRecord[]>([]);
  const [echoEffect, setEchoEffect] = useState<EchoBehaviorEffect | null>(null);

  const agentStateRef = useRef(agentState);
  const relationshipsRef = useRef(relationships);
  const dailyEchoesRef = useRef(dailyEchoes);
  const dayStateStartRef = useRef(initialAgentState);
  const dayRelationshipsStartRef = useRef(initialRelationships);

  const commitAgentState = (nextState: AgentSignalState) => {
    agentStateRef.current = nextState;
    setAgentState(nextState);
  };

  const commitRelationships = (nextRelationships: RelationshipState[]) => {
    relationshipsRef.current = nextRelationships;
    setRelationships(nextRelationships);
  };

  const commitDailyEchoes = (nextEchoes: DailyEchoRecord[]) => {
    dailyEchoesRef.current = nextEchoes;
    setDailyEchoes(nextEchoes);
  };

  const openNotePaper = () => {
    setNoteAvailable(false);
    setNoteDraft("");
    setNoteDialogOpen(true);
  };

  const cancelNotePaper = () => {
    setNoteDialogOpen(false);
    setNoteDraft("");
    setNoteAvailable(true);
  };

  const sendNoteEcho = () => {
    const noteText = noteDraft.trim();

    if (!noteText) {
      return;
    }

    const input = {
      language: "zh" as const,
      profile: {
        id: "april-agent",
        name: "April",
        age: 17,
        summary: "海边小镇四月里的高中生，习惯把想法藏在动作里。",
        keywords: ["四月", "海边", "放学路", "迟疑"],
      },
      openingHand: {
        summary: "她更容易被轻一点、短一点的靠近打动。",
        cards: ["Page of Cups", "The Moon", "Six of Swords"],
      },
      currentState: agentStateRef.current,
      relationships: relationshipsRef.current,
      dayContext: {
        day,
        timeOfDay: "morning",
        scene: "room",
        visitedScenes: ["room"],
      },
      echoContext: {
        baseEchoes: 2,
        extraWindows: 0,
        usedEchoes: dailyEchoesRef.current.length,
        remainingEchoes: Math.max(0, 2 - dailyEchoesRef.current.length),
        noteEcho: noteText,
        spatialTraces: [],
      },
      memory: {
        recentDiary: dailyEchoesRef.current.map((echo) => echo.diaryFragment).slice(-3),
        recentReactions: dailyEchoesRef.current.map((echo) => echo.reaction).slice(-3),
      },
      event: {
        kind: "note" as const,
        noteText,
        scene: "room",
      },
    };

    const resolution = resolveEchoOutcome(input, resolveAgentBrainFake);
    const nextEchoes = [...dailyEchoesRef.current, resolution.record];

    commitAgentState(resolution.stateDrift.nextState);
    commitRelationships(resolution.relationshipDrift.nextRelationships);
    commitDailyEchoes(nextEchoes);
    setEchoEffect({
      id: resolution.record.id,
      reaction: resolution.record.reaction,
    });
    setNoteDialogOpen(false);
    setNoteDraft("");
  };

  const completeDay = () => {
    if (diaryOpen) {
      return;
    }

    setDiaryRecord(
      buildDayRecord({
        day,
        visitedScenes: ["room", "homeGate", "schoolGate", "classroom", "cafeteria", "station"],
        echoes: dailyEchoesRef.current,
        stateStart: dayStateStartRef.current,
        stateEnd: agentStateRef.current,
        relationshipsStart: dayRelationshipsStartRef.current,
        relationshipsEnd: relationshipsRef.current,
      }),
    );
    setDiaryOpen(true);
  };

  const closeDiary = () => {
    dayStateStartRef.current = agentStateRef.current;
    dayRelationshipsStartRef.current = relationshipsRef.current;
    commitDailyEchoes([]);
    setDiaryOpen(false);
    setDiaryRecord(null);
    setEchoEffect(null);
    setNoteAvailable(true);
    setDay((currentDay) => currentDay + 1);
  };

  const diaryParagraphs =
    diaryRecord && diaryRecord.diaryFragments.length > 0
      ? diaryRecord.diaryFragments
      : fallbackDiaryParagraphs;
  const traceSummary =
    diaryRecord?.echoes.map((echo) => echo.traceSummary).filter(Boolean).join(" / ") ||
    "纸页没有留下新的折痕。";

  return (
    <main className="world-prototype-shell">
      <div className="world-prototype-label" aria-hidden="true">
        April Slice world prototype
      </div>
      <section className="world-prototype-frame" aria-label="April Slice world prototype">
        <Application
          background={0x20251f}
          width={viewportSize.width}
          height={viewportSize.height}
          antialias={false}
          autoDensity
          resolution={window.devicePixelRatio || 1}
          className="world-prototype-canvas"
        >
          <WorldStage
            day={day}
            paused={noteDialogOpen || diaryOpen}
            noteAvailable={noteAvailable}
            agentState={agentState}
            echoEffect={echoEffect}
            onNotePicked={openNotePaper}
            onDayComplete={completeDay}
          />
        </Application>
      </section>
      {noteDialogOpen ? (
        <NoteEchoDialog
          ariaLabel="Note Echo"
          eyebrow="Echo"
          title="信纸"
          hint="写下一句很轻的话。投出去之后，世界不会立刻回答。"
          placeholder="把一句话留在这里..."
          draft={noteDraft}
          limit={noteLimit}
          cancelLabel="放回"
          sendLabel="投出"
          canSend={noteDraft.trim().length > 0}
          onDraftChange={setNoteDraft}
          onCancel={cancelNotePaper}
          onSend={sendNoteEcho}
        />
      ) : null}
      {diaryOpen ? (
        <DiaryView
          ariaLabel="Diary"
          eyebrow="Diary"
          title="夜里的纸页"
          closeLabel="合上"
          meta={["四月", "海边小镇", "房间"]}
          hint="灯暗下来以后，她把白天剩下的一点声音写进纸里。"
          entryDate="四月的某个夜晚"
          paragraphs={diaryParagraphs}
          traceLabel="留下的痕迹"
          traceSummary={traceSummary}
          footer="合上以后，第二个清晨会自己开始。"
          onClose={closeDiary}
        />
      ) : null}
    </main>
  );
}
