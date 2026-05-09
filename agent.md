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
