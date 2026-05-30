# Fate Agent MVP

## Project Definition

Fate Agent is a browser-playable agent experiment game.

The player creates an agent from a birth date, name, and a small amount of background context. The birth date is treated as an initial hand, not a final destiny. The agent enters a quiet Japanese seaside youth world and makes its own choices with help from an LLM.

The player can observe, investigate, lightly touch, and send rare mysterious signals. The player can influence the agent, but cannot directly control the agent.

Core feeling:

> You can reach them, but you cannot live for them.

## April Slice Product Constitution v0.1

April Slice is a quiet, restrained, damp, everyday, faintly uneasy Japanese youth agent experiment game.

It is not a loud RPG, a romance route game, a fortune-telling report, or a player-controlled life simulator. It is a playable slice of youth fiction: the player places a person with an initial destiny hand into April in a small seaside town, then watches how they slowly come alive through daily places, relationships, hesitation, and the feeling that departure is somewhere ahead.

Destiny should feel like sea wind. It is always present, but it should not announce itself from the front of the stage.

### What This Game Is

- A playable coming-of-age short story.
- An experiment in how personality, pressure, and relationship patterns drift over time.
- A small-town fate slice, not a grand adventure.
- A game about understanding someone, not optimizing them.
- A world where small actions leave emotional traces.

### What This Game Is Not

- Not a high-energy school adventure.
- Not a high-skill pixel RPG.
- Not a multi-route romance visual novel.
- Not a pure visual novel.
- Not an astrology or BaZi report tool.
- Not a fantasy of controlling another person's life.

### Who The Player Is

The player is not the protagonist. The player is not God.

The player is a presence that can lightly touch this life. They can get close, guide attention, leave signals, and sometimes influence what the agent notices or avoids. They cannot live for the agent.

The intended player feeling:

```text
I can reach them.
I can influence them.
I may understand them, or misunderstand them.
I cannot replace their life with my will.
```

### Echo Rule

The player's limited influence resource is called Echo.

An Echo is not an action point or a command token. It is one chance to leave a slight presence in the agent's day.

In the first playable version, each in-game day gives the player 2 base Echoes. These are the minimum companionship windows: the player can always try to reach the agent at least twice.

Additional Echoes are not the player's right. They are Echo Windows opened by the agent. Depending on the agent's openness, pressure, trust, relationships, weather, scene mood, and initial hand, the agent may allow 0-2 extra Echoes that day.

Daily Echo rule:

```text
Base Echoes: 2
Agent-granted Echo Windows: 0-2
Daily typical range: 2-3
Daily maximum: 4
```

This should feel like real interaction. Sometimes the player wants to comfort or guide someone, but the agent does not give them a chance to come closer. Other days, the agent may quietly open one more window.

An Echo may be used to:

- Write a short note to the agent.
- Guide the agent toward a place.
- Draw the agent's attention to an object.
- Lightly touch an emotion.
- Encourage the agent to approach a person.
- Choose to do nothing and preserve distance.

First-version Echo forms:

- Note Echo: the player writes a short sentence on a paper-note UI. This text enters the LLM context as a signal from the player, not as an instruction the agent must obey.
- Spatial Echo: the player points the agent toward a place, object, or person in the scene. This creates an intention such as "go to the classroom door", "look at the blackboard", or "approach the classmate". The agent may follow, hesitate, redirect, or refuse.

After all available Echoes are used, the player can still observe, read, and understand, but cannot keep pushing the agent's actions that day.

Every Echo remains a signal, not a command. The agent may accept it, hesitate over it, misread it, resist it, delay it, or transform it into a choice of their own.

### Who The Agent Is

The agent is not a tool, an avatar, or a player puppet. The agent is an embodied pixel person with their own pace, misunderstandings, hesitation, pride, and destiny inertia.

The agent may accept the player's signal, resist it, delay it, misread it, or suddenly make a decision that feels unmistakably like them.

### What The World Should Feel Like

The world should be small, true, and worth passing through more than once.

Core places:

- A seaside town.
- A school.
- A road after class.
- A small station.
- A railway.
- A room at night.
- A hillside shrine.
- Distant mountains.
- A sea that is always there.

