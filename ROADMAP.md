# April Slice Roadmap — to Three.js Switch

This roadmap covers all work between the current state and the 2D-to-3D transition.
Source of truth for sequencing and acceptance gates. For product philosophy see `agent.md`. For working contract see `CLAUDE.md`.

Last updated: 2026-05-30.

---

## Operating principles (do not break)

1. **No phase advances until its acceptance gate passes**. If it does not pass, stop and rework — do not push forward to "make up for it later".
2. **No real LLM calls before Phase 1 closes**. The world must feel alive on rules + fakeResolver alone before LLM expression is wired in.
3. **No formal art before Phase 5**. Placeholder geometry / color blocks until the world loop is fully functional.
4. **No HUD numbers, ever**. State is private to the rules layer. Player perceives consequences, not values.
5. **Run state is authoritative**. UI reads from it, never owns parallel copies.
6. **Echoes never "work"**. They are signals; agent decides whether to hear them. Any feedback that says "you pressed and it responded" is a bug.

---

## Current state (Phase 0, complete)

- ✅ PixiJS world shell with tick loop, ref-based bodies, follow camera (lag 0.12)
- ✅ Node graph + A* pathfinding, 7 nodes (room / homeGate / schoolGate / classroom / cafeteria / station / harbor)
- ✅ Hardcoded agent schedule (7:30 wake → 7:50 leave → 8:30 classroom → 12:00 cafeteria → 15:30 after school → 17:00 home → 22:00 night)
- ✅ Agent moves autonomously along schedule via path traversal
- ✅ Player body with WASD movement
- ✅ State fields unified at 5 (`pressure / loneliness / futureSense / selfSense / trust`) via `AGENT_STATE_KEYS` single source of truth
- ✅ Rules layer complete (`stateDrift / relationshipDrift / echoResolution / dayRecord`) but not yet wired to the new world
- ✅ Layering rules contract added to `agent.md`

**File count**: ~22 source files, typecheck clean.

---

## Phase 1 — Echo loop closure (1–2 weeks)

Goal: First time Echo is a world interaction (not a button), and first time agent state visibly bends behavior.

### 1.0 Pre-flight cleanup (half day)

- [ ] Fix `getScheduleEntryForMinute` reduce fallback bug (give explicit initial value `agentSchedule[0]`).
- [ ] Add facing triangle to `drawAgent` so agent and player are visually distinguishable at distance.
- [ ] Replace Chinese string literals in `relationshipDrift.ts` (`"同桌"`, `"家人"`) with `RelationshipRole` enum.
- [ ] Remove old hardcoded house / school / sea rectangles from `worldRenderers.ts` if they no longer align with the node graph (or realign them).

### 1.1 Note paper as world object

- [ ] Add `WorldObject` type and a paper instance placed near the `room` node.
- [ ] Add interaction range detection: when player body is within radius of a `WorldObject`, surface an unobtrusive "press E" hint anchored to the object (not a HUD bar).
- [ ] Pressing E with paper in range opens `NoteEchoDialog` (reuse existing component).

### 1.2 Wire NotePaper to echoResolution

- [ ] Submitting note text constructs an `AgentBrainInput` (`event.kind = "note"`, `event.noteText`).
- [ ] Calls `resolveEchoOutcome(input, fakeResolver)`.
- [ ] Result writes back into a single `RunStateRef` (positions / camera in tick refs are separate; `RunStateRef` carries agent signal state, relationships, daily echoes used, recent reactions).
- [ ] After a successful echo, the paper is consumed (not respawned this day).

### 1.3 Agent reaction → behavior offset

This is the heart of Phase 1. State must visibly affect behavior.

- [ ] `agentMind/intent.ts` reads `currentState` and current `scheduleEntry` to produce an `AgentIntent`.
- [ ] Implement at least three offsets:
  - High `pressure` → `agentSpeed` reduced by 25%.
  - Low `trust` → before entering `classroom`, agent pauses at `schoolGate` for 30 game-seconds.
  - High `selfSense` → after-school path may detour via `harbor` instead of straight to `homeGate`.
