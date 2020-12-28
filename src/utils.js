import { useRef, useCallback } from "react";

export const actions = {
  init: "init"
};

export function useGetLatest(obj) {
  const ref = useRef();
  ref.current = obj;

  return useCallback(() => ref.current, []);
}

export const loopHooks = (hooks, context, meta = {}) =>
  hooks.forEach((hook) => {
    const nextValue = hook(context, meta);
    if (typeof nextValue !== "undefined") {
      console.info(hook, nextValue);
      throw new Error(
        "React Table: A loop-type hook ☝️ just returned a value! This is not allowed."
      );
    }
  });
