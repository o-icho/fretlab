"use client";
import { useEffect, useState } from "react";
import type { DrumInstrument, DrumPattern } from "../../../domain/rhythm/drums";
import type { TimeSignature } from "../../../domain/rhythm/meter";
import { DRUM_PATTERNS } from "../presets";
import { LocalPatternRepository } from "./LocalPatternRepository";
import { blankUserPattern, changePatternBars, changePatternSignature, clearUserPattern, copyUserPattern, cycleStep, isUserPattern, renameUserPattern, resetUserPattern, toggleTrackMute, type UserPattern } from "./patternEditing";

export function usePatternEditor(pattern: DrumPattern, apply: (pattern: DrumPattern) => void) {
  const [repository] = useState(() => new LocalPatternRepository());
  const [library, setLibrary] = useState<UserPattern[]>([]);
  const [ready, setReady] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      try { setLibrary(repository.list()); }
      catch (error) { setError(error instanceof Error ? error.message : "Bibliothèque indisponible."); }
      setReady(true);
    });
    return () => { cancelled = true; };
  }, [repository]);
  useEffect(() => {
    if (!dirty) return;
    const beforeUnload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    const beforeLink = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(link instanceof HTMLAnchorElement) || link.target === "_blank" || link.hasAttribute("download") || link.pathname === window.location.pathname) return;
      if (!window.confirm("Quitter cette page et abandonner les modifications non sauvegardées ?")) { event.preventDefault(); event.stopPropagation(); }
    };
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", beforeLink, true);
    return () => { window.removeEventListener("beforeunload", beforeUnload); document.removeEventListener("click", beforeLink, true); };
  }, [dirty]);
  const now = () => new Date().toISOString();
  const newId = () => `user-${crypto.randomUUID()}`;
  const copy = () => copyUserPattern(pattern, newId(), now());
  function safely(action: () => void) {
    setError("");
    setMessage("");
    try { action(); } catch (error) { setError(error instanceof Error ? error.message : "Action impossible. Votre édition est conservée."); }
  }
  function edit(transform: (pattern: UserPattern) => UserPattern, confirmTrim = false) {
    safely(() => {
      const user = isUserPattern(pattern) ? pattern : copy();
      const next = transform(user);
      if (confirmTrim && isUserPattern(pattern)) {
        const countHits = (value: DrumPattern) => value.tracks.reduce((sum, track) => sum + track.events.length, 0);
        if (countHits(next) < countHits(user) && !window.confirm("Les frappes en dehors de la nouvelle grille seront supprimées. Continuer ?")) return;
      }
      apply(next);
      setDirty(true);
      if (!isUserPattern(pattern)) setMessage("Copie utilisateur créée. Le preset d’origine reste intact.");
    });
  }
  const canReplace = () => !dirty || window.confirm("Changer de rythme et abandonner les modifications non sauvegardées ?");
  function select(next: DrumPattern) {
    if (next === pattern) return;
    if (!canReplace()) return;
    apply(next); setDirty(false); setMessage(""); setError("");
  }
  const preset = isUserPattern(pattern) ? DRUM_PATTERNS.find((item) => item.id === pattern.basedOnPresetId) : undefined;
  const saved = library.some((item) => item.id === pattern.id);
  return {
    library, ready, dirty, message, error, preset, saved, select,
    newPattern: () => {
      if (!canReplace()) return;
      safely(() => { apply(blankUserPattern(pattern, newId(), now())); setDirty(true); });
    },
    changeSignature: (signature: TimeSignature) => {
      if (signature !== `${pattern.meter.beats}/${pattern.meter.beatUnit}`) edit(user => changePatternSignature(user, signature, now()), true);
    },
    changeBars: (bars: number) => {
      if (bars !== pattern.bars) edit(user => changePatternBars(user, bars, now()), true);
    },
    cycle: (instrument: DrumInstrument, bar: number, step: number) => edit((user) => cycleStep(user, instrument, bar, step, now())),
    mute: (instrument: DrumInstrument) => edit((user) => toggleTrackMute(user, instrument, now())),
    rename: (name: string) => edit((user) => renameUserPattern(user, name, now())),
    duplicate: () => safely(() => { apply(copy()); setDirty(true); setMessage("Copie créée. Sauvegardez-la pour la retrouver sur cet appareil."); }),
    clear: () => {
      if (!window.confirm("Vider toutes les frappes de ce pattern ? Les éventuelles modifications non sauvegardées seront remplacées par une grille vide. La sauvegarde existante ne changera qu’après Sauvegarder.")) return;
      edit((user) => clearUserPattern(user, now()));
    },
    reset: () => {
      if (!preset || !window.confirm(`Restaurer les frappes et les pistes de « ${preset.name} » ? Les modifications non sauvegardées seront remplacées. Le nom et l’identité de votre copie sont conservés.`)) return;
      edit((user) => resetUserPattern(user, preset, now()));
    },
    save: () => safely(() => {
      if (!isUserPattern(pattern)) return;
      repository.save(pattern);
      setLibrary(repository.list());
      setDirty(false);
      setMessage("Pattern sauvegardé sur cet appareil.");
    }),
    remove: () => {
      if (!saved || !window.confirm(`Supprimer définitivement « ${pattern.name} » de cet appareil${dirty ? " et abandonner ses modifications non sauvegardées" : ""} ?`)) return;
      safely(() => {
        repository.remove(pattern.id);
        setLibrary(repository.list());
        apply(preset ?? DRUM_PATTERNS[0]);
        setDirty(false);
        setMessage("Pattern supprimé de cet appareil.");
      });
    },
  };
}