The world should make the player feel that the agent may walk the same road every day, while carrying a slightly different heart each time.

### Time And Emotion

Time should feel slow, but not empty.

- Daytime: reality pushes people forward.
- After school: relationships and hidden thoughts begin to drift.
- Night: the agent's private self rises closer to the surface.

The emotional rhythm is:

```text
daily life begins
  -> something feels slightly wrong
  -> relationships move closer or miss each other
  -> the player tries to touch the moment
  -> the agent answers in their own way
  -> small events leave traces
  -> April ends, and returning to the original state is no longer possible
```

### Visual Direction

The visual direction is low-saturation top-down pixel art, like a late-1990s to early-2000s Japanese local town, but quieter and more literary.

The point is not retro pixel style by itself. The point is to make a place worth staying in.

Prefer:

- Cherry blossoms.
- Seaside roads.
- Railway lines.
- Old residential streets.
- Classroom window light.
- Night desk lamps.
- Empty lots and negative space.

Avoid:

- Overly bright colors.
- Overly busy adventure-map composition.
- Tech-heavy UI.
- Cute mascot energy.
- Loud supernatural presentation.

### Role Of Destiny Systems

Astrology and Ten Gods / BaZi-style readings are background gravity. They seed the initial hand: temperament, pressure patterns, relationship instincts, emotional biases, and recurring stuck points.

They should explain why the agent tends to interpret, avoid, desire, or fail in certain ways. They should not announce the ending. The ending is something the agent walks into.

Internal product statement:

> This is a Japanese youth agent experiment game. Destiny is not the answer; it is the opening hand. The player places a person into April in a seaside town and accompanies them through school, the road after class, the room at night, and relationships left unsaid. The player can lightly touch them, but cannot live for them. What forms is not a report, but a slowly growing slice of life.

## Product Theme

April Slice is not a traditional RPG where the player appears as a second visible character. The agent is the only embodied player-facing character in the scene: a small pixel person who can walk through school corridors, classrooms, seaside roads, train stations, and rooms at night.

The player accompanies the agent in another form. The player is best understood as a signal, intention, or quiet companion layer around the agent, not as a separate body in the world.

The player may guide movement, click places, notice objects, leave a sentence, or make a light touch, but the fiction should preserve the agent as an independent person. The player can guide and influence the agent, but cannot directly control the agent. The player can influence attention and possibility; the player does not own the agent's life.

The initial hand is created from the agent's birth date. Astrology and Ten Gods / BaZi-style readings can be used as symbolic systems to seed temperament, pressure patterns, relationship instincts, and emotional biases. These readings are not deterministic fate. They are the agent's opening cards.

First-version principle:

```text
Birth date -> initial hand
Initial hand -> agent tendencies
Player -> signal / intention / companionship
Agent -> embodied pixel person with autonomy
World -> quiet, explorable emotional space
```

The long-term goal is to make the agent feel like a person moving through a small world, not a menu responding to prompts. The player should feel close to the agent without becoming the agent.

## MVP Scope

The first playable MVP is a single-month slice.

Working title:

`April Slice`

The MVP covers one playable month in a small seaside town. The goal is not to simulate a full year yet. The goal is to prove the core play loop:

1. Create an agent.
2. Enter the April scenario.
3. Investigate diary, relationships, state, and destiny card.
4. Apply one light touch.
5. Send one mysterious signal.
6. Predict what the agent will do.
7. Let the LLM decide as the agent.
8. Resolve the month.
9. Review what happened and whether the player understood the agent.

If this one month works, the twelve-month version can reuse the same structure with different monthly scenarios.

## Product Pillars

- Destiny is the opening hand, not the ending.
- The agent has its own mind.
- The player is a mysterious influence, not a direct controller.
- The world is small, slow, relational, and emotionally dense.
- The game is about understanding, not optimizing.

## World Direction

The first world is a quiet Japanese seaside youth setting.

Tone references:

- Small coastal town
- New school year
- Graduation pressure in the distance
- Family expectations
- Quiet friendships
- Unspoken attraction
- Train stations, sea roads, classrooms, rooms at night
- Low-saturation pixel art, ordinary people, restrained emotion

