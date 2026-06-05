export type RendererMode = "pixi" | "three";

export const getRendererMode = (): RendererMode => {
  const search = new URLSearchParams(window.location.search);
  return search.get("renderer") === "three" ? "three" : "pixi";
};
