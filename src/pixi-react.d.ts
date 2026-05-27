/* eslint-disable @typescript-eslint/no-empty-object-type */
import type { PixiElements } from "@pixi/react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements extends PixiElements {}
  }
}
