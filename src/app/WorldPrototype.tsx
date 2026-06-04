import { Application } from "@pixi/react";
import { useState } from "react";
import { dayStartMinute } from "../agentMind/schedule";
import {
  DiaryView,
  InitialHandPanel,
  NoteEchoDialog,
  WorldClockView,
} from "../ui";
import { viewportSize } from "../world/data/worldConfig";
import { WorldStage } from "../world/presentation/WorldStage";
import { useWorldRuntime } from "../world/hooks/useWorldRuntime";
import { formatWorldMinute } from "../world/systems/time/worldTime";

const noteLimit = 48;

const fallbackDiaryParagraphs = [
  "今天好像没有什么特别的事。只是路经过窗边的时候，光把地板切成了几块。",
  "我还是照常回来了。房间里很安静，安静得像四月还没有真正开始。",
];

export function WorldPrototype() {
  const { state, actions } = useWorldRuntime();
  const { day, note, diary, agentState, echoEffect } = state;
  const [displayWorldMinute, setDisplayWorldMinute] = useState(dayStartMinute);

  const diaryParagraphs =
    diary.record && diary.record.diaryFragments.length > 0
      ? diary.record.diaryFragments
      : fallbackDiaryParagraphs;
  const traceSummary =
    diary.record?.echoes.map((echo) => echo.traceSummary).filter(Boolean).join(" / ") ||
    "纸页没有留下新的折痕。";

  return (
    <main className="world-prototype-shell">
      <div className="world-prototype-label" aria-hidden="true">
        April Slice world prototype
      </div>
      <section className="world-prototype-frame" aria-label="April Slice world prototype">
        <WorldClockView
          dayLabel={`Day ${day}`}
          timeLabel={formatWorldMinute(displayWorldMinute)}
        />
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
            paused={note.dialogOpen || diary.open}
            noteAvailable={note.available}
            agentState={agentState}
            echoEffect={echoEffect}
            onNotePicked={actions.openNotePaper}
            onDayComplete={actions.completeDay}
            onEchoEffectExpired={actions.clearEchoEffect}
            onWorldContextChanged={actions.recordWorldContext}
            onWorldMinuteChanged={setDisplayWorldMinute}
          />
        </Application>
      </section>
      <InitialHandPanel />
      {note.dialogOpen ? (
        <NoteEchoDialog
          ariaLabel="Note Echo"
          eyebrow="Echo"
          title="信纸"
          hint="写下一句很轻的话。投出去之后，世界不会立刻回答。"
          placeholder="把一句话留在这里..."
          draft={note.draft}
          limit={noteLimit}
          cancelLabel="放回"
          sendLabel="投出"
          canSend={note.draft.trim().length > 0}
          onDraftChange={actions.changeNoteDraft}
          onCancel={actions.cancelNotePaper}
          onSend={actions.sendNoteEcho}
        />
      ) : null}
      {diary.open ? (
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
          onClose={actions.closeDiary}
        />
      ) : null}
    </main>
  );
}
