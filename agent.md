# Fate Agent MVP

## Project Definition

Fate Agent is a browser-playable agent experiment game.

The player creates an agent from a birth date, name, and a small amount of background context. The birth date is treated as an initial hand, not a final destiny. The agent enters a quiet Japanese seaside youth world and makes its own choices with help from an LLM.

The player can observe, investigate, lightly touch, and send rare mysterious signals. The player can influence the agent, but cannot directly control the agent.

Core feeling:

> You can reach them, but you cannot live for them.

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

The player can touch the agent through:

- A dream
- A letter
- A page in a book
- An old photo
- Sea wind

The player input is always a signal, not a command.

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

The MVP is a local-first browser game.

Recommended stack:

- Vite
- React
- TypeScript
- Zustand for game state
- Zod for LLM response validation
- Recharts for simple state charts
- localStorage for API config and saves
- OpenAI-compatible API client

No backend is required for MVP.

Important note:

Some LLM providers may block direct browser calls with CORS. MVP can first target browser-compatible providers. A local proxy, desktop shell, or backend can be added later if needed.

## Architecture Principle

The LLM is the agent brain.

The local game engine is the world, memory, and referee.

The LLM can describe and decide, but local code must:

- Track game phase
- Store player input
- Validate structured output
- Clamp state values
- Resolve relationship changes
- Save the run

## Folder Responsibilities

```text
src/app
  App shell and top-level screen composition.

src/game
  Core game types, seed generation, world config, prompt building,
  simulation flow, and resolution logic.

src/llm
  OpenAI-compatible API client, response schemas, and provider config.

src/store
  Client-side game state store.

src/components
  UI components for setup, investigation, intervention, prediction,
  game scene, and result display.

src/assets/pixel/avatars
  Pixel avatar assets generated later.

src/assets/pixel/scenes
  Pixel scene assets generated later.

docs
  Product notes, prompt notes, and design references.
```

## First Build Milestones

1. Create the project scaffold.
2. Define TypeScript data models.
3. Build a fake-data playable April loop.
4. Add the visual game screen.
5. Add API settings.
6. Add prompt builder and LLM client.
7. Add response validation and resolution.
8. Add local save.
9. Replace placeholder visuals with pixel assets.

## MVP Non-Goals

- Full twelve-month game
- Serious astrological or destiny calculation engine
- Backend accounts
- Cloud saves
- Multiplayer
- Map walking
- Combat
- Inventory
- Complex animation
- AI image generation inside the app

## Next Design Tasks

- Define the exact TypeScript data model.
- Write the first April scenario.
- Write the LLM prompt contract.
- Decide the setup screen fields.
- Decide the first fake-data run result.
