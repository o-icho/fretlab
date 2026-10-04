"use client";
import { useEffect } from "react";
import { Capacitor, type PluginListenerHandle } from "@capacitor/core";
import { App } from "@capacitor/app";
/** No permission is requested here. Audio stops when the native app leaves the foreground. */
export function NativeLifecycle() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    let disposed = false;
    const listeners: PluginListenerHandle[] = [];
    async function setup() {
      for (const listener of [
        App.addListener("appStateChange", ({ isActive }) => {
          if (!isActive) window.dispatchEvent(new Event("fretlab:pause"));
        }),
        App.addListener("backButton", ({ canGoBack }) => {
          if (canGoBack) window.history.back();
          else if (window.location.pathname !== "/")
            window.location.replace("/");
          else void App.exitApp();
        }),
      ]) {
        const handle = await listener;
        if (disposed) await handle.remove();
        else listeners.push(handle);
      }
    }
    void setup().catch((error) =>
      console.error("FretLab : intégration Android", error),
    );
    return () => {
      disposed = true;
      listeners.forEach((handle) => {
        void handle.remove();
      });
    };
  }, []);
  return null;
}