The first month is April.

April theme:

> The agent begins to feel that life cannot stay exactly as it is.

## Player Role

The player is a mysterious outside presence.

For the browser-playable version, the player should not appear as a separate sprite. The visible body belongs to the agent. The player's presence is expressed through inputs, signals, environmental attention, and subtle interventions.

The player can touch the agent through:

- A dream
- A letter
- A page in a book
- An old photo
- Sea wind

The player input is always a signal, not a command. Even when early prototypes use direct keyboard movement for testing, the product fiction should treat movement as guidance that the agent may later accept, hesitate over, reinterpret, or resist.

The agent may:

- Receive it
- Misunderstand it
- Resist it
- Ignore it
- Understand it later

## Core Play Loop

The MVP uses a phase-based game loop:

```text
setup
  -> opening
  -> investigation
  -> light_touch
  -> intervention
  -> prediction
  -> agent_turn
  -> result
```

### Setup

Player enters:

- API key
- Agent name
- Birth date
- Optional hobby
- Optional family background

System creates:

- Destiny seed
- Agent profile
- Initial state
- Initial relationships
- April scenario

### Opening

The player sees:

- Pixel scene
- Agent sprite placeholder
- April opening text
- Current pressure
- Starting diary fragment

### Investigation

Player can inspect:

- Diary
- Relationships
- State
- Destiny card
- Month pressure

This phase lets the player read the agent before trying to influence them.

### Light Touch

Player chooses one small influence:

- Make them think of home
- Make them notice someone
- Make them walk by the sea
- Make them open an old book
- Do nothing

Light touch affects attention, not destiny.

### Intervention

Player chooses a medium and writes one sentence.

Medium options:

- Dream
- Letter
- Book page
- Old photo
- Sea wind

The sentence enters the agent decision context.

### Prediction

Player predicts how the agent will respond to the month's pressure.

Example prediction options:

- Avoid talking about the future
- Talk honestly with family
- Tell a friend what they really feel
- Go to the sea alone and decide something

The player does not choose the action. The player predicts the action.

### Agent Turn

The LLM receives:

- Agent profile
- Destiny seed
- Current state
- Relationships
- Diary fragments
- World context
- April scenario
- Player light touch
- Player signal
- Player prediction

The LLM returns a structured month decision.

### Result

The system validates and resolves the LLM result.

The player sees:

- What happened this month
- What the agent chose
- Why the agent chose it
- Whether the signal was received
- How the signal was interpreted
- Whether the prediction matched
- State changes
- Relationship changes
- Next-month foreshadowing

## Technical Direction

April Slice is a local-first browser world simulation.

The mainline is not "React game screens."

The mainline is:

- A continuous world
- A real update loop
- Player and agent as world entities
- Local rules as gameplay truth
- LLM as expression only
- UI as a thin overlay

Current technical direction:

- `Vite` for build and dev workflow
- `TypeScript` for all gameplay contracts
- `PixiJS` for the 2D world presentation layer
- Minimal `React` for shell UI only
- `localStorage` for local saves
- Local fake resolver before real LLM integration

Future 3D direction:

- `Three.js` for 3D world rendering
- `Rapier` for physics if needed
- `Howler.js` for audio
- `GSAP` for camera and world motion polish
- `Blender -> glTF/GLB` as the content pipeline

No backend is required for the world-first prototype.

## Architecture Principle

The LLM is not the game engine.

The local engine owns world truth.

The world layer owns movement, timing, presence, triggers, and scheduling.

The rules layer owns run truth, state drift, relationship drift, echo resolution, and day records.

The LLM layer only writes expression:

- behavior wording
- diary fragments
- internal thought
- tone shaping

The LLM must not decide gameplay truth or raw values.

## UI Boundary

UI layers must handle presentation and interaction only.

That means UI can:

- Render current game state
- Collect player input
- Open and close panels
- Play animations and transitions
- Dispatch actions into the local game engine

UI must not own business truth.

That means UI should not decide:

- How state changes
- How relationships change
- Whether an Echo is valid
- How a day resolves
- What gets saved
- What counts as the current run truth