- [ ] All offsets are derived from state alone, not from "did the player just send an echo". The signal goes via state changes, not direct triggers.

### 1.4 Day-end diary loop

- [ ] At 22:00 game time, when agent is back at `room`, surface `DiaryView` with the day's diary fragments (still produced by `fakeResolver`).
- [ ] Closing diary triggers `buildDayRecord` and persists run state to localStorage.
- [ ] Increment `gameDay` and reset day-scoped state (used echoes, daily windows).
- [ ] World minute resets to `dayStartMinute` for the next day.

### 1.5 First placeholder named NPC

- [ ] Add `Classmate` body with its own simple schedule (slightly out of phase with agent).
- [ ] NPC and agent path-cross at `schoolGate` or in `corridor` area.
- [ ] No echo handling on NPC yet — pure ambient. This is for "world is alive even when nothing is interactive".

### 1.6 Acceptance gate

Run the full chain end-to-end:

```
morning room → leaves home → school → echo (note paper) → agent behavior shifts subtly → after school → night room → diary surfaces → day rolls over
```

The whole chain has zero HUD numbers. Sit and play it for 10 minutes.

**Gate question**: did the agent's behavior shift after the echo feel *organic* (rooted in state) rather than *triggered* (rooted in the echo event itself)?

If yes — proceed to Phase 2.
If no — the offset logic in 1.3 needs more care before LLM expression is wired in. Do not proceed.

---

## Phase 2 — LLM brain integration (3–4 weeks)

Goal: Replace `fakeResolver` with a real LLM resolver. Agent expression starts to feel like a person, not a state machine.

### 2.1 Backend proxy (1 day)

- [ ] Create `worker/` directory with a Cloudflare Worker (40-line scope).
- [ ] Worker holds Anthropic API key as a secret, accepts POST from frontend, forwards to `/v1/messages`.
- [ ] Add basic per-IP rate limit and request size cap.
- [ ] Document deployment in `docs/llm.md`.

### 2.2 Astrology / BaZi seed system (3–5 days)

Choose one symbolic system and commit. Recommendation: Western astrology (sun + moon + rising + dominant element) for first version, because LLMs handle it most reliably.

- [ ] `game/initialHand.ts`: birth date → structured astrology fields (sun sign, moon sign, rising, dominant element).
- [ ] Compute locally — never let LLM "calculate" the chart, only interpret it.
- [ ] Convert structured fields into 5–7 `InitialHandTag` strings (e.g. "water-leaning silence", "April-born latecomer", "drawn to distance"). These are tone tokens, not personality labels.
- [ ] Tags enter the LLM prompt as expression bias only. Never enter rules layer (no "+1 introvert").

### 2.3 LLM resolver (1 week)

- [ ] `llm/promptBuilder.ts`: deterministic prompt assembly from `AgentBrainInput` + `InitialHandTag[]`.
- [ ] `llm/llmResolver.ts`: implements `EchoBrainResolver` interface, calls worker, parses with existing Zod schema, validates.
- [ ] Reaction selection: prompt provides allowed reaction set with state-derived probability hints. LLM picks one and renders.
- [ ] Fallback: if LLM call fails or output invalid, fall back to `fakeResolver` silently. Never break the day flow.
- [ ] Output length cap: ≤ 60 characters per outwardText, ≤ 4 short sentences per diary fragment.

### 2.4 Tone filter (3–4 days)

LLMs default to healing-tone prose. Reject it.

- [ ] `llm/toneFilter.ts`: post-processes LLM output before it reaches run state.
- [ ] Reject epiphany phrases ("she finally understood", "her heart warmed", "tears welled up").
- [ ] Reject three-act emotional summary patterns.
- [ ] If output is rejected, regenerate once with stronger negative prompt; if still bad, fall back to fakeResolver.
- [ ] Maintain `docs/tone-rejects.md` with examples encountered in playtests.

### 2.5 Continuity (3–5 days)

Agent must remember across days, but only what should leak through.

