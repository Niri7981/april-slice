export type Vector = {
  x: number;
  y: number;
};

export type Body = Vector & {
  radius: number;
};

export const createPlayerBody = (): Body => ({
  x: 430,
  y: 390,
  radius: 28,
});

export const createAgentBody = (): Body => ({
  x: 620,
  y: 560,
  radius: 28,
});
