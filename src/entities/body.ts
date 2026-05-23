export type Vector = {
  x: number;
  y: number;
};

export type Body = Vector & {
  radius: number;
};

export const createPlayerBody = (): Body => ({
  x: 460,
  y: 620,
  radius: 28,
});

export const createAgentBody = (): Body => ({
  x: 620,
  y: 560,
  radius: 28,
});
