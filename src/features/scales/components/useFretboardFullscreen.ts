"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";

type LockableOrientation = ScreenOrientation & { lock?: (mode: "landscape") => Promise<void> };
type Session = { element: HTMLElement; native: boolean; orientation?: LockableOrientation };

function unlock(orientation?: LockableOrientation) {
  try {
    orientation?.unlock();
  } catch {
    // The document may already be inactive or the OS may have released the lock.
  }
}

function exitNative(element: HTMLElement) {
  if (document.fullscreenElement === element) return document.exitFullscreen().catch(() => {});
}

export function useFretboardFullscreen() {
  const ref = useRef<HTMLElement>(null);
  const session = useRef<Session | null>(null);
  const [active, setActive] = useState(false);

  const release = useCallback(() => {
    const current = session.current;
    if (!current) return;
    session.current = null;
    unlock(current.orientation);
    return exitNative(current.element);
  }, []);

  const exit = useCallback(async () => {
    if (!session.current) return;
    // Restore the normal layout and its scroll position once the native viewport is back.
    await release();
    setActive(false);
  }, [release]);

  async function enter() {
    const element = ref.current;
    if (!element || session.current) return;
    const current: Session = { element, native: false };
    session.current = current;
    setActive(true);
    const phone = window.matchMedia("(pointer: coarse) and (max-width: 600px), (pointer: coarse) and (max-height: 600px)").matches;
    try {
      // Capacitor's Android WebChromeClient immediately dismisses fullscreen custom views.
      if (Capacitor.getPlatform() !== "android") await element.requestFullscreen?.();
    } catch {
      // The focused layout also works in a normal browser viewport.
    }
    if (session.current !== current) {
      if (!session.current) exitNative(element);
      return;
    }
    current.native = document.fullscreenElement === element;
    const orientation: LockableOrientation | undefined = window.screen.orientation;
    if (!phone || !orientation?.lock) return;
    current.orientation = orientation;
    try {
      await orientation.lock("landscape");
      if (!session.current) unlock(orientation);
    } catch {
      // Manual rotation remains available when the browser declines the lock.
      current.orientation = undefined;
    }
  }

  useEffect(() => {
    function onFullscreenChange() {
      const current = session.current;
      if (!current) return;
      if (document.fullscreenElement === current.element) current.native = true;
      else if (current.native) exit();
    }
    function onBack(event: Event) {
      if (!session.current) return;
      event.preventDefault();
      exit();
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !event.defaultPrevented) onBack(event);
    }
    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("fretlab:back", onBack);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("fretlab:back", onBack);
      release();
    };
  }, [exit, release]);

  return { ref, active, enter, exit };
}