The goal is to keep the interface replaceable.

The 2D shell, a future 3D shell, or any debug tool should all be able to sit on top of the same gameplay logic without rewriting the rules.

UI is not the world.

World movement, agent scheduling, collision/trigger checks, and time progression must not live in UI components.

## Run State

Run state means the single source of truth for one playable run.

It is the complete local snapshot of "what is true right now" in the current April run.

Run state should contain, at minimum:

- Current day
- Current scene
- Current time of day
- Current agent state values
- Current relationships
- Echo traces and recent memory
- Daily echo records
- Day records
- Any other values needed to resume the run exactly

Run state is not a UI convenience object.

It is the authoritative gameplay state.

UI reads from run state.

The local game engine updates run state.

Save/load persists run state.

If a value matters for gameplay truth, it should live in run state or be derived from it.

## Mainline Technical Outline

This is the mainline we are building toward before any 3D rewrite.

### Presentation Layer

Purpose:
Show the world, accept input, and open lightweight overlays.

Core pieces:

- `PixiJS`
  Renders the 2D world, map, characters, objects, weather, and camera result.
- `React`
  Only for shell UI such as setup, note paper, diary view, and small menus.
- `Camera`
  Follows the player or shifts for events so the player feels physically present in one world.

### World Layer

Purpose:
Make the world actually run.

Core pieces:

- `tick loop`
  The main update loop. Each frame updates inputs, movement, time, triggers, and rendering in a stable order.
- `map / world graph`
  Real coordinates, regions, and connected places instead of React scene switching.
- `entities`
  World bodies such as `playerBody`, `agentBody`, and future echo objects or NPCs.
- `pathfinding`
  Lets the agent walk through the world instead of teleporting between scenes.
- `scheduler / calendar / time`
  Decides what time it is, where the agent should be, and when the day advances.
- `zone triggers / interaction points`
  Lets notes, objects, doors, and scene transitions happen through position in the world.
- `weather / ambience`
  Gives the world breathing room through light, atmosphere, seasonal cues, and environmental motion.

### Rules Layer

Purpose:
Own gameplay truth without caring how the world is rendered.

Core pieces:

- `runState`
  The authoritative snapshot for the current run.
- `stateDrift`
  Calculates how inner state changes after events.
- `relationshipDrift`
  Calculates how relationships change after events.
- `echoResolution`
  Resolves one echo and its consequences.
- `dayRecord`
  Produces the unified per-day settlement record.
- `saveState`
  Persists and restores the run safely.

### LLM Layer

Purpose:
Generate expression, not rules.

Core pieces:

- `brainTypes`
  Contract for what the model receives and returns.
- `fakeResolver`
  Local placeholder brain used until the world loop is stable.
- `llmResolver`
  Future real model entry point.
- `promptBuilder`
  Converts run state, memory, and day context into model input.
- `toneFilter`
  Keeps voice and output shape within the game tone.

### Asset Pipeline

Purpose:
Keep content production compatible with a world-first architecture.

Current 2D phase:

- Placeholder map tiles
- Placeholder characters
- Placeholder interaction markers
- Simple atmosphere effects

Future 3D phase:

- `Blender`
- `glTF / GLB`
- texture compression and runtime loading

## Current Priority

The current sprint priority is not more React UI.

The current sprint priority is to build the two missing ribs of the product:

- `World`
- `Presence`

That means the next major engineering steps are:

1. Clean gameplay types so there is only one truth.
2. Start `world/` and `entities/` scaffolding.
3. Turn the player into a real world entity.
4. Add camera and world graph.
5. Add agent schedule and pathfinding.
6. Reconnect the existing echo and memory rules back into the world.

## Folder Responsibilities

```text
src/app
  App shell only. No gameplay world truth.

src/ui
  Small overlay UI such as setup, note paper, and diary view.

src/world
  Tick loop, map, time, weather, and world systems.

src/entities
  Player body, agent body, camera, and world entity logic.

src/agentMind
  Schedule, intent, encounters, and behavior orchestration.

src/game
  Run state, save state, drift logic, echo resolution, and day records.

src/llm
  Brain contracts, fake resolver, future real resolver, prompt builder,
  and tone filtering.

src/assets
  Placeholder and future production world assets.

docs
  Product notes, prompt notes, and world references.
```

