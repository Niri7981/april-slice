import type { Vector } from "../../entities/core/body";

export type NamedNpc = {
  id: string;
  name: string;
  position: Vector;
};

export const notePaperPosition: Vector = {
  x: 300,
  y: 345,
};

export const namedNpcs: NamedNpc[] = [
  {
    id: "mina",
    name: "Mina",
    position: {
      x: 1090,
      y: 565,
    },
  },
];
