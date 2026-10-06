import type { DrumStep } from "../../domain/rhythm/drums";
/** Only the grid subscribes; controls/page do not render on audio steps. */
export function createPlaybackStore() {
  let current: DrumStep | null = null;
  const listeners = new Set<() => void>();
  return {
    getSnapshot: () => current,
    getServerSnapshot: () => null,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    set: (step: DrumStep | null) => { current = step; listeners.forEach((listener) => listener()); },
  };
}
export type PlaybackStore = ReturnType<typeof createPlaybackStore>;
