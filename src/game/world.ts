import type { MonthScenario } from "./types";

export const aprilScenario: MonthScenario = {
  id: "april-slice",
  title: "The first month by the sea",
  monthLabel: "April",
  theme: "A new school year begins, and the old town starts to feel temporary.",
  openingText:
    "The classroom windows are open. Somewhere beyond the tracks, the sea keeps moving like it knows something the students do not.",
  pressure:
    "The agent begins to feel that staying the same may already be a kind of choice.",
  phases: [
    "setup",
    "opening",
    "investigation",
    "light_touch",
    "intervention",
    "prediction",
    "agent_turn",
    "result",
  ],
  touchOptions: [
    {
      id: "home",
      label: "Think of home",
      description: "Let the agent notice the weight of family and routine.",
    },
    {
      id: "person",
      label: "Notice someone",
      description: "Draw attention toward a relationship that may matter.",
    },
    {
      id: "sea",
      label: "Walk by the sea",
      description: "Nudge the agent toward solitude and reflection.",
    },
    {
      id: "book",
      label: "Open an old book",
      description: "Let a sentence from elsewhere disturb the month.",
    },
    {
      id: "nothing",
      label: "Do nothing",
      description: "Let April unfold without interference.",
    },
  ],
  predictionOptions: [
    {
      id: "avoid_future",
      label: "Avoid talking about the future",
    },
    {
      id: "talk_family",
      label: "Talk honestly with family",
    },
    {
      id: "tell_friend",
      label: "Tell a friend what they really feel",
    },
    {
      id: "sea_decision",
      label: "Go to the sea alone and decide something",
    },
  ],
};