## Code Style And Layering Rules

This section is a hard contract for any contributor, human or AI. Violations are not matters of taste. They are architecture bugs. Read this before writing or accepting any patch.

### Why this section exists

April Slice is a layered system. The product depends on each layer staying inside its own job. When layers leak into each other, the codebase turns into one expanding file that nobody can reason about. A few sloppy weeks here are expensive to undo later.

These rules are not about elegance. They exist so the project can swap the LLM, move from 2D to 3D, or rewrite the UI without rewriting the game.

### The four layers

```
Presentation:   PixiJS canvas + minimal React shell
World Layer:    tick / entities / camera / pathfinding / scheduler / agentMind
Rules Layer:    runState / stateDrift / relationshipDrift / echoResolution / dayRecord
LLM Layer:      brainTypes / fakeResolver / promptBuilder / toneFilter
```

**Strict direction of dependency:**

```
Presentation  →  World  →  Rules  →  LLM types
             (never the other way)
```

Upper layers may import lower layers. Lower layers must NOT import upper layers. If a lower layer needs to react to something, it returns data; the upper layer reads it.

### Folder ownership (do not violate)

| Folder | Owns | Must NOT contain |
|---|---|---|
| `src/app/` | React shell, `<Application>`, top-level layout | Game logic, agent decisions, state math, LLM calls |
| `src/world/` | Map graph, pathfinding, world config, world rendering, tick orchestration | React components beyond the canvas stage, business rules, state mutation logic, LLM calls |
| `src/entities/` | Pure data + pure functions on bodies (player / agent / NPC) | React, PixiJS imports beyond type, game-rule decisions |
| `src/agentMind/` | Agent intent: `(perception + state + schedule) → intent` | React, rendering, direct state mutation, LLM calls |
| `src/game/` | Run state schema, state drift rules, relationship rules, echo resolution, day record | React, PixiJS, LLM calls, world rendering |
| `src/llm/` | Prompt builders, resolver interfaces, response schemas, tone filters | React, world rendering, direct state mutation |
| `src/ui/` | React panels floating over the world (diary, note paper, day summary) | World tick, agent decisions, state math, direct LLM calls |
| `src/main.tsx` | App root only | Anything else |

### Mandatory rules

**R1. One file, one responsibility.**
A file does one of: define types / define pure functions / render one component / orchestrate one tick. Doing two means split it.

**R2. Pure first, side effects last.**
Game logic (drift, resolution, pathfinding, intent) must be pure: `(input) → output`. No global state, no React hooks, no `Date.now()`, no `Math.random()` inside. If randomness or time is needed, pass it in as a parameter.

**R3. State lives in one place per kind.**
- World-tick state (positions, camera, world minute): refs in the canvas stage.
- Run state (agent signal state, relationships, day records): the run state schema.
- UI ephemeral state (is a modal open): React `useState` in the component that owns the modal.

Do NOT duplicate the same fact across layers. If a value lives in run state, the UI reads it; the UI does not maintain a shadow copy.

**R4. No HUD numbers. Ever.**
State values are private to the rules layer. UI may render their downstream consequences (a curtain is open, the agent walks slower, a note paper has a fold) but never the raw number. Any `<span>{state.trust}</span>` is a bug.

**R5. The LLM never decides numbers.**
The LLM may produce diary text, outward behavior description, internal thought, and a reaction tag from a fixed enum. It must never set state values, relationship values, or day flags directly. Those are computed by `stateDrift` and `relationshipDrift` from the reaction tag plus context.

**R6. The world tick never re-renders React.**
At 60 fps, only PixiJS transforms move. React state changes only fire on semantic events: an echo lands, a day ends, a UI panel opens, or a setup form submits.

**R7. No god files.**
Soft cap 300 lines per file. At 500 lines it must be split. The previous `App.tsx` reached 2660 lines and had to be deleted whole. Do not let it happen again.

