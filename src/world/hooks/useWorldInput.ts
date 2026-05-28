import { useEffect, useRef } from "react";

export const useWorldInput = (resetKey: unknown) => {
  const keys = useRef(new Set<string>());
  const eWasDown = useRef(false);

  useEffect(() => {
    keys.current.clear();
    eWasDown.current = false;
  }, [resetKey]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      keys.current.add(event.key.toLowerCase());
    };
    const onKeyUp = (event: KeyboardEvent) => {
      keys.current.delete(event.key.toLowerCase());
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  return {
    keys,
    eWasDown,
  };
};
