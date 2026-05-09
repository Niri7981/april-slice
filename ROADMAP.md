# April Slice Roadmap

## North Star

April Slice is a browser-playable Japanese youth agent experiment game.

The player creates an agent from a birth date, name, gender, and visual identity. The birth date seeds an initial hand through astrology and Ten Gods / BaZi-style symbolic readings. The agent then enters a 30-day April slice in a small seaside town.

The player does not directly control the agent's life. Each day, the player has 2 base Echoes: limited chances to guide, influence, write a note, or draw the agent's attention somewhere. The agent may also open 0-2 extra Echo Windows depending on their openness, pressure, trust, relationships, weather, scene mood, and initial hand. The agent may accept, hesitate, misread, resist, delay, or transform those Echoes.

The final experience should feel like guiding a person through a quiet version of youth: close enough to matter, never close enough to own them.

## Product Shape

```text
Create agent
  -> birth date creates initial hand
  -> choose name, gender, and appearance
  -> enter April Day 1
  -> each day has 2 base Echoes, plus 0-2 agent-granted Echo Windows
  -> agent moves through home, school, roads, station, sea, and night room
  -> LLM resolves agent reactions, choices, memories, and relationship drift
  -> 30 days later, April closes as a life slice
```

## Stage 0: Current Prototype

Goal: Prove that April Slice can feel like a small playable space rather than a static UI.

Status:

- Vite + React + TypeScript app exists.
- Pixel UI shell exists.
- Region map modal exists.
- School corridor and classroom image scenes exist.
- Temporary CSS agent sprite exists.
- Agent can move with keyboard input.
- Agent can transition between corridor and classroom.
- Product constitution exists in `agent.md`.

Remaining cleanup:

- Replace continuous direct-control framing with Echo-based guidance.
- Hide or downgrade debug scene-switch buttons.
- Improve scene collision and interaction zones.

## Stage 1: Echo Interaction v0.2

Goal: Make the core rule playable: the player can influence the agent only through limited Echoes, and extra chances come from the agent opening a window.

Deliverables:

- Add `Today's Echoes` UI with:
  - 2 base Echoes.
  - 0-2 agent-granted Echo Windows.
  - Daily typical range of 2-3.
  - Daily maximum of 4.
- Define Echo as a daily influence resource, not an action point.
- Define extra Echoes as agent permission, not player entitlement.
- Add Spatial Echo interactions for at least:
  - Classroom door.
  - Corridor return door.
  - Classroom blackboard.
  - Classroom window.
- Change door transitions from automatic collision to intentional Echo / interaction.
- Add first Note Echo paper UI:
  - Player writes one short sentence.
  - Sentence is stored as a signal for the current day.
  - First version can resolve with hardcoded text before LLM integration.
- Add hardcoded agent openness rules for the first prototype:
  - Low pressure / high openness can grant 1 extra Echo Window.
  - High pressure / low trust grants no extra Echo Window.
  - Special weather or relationship moments may grant a temporary extra window.
- After all available Echoes are used, player can still observe and move/camera-test as needed, but cannot keep pushing agent choices.

Design test:

```text
Does the player feel they are leaving limited traces, not piloting a character?
```

## Stage 2: Complete Day 1 Demo v0.3

Goal: Build one emotionally coherent day before building the full 30-day structure.

Recommended opening:

```text
Morning room
  -> leaving home
  -> school corridor
  -> classroom
  -> after-school road
  -> night room
```

Deliverables:

- Add first home / bedroom scene as the ideal opening frame.
- Add Day 1 state.
- Add time slots:
  - Daytime.
  - After school.
  - Night.
- Reset base Echoes at the start of Day 1.
- Calculate first hardcoded agent-granted Echo Window count.
- Add Note Echo and Spatial Echo usage across the day.
- Add short night diary fragment that references at least one Echo.
- Add simple Day 1 result summary.
- Use fake data and hardcoded responses before LLM integration.

Design test:

```text
Does one day feel slow, ordinary, and emotionally consequential?
```

## Stage 3: LLM Agent Brain Shell v0.4

Goal: Prepare the agent to respond as a person rather than as scripted UI.

Deliverables:

- Define structured LLM input:
  - Agent profile.
  - Initial hand.
  - Current day and time slot.
  - Current scene.
  - Current state.
  - Relationships.
  - Echoes used today.
  - Agent-granted Echo Window count and reason.
  - Recent diary fragments.
  - Player Note Echo text.
  - Player Spatial Echo intention.
- Define structured LLM output:
  - Behavior text.
  - Diary fragment.
  - Accepted / hesitated / resisted / misread / delayed / transformed.
  - Intended movement or action.
  - State changes.
  - Relationship changes.
  - Internal thought for future context.
  - Safety fallback if output is invalid.