- [ ] `BrainMemory`: last 3 diary fragments (visible) + last 3 internal thoughts (hidden) + last 5 reactions.
- [ ] Internal thoughts are written by LLM, stored in run state, fed back into next day's prompt — never shown to player.
- [ ] Per-relationship memory: each named NPC has up to 5 FIFO interaction notes.

### 2.6 Acceptance gate

- [ ] Generate three different agents from three different real birth dates.
- [ ] Run each through the same Day 1 with the same player echoes.
- [ ] Read all three diary fragments side by side.

**Gate question**: are the three agents *recognizably different people*, not three skins on the same chatbot?

If yes — proceed to Phase 3.
If no — prompt and tag work needs more iteration. Do not proceed.

---

## Phase 3 — World density (2–3 weeks)

Goal: The world stops being a graph of seven points. It starts having weather, calendar, ambient detail, and a second NPC.

### 3.1 Weather state machine

- [ ] `world/weather.ts`: clear / overcast / rain / sea fog. Transitions per day, persisted in run state.
- [ ] Weather affects `agentMind/intent.ts`: rain reduces detour to harbor probability, fog raises `loneliness` slightly at day start.
- [ ] Weather is rendered as ambient (color cast over the world, not an icon).

### 3.2 Cultural calendar

- [ ] `world/calendar.ts`: April day-of-month → context tags ("first week of new term", "cherry peak", "exam approaching").
- [ ] Tags affect base `pressure` for the day and enter LLM prompt as ambient context.

### 3.3 Second named NPC

- [ ] Add `Family` body (parent or sibling), present at `room` or near home in mornings and evenings.
- [ ] Implements relationship state with `warmth` and `tension`.
- [ ] First place where `relationshipDrift` actually mutates between days.

### 3.4 Ambient detail layer

- [ ] Each node has a `detailRotation`: small text fragments that LLM can quote when agent passes through ("the wind chime is missing today", "someone left a paperback on the bench").
- [ ] One detail per node per day, rotates so repeated walks are not identical.

### 3.5 April-end dramatic anchor

- [ ] Decide on one anchor: a letter not sent, a train someone might miss, an unsaid sentence in a corridor.
- [ ] Plant a faint reference to it from Day 1 (a timetable, an envelope on the desk, a name half-heard).
- [ ] LLM prompt context includes the anchor's existence so diary fragments can subtly orbit it.

### 3.6 Acceptance gate

- [ ] Two different agents (different birth dates) play the same Day 1–7.
- [ ] Compare their diary timelines.

**Gate question**: do the two timelines reveal *different people walking through the same April*, not two playthroughs of the same script?

If yes — proceed to Phase 4.
If no — density layers need more variation. Do not proceed.

---

## Phase 4 — Full 30-day structure (2–3 weeks)

Goal: From a working day to a working month. The arc completes.

### 4.1 Day counter and rollover

- [ ] `gameDay` from 1 to 30 in run state.
- [ ] Each day at rollover: reset echoes, advance calendar, persist state.
- [ ] Long-arc state drift accumulates (slow shifts in `selfSense` and `horizon` over weeks).

### 4.2 Per-day Echo budget

- [ ] 2 base echoes + 0–2 agent-granted Echo Windows per day, computed by `getDailyWindowProfile`.
- [ ] Windows are rendered as ambient cues only (an extra paper appears on a desk, a window stays open) — never numerical UI.

### 4.3 Long-term memory and drift

- [ ] `BrainMemory.recentDiary` extends but caps at last N days; older entries summarized into a single "month so far" string fed to LLM.
- [ ] Relationship memory stays per-NPC, FIFO.

### 4.4 Single-slot autosave

- [ ] One save slot per agent. No quickload. No multi-slot save.
- [ ] Save triggers: day rollover, app close, explicit "step away" action.
- [ ] When April ends, save is sealed — reopening returns the player to the closing screen, not a replay state.

### 4.5 April-end closure screen

- [ ] On Day 30 night, after final diary, surface a closing screen.
- [ ] Not a score. Not a list of achievements. A short prose passage built from the run's emotional shape (most-used echoes, last reaction tag, anchor outcome).
- [ ] Exit returns to the main menu. The agent's save remains visible but locked.