**R8. No inline business constants.**
Magic numbers (speeds, thresholds, durations, minute marks) live in a named constant at the top of the file or in a config module. `if (state.pressure > 72)` is wrong. `if (state.pressure > pressureLockThreshold)` is right.

**R9. Types are the contract.**
If two layers exchange data, the shape must be a named exported type, not an inline object literal. Adding a field to `AgentBrainInput` should be a single line change.

**R10. Prompt and context rules have one source of truth.**
Prompts, context-control rules, tone rules, output schemas, and model-facing constraints must be defined once and reused. Do not copy a prompt into a Worker, resolver, test helper, or UI file when a prompt builder already exists. A Worker may call `buildInitialHandPrompt({ chart })`; it must not rewrite its own Initial Hand prompt. Duplicated prompt text is a bug because it creates local/remote behavior drift.

**R11. Naming is part of the layer.**
- Files in `game/` use rule names: `stateDrift`, `relationshipDrift`, `echoResolution`.
- Files in `entities/` use body names: `body`, `playerMovement`, `agentMovement`.
- Files in `world/` use spatial names: `worldGraph`, `worldRenderers`, `WorldStage`.
- Files in `ui/` are React panels: `DiaryView`, `NoteEchoDialog`.
- React component files use `PascalCase.tsx`. Pure modules use `camelCase.ts`.

**R12. No catch-all `types.ts` in a folder.**
A growing shared `types.ts` is the seed of a god file. Types live next to the module that owns them. Cross-layer types live in the layer that defines the contract (usually the lower layer).

**R13. Imports declare direction.**
Imports from upper layers into lower layers are forbidden. Specifically:
- `game/` files do not import from `world/`, `app/`, `ui/`, or `agentMind/`.
- `llm/` files do not import from `game/`, `world/`, `app/`, `ui/`, or `agentMind/`, except shared type names exported from `game/agentState`.
- `entities/` files do not import from `agentMind/`, `app/`, or `ui/`.
- `ui/` files do not import from `world/` internals (only run state and game types).

**R14. Refactor before adding.**
If the new feature would force you to violate any rule above, the codebase needs a refactor first. Do not add the feature dirty and "clean it up later". Later does not come.

**R15. Delete on sight.**
Unused exports, dead branches, commented-out code, files not imported anywhere — delete in the same commit as the change that obsoleted them. Type-check after every cleanup.

### Code review checklist (apply before merging any change)

1. Does any new file exceed 300 lines? If yes, split.
2. Did any rule layer pull in a React or PixiJS import? If yes, reject.
3. Did the LLM layer set any state value directly? If yes, reject.
4. Is any raw state number rendered in the UI? If yes, reject.
5. Did the world tick add a new React `setState` in the hot path? If yes, reject.
6. Are there magic numbers without named constants? If yes, name them.
7. Are there any imports going from a lower layer into an upper layer? If yes, reject.
8. Is any prompt, context rule, tone rule, or schema copied instead of imported from its owner? If yes, reject.
9. Was a deleted feature's leftover code (types, assets, dead branches) cleaned up? If no, clean it.

### Refactor reflex

If you ever feel "I'll just put this here for now, it's only one place" — stop. That sentence produced the 2660-line `App.tsx`. The rule is:

> If the right home for this code does not exist yet, create the right home first, then write the code there.

## First Build Milestones

1. Clean dead types and unify gameplay truth.
2. Extract shared state key constants where gameplay fields repeat.
3. Start the PixiJS world shell with a real tick loop.
4. Add player entity movement and camera follow.
5. Add agent entity shell and schedule system.
6. Add map graph and path traversal.
7. Reconnect echo objects and day settlement back into the world.
8. Keep real LLM integration behind the world-first milestone.

## MVP Non-Goals

- Final 3D production build
- Real LLM integration before the world loop is stable
- Backend accounts
- Cloud saves
- Multiplayer
- Combat
- Inventory systems
- UI-heavy HUD gameplay
- Perfect final art before the world feels alive

## Next Design Tasks

- Define the world graph for the first town slice.
- Define player and agent entity contracts.
- Define schedule checkpoints for one believable school day.
- Decide the first world-based echo pickup interaction.
- Replace button-first interaction with presence-first interaction.