- Validate with Zod.
- Keep local hardcoded fallback for offline play.
- Tune early refusal / hesitation rate toward roughly 20-30% so the agent feels autonomous but not unreachable.

Design test:

```text
Does the agent feel like they can answer the player without becoming obedient?
```

## Stage 4: Initial Hand Visual Cards v0.5

Goal: Convert birth data into a playable emotional and behavioral seed.

Deliverables:

- Define `InitialHand` schema.
- Include symbolic inputs:
  - Astrology-inspired traits.
  - Ten Gods / BaZi-inspired traits.
  - Elemental balance or pressure patterns.
- Convert symbolic readings into 4-6 game-facing cards, such as:
  - Sensitive.
  - Expressive.
  - Avoids constraint.
  - Seeks recognition.
  - Carries family pressure.
  - Slow to trust.
  - Drawn to distance.
- Give each card:
  - A poetic title.
  - A short line of flavor text.
  - A small icon or visual motif.
  - A hidden mechanical bias for the agent brain.
- Map cards into initial stats:
  - Pressure.
  - Loneliness.
  - Future sense.
  - Self sense.
  - Signal receptivity.
  - Autonomy.
- First version can use deterministic local rules.
- Later version can ask LLM to explain the hand in-world.

Design test:

```text
Does destiny feel like an opening hand, not a verdict?
```

## Stage 5: Agent Creation v0.6

Goal: Let players create the agent they will accompany.

Deliverables:

- Add creation flow before April starts.
- Required fields:
  - Birth date.
  - Name.
  - Gender or gender presentation.
  - Visual identity / appearance preset.
- Optional fields:
  - Hobby.
  - Family background.
  - School temperament.
  - One private worry.
- Store created agent locally.
- Feed created agent data into UI panels and opening text.

Design test:

```text
Can the player feel this agent is specific, but still fictional and independent?
```

## Stage 6: 30-Day April Structure v0.7

Goal: Expand from one complete day to a full April slice.

Deliverables:

- Day counter from 1 to 30.
- Daily rhythm:
  - Morning / daytime.
  - After school.
  - Night.
- Daily Echo reset.
- Recurring places.
- Relationship drift.
- State drift.
- Day-end diary.
- Weekly pressure beats.
- Month-end resolution.

Design test:

```text
Does the player notice that repeated places feel different as the agent changes?
```

## Stage 7: Relationships And Youth Drama v0.8

Goal: Make the month relational, not just introspective.

Deliverables:

- Add initial relationship cast:
  - Mother or family figure.
  - Classmate / deskmate.
  - Friend.
  - Teacher.
  - Optional ambiguous crush.
- Add warmth and tension per relationship.
- Add location-based encounters.
- Add missed encounters and unsaid moments.
- Let Echoes influence attention toward people, not guarantee outcomes.

Design test:

```text
Does it feel like a relationship can change even through small silence?
```

## Stage 8: Month-End Reflection v0.9

Goal: Turn the 30-day run into a meaningful artifact.

Deliverables:

- Generate April summary.
- Show:
  - What changed.
  - What stayed unresolved.
  - Which Echoes were received.
  - Which Echoes were misunderstood.
  - Key diary fragments.
  - Relationship shifts.
  - Initial hand cards that mattered most.
- Avoid making it feel like a score report.

Design test:

```text
Does the ending feel like a life slice, not a performance grade?
```

## Stage 9: April Slice v1.0

Goal: Complete the first playable vertical slice.

Definition of done:

- Player can create an agent.
- Birth date produces an initial hand.
- Player enters April Day 1.
- The agent exists as a visible pixel person.
- Player has 2 base Echoes per day.
- Agent may grant 0-2 extra Echo Windows per day.
- Echoes include note and spatial guidance.
- Agent can accept, hesitate, misread, resist, or transform influence.
- The game runs for 30 days.
- State, relationships, diary, and scenes change over time.
- Month-end reflection feels emotionally coherent.

## Open Design Questions

- Should the first scene be the agent's bedroom, family kitchen, or school corridor?
- Should keyboard movement remain as a debug mode, or become an accessibility option?
- Should Note Echo always consume 1 Echo, or should stronger signals cost more later?
- Should the player ever be allowed to choose nothing and gain a special observation benefit?
- How literal should astrology and Ten Gods / BaZi readings be in the UI?
- Should the player know when the agent resists them, or infer it from behavior?
- Should extra Echo Windows be shown explicitly, or implied through text like "she seems willing to hear one more thing"?

## Immediate Next Step

Build Stage 1: Echo Interaction v0.2.

Start with:

1. Add Today's Echoes UI.
2. Add Echo state with 2 base Echoes and 0-2 agent-granted Echo Windows.
3. Replace automatic door transition with interact prompt.
4. Add first paper-note Echo UI.
5. Add hardcoded agent openness and response rules before LLM.