### 4.6 Acceptance gate

- [ ] One full 30-day playthrough by you, then one by a friend who has not seen the project.
- [ ] After the friend finishes, ask them: "describe this person to me as if she were real."

**Gate question**: can the friend describe the agent in their own words, with at least two specific moments they remember?

If yes — proceed to Phase 5.
If no — the long arc is not landing. Find which week loses them, then iterate.

---

## Phase 5 — 2D polish before 3D (2 weeks)

Goal: The 2D version reaches its emotional ceiling. After this it makes sense to invest in 3D, not before.

### 5.1 First real pixel sprites

- [ ] Agent and player walk cycles (4-frame minimum).
- [ ] Idle and pause frames (especially the "she stands still and looks at nothing" beat).
- [ ] Replace the capsule placeholders.

### 5.2 Top-down map art pass

- [ ] Replace the colored rectangles with hand-drawn or asset-based scene tiles.
- [ ] Cherry blossom in the corner of at least one scene, rendered as low-frame animation, not CSS.
- [ ] Night variants of all scenes (dark palette, lamp glow).

### 5.3 Sound design (low budget, high return)

- [ ] Footstep sounds (different per surface: tatami / road / school floor).
- [ ] Ambient: distant train, wind, paper rustle.
- [ ] No music yet, or a single subtle ambient bed.

### 5.4 First-ten-minutes design pass

- [ ] Setup: birth date / name / gender input. One-line atmospheric output ("the night you were born, there was sea fog"). No chart UI.
- [ ] Wordless opening shot: dawn coast, distant rails, room with curtain light. No UI.
- [ ] Agent wakes. One internal-thought line. She does not get up.
- [ ] Two faint dots appear and a single line: "today you can reach her twice."
- [ ] First echo opportunity. The first echo *must* not produce exactly what the player expects. This is the comprehension moment.

### 5.5 Closing playtest with strangers

- [ ] Five strangers, ~30 minutes each.
- [ ] After play, ask each:
  1. Describe the agent in your own words.
  2. Was there a moment that surprised you?
  3. Do you want to play again?

**Gate question (final 2D gate)**: did at least one of the five have a "throat tightens" moment?

If yes — 2D phase complete. Proceed to Three.js transition.
If no — there is a wrongness somewhere in atmosphere or rhythm. Do not proceed to 3D until this is resolved. 3D will not save it; 3D will amplify it.

---

## Phase 6 — Three.js transition kickoff (handoff, not in this roadmap)

When all gates above pass, start the Three.js track in a separate roadmap. The handoff principle:

**Keep**: `game/`, `llm/`, `agentMind/`, `world/worldGraph.ts`.
**Replace**: `world/WorldStage.tsx`, `world/worldRenderers.ts`, `entities/body.ts` (add z), `entities/camera.ts` (perspective + lag).

First Three.js milestone is the same as Week 1 was for PixiJS: a white-box scene with a capsule agent and a capsule player, follow camera, WASD only. If "in 3D space" feeling is not stronger than 2D after that milestone — fix camera and lighting first, do not pour art on it.

That track is documented separately when this one closes.

---

## Estimated total duration

| Phase | Weeks |
|---|---|
| 1 — Echo loop closure | 1–2 |
| 2 — LLM brain integration | 3–4 |
| 3 — World density | 2–3 |
| 4 — Full 30-day structure | 2–3 |
| 5 — 2D polish | 2 |
| **Total to 3D transition** | **10–14 weeks (~3 months)** |

This is a solo-developer estimate, college schedule allowing. Treat it as a target, not a deadline. Acceptance gates outrank schedule.

---

## What this roadmap deliberately leaves out

- Final 3D production
- Steam release prep
- Marketing / devlog cadence
- Multiple agent presets / preset library
- Twelve-month full year arc
- Multiplayer / sharing
- Soundtrack composition
- Achievements
- Formal astrology engine (only the LLM-interpreted version above)
- RL / IRL experiments (research branch, not core path)

These belong to post-3D-transition work, or are deliberately out of scope for the project.
