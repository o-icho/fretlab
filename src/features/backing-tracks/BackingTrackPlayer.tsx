"use client";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { chordsAt, validAudioUrl, type BackingTrack } from "@/domain/music/backingTracks";
import { useAudioPause } from "@/features/audio/useAudioPause";
import { TrackTransport } from "./TrackTransport";
import styles from "./backingTracks.module.css";

const timeLabel = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.floor(ms / 1000) % 60).padStart(2, "0")}`;
export function BackingTrackPlayer({ track }: { track: BackingTrack }) {
  const id = useId();
  const backing = useRef<HTMLAudioElement>(null), example = useRef<HTMLAudioElement>(null);
  const transport = useRef<TrackTransport | null>(null);
  const [state, setState] = useState({ time: 0, logicalTime: 0, playing: false, mode: "BACKING", ready: false, example: false, message: "" });
  const [volume, setVolume] = useState(0.7);
  const refresh = useCallback(() => {
    const player = transport.current;
    if (!player) return;
    player.tick();
    const next = { time: player.timeMs, logicalTime: player.logicalTimeMs, playing: player.playing, mode: player.mode, ready: player.ready, example: player.exampleAvailable && (example.current?.readyState ?? 0) >= 1, message: player.message };
    setState(previous => Object.keys(next).every(key => previous[key as keyof typeof previous] === next[key as keyof typeof next]) ? previous : next);
  }, []);
  const pause = useCallback(() => { transport.current?.pause(); refresh(); }, [refresh]);
  useAudioPause(pause);
  useEffect(() => {
    const a = backing.current!, b = example.current!;
    const player = new TrackTransport(track, a, b);
    transport.current = player;
    let frame = 0;
    const update = () => { refresh(); frame = player.playing ? requestAnimationFrame(update) : 0; };
    const changed = () => {
      refresh();
      if (player.playing && !frame) frame = requestAnimationFrame(update);
      else if (!player.playing && frame) { cancelAnimationFrame(frame); frame = 0; }
    };
    const ended = (event: Event) => { if (event.target === (player.mode === "BACKING" ? a : b)) { player.pause(); refresh(); } };
    const failBacking = () => { void player.failed("BACKING").then(refresh); };
    const failExample = () => { void player.failed("EXAMPLE").then(refresh); };
    a.addEventListener("error", failBacking); b.addEventListener("error", failExample);
    a.addEventListener("ended", ended); b.addEventListener("ended", ended);
    const events = ["loadedmetadata", "durationchange", "seeking", "seeked", "timeupdate", "play", "pause", "waiting", "playing"];
    for (const audio of [a, b]) for (const event of events) audio.addEventListener(event, changed);
    a.src = track.audio.backingUrl;
    if (validAudioUrl(track.audio.exampleUrl)) b.src = track.audio.exampleUrl;
    else player.message = "Exemple non fourni ou URL invalide. Le backing reste disponible.";
    frame = requestAnimationFrame(update);
    return () => {
      cancelAnimationFrame(frame); player.dispose(); transport.current = null;
      a.removeEventListener("error", failBacking); b.removeEventListener("error", failExample);
      a.removeEventListener("ended", ended); b.removeEventListener("ended", ended);
      for (const audio of [a, b]) for (const event of events) audio.removeEventListener(event, changed);
      for (const audio of [a, b]) { audio.removeAttribute("src"); audio.load(); }
    };
  }, [track, refresh]);
  const chords = chordsAt(track.chordTimeline, state.logicalTime, track.chordCoverageEndMs);
  return <section className={styles.player} aria-label={`Lecteur : ${track.title}`}>
    <audio ref={backing} preload="metadata" /><audio ref={example} preload="metadata" />
    <p className="eyebrow">{track.style ?? "ACCOMPAGNEMENT"}</p>
    <h2>{track.title}</h2><p className={styles.meta}>{track.key} · {track.bpm} BPM · {state.mode === "EXAMPLE" ? "Exemple complet" : "Backing sans lead"}</p>
    <div className={styles.chord} aria-live="polite" aria-atomic="true">{chords.current && <><span>Accord courant</span><strong>{chords.current.symbol}</strong>{chords.next && <p>Suivant : <b>{chords.next.symbol}</b></p>}</>}</div>
    <label htmlFor={`${id}-seek`}>Position dans le morceau</label>
    <input id={`${id}-seek`} type="range" min="0" max={track.durationMs} step="100" value={state.time} disabled={!state.ready} aria-valuetext={timeLabel(state.time)} onChange={e => { transport.current?.seek(Number(e.target.value)); refresh(); }} />
    <div className={styles.times}><span>{timeLabel(state.time)}</span><span>{timeLabel(track.durationMs)}</span></div>
    <div className={styles.controls}>
      <button className={styles.play} aria-label={state.playing ? "Mettre en pause" : "Lire"} disabled={!state.ready} onClick={() => { const p = transport.current; if (!p) return; if (!p.active.paused && !p.active.ended) pause(); else { if (p.active.ended || p.timeMs >= track.durationMs) p.seek(0); void p.play().then(refresh); refresh(); } }}><span aria-hidden="true">{state.playing ? "Ⅱ" : "▶"}</span> {state.playing ? "Pause" : "Play"}</button>
      <button aria-pressed={state.mode === "EXAMPLE"} disabled={!state.example} onClick={() => { void transport.current?.switchMode(state.mode === "EXAMPLE" ? "BACKING" : "EXAMPLE").then(refresh); refresh(); }}>Exemple {state.mode === "EXAMPLE" ? "ON" : "OFF"}</button>
    </div>
    <p className={styles.help} role="status">{state.playing ? "Lecture en cours" : "Lecture en pause"} · {state.mode === "EXAMPLE" ? "Version complète" : "À vous de jouer le lead"}</p>
    <label htmlFor={`${id}-volume`}>Volume</label><input id={`${id}-volume`} type="range" min="0" max="1" step="0.01" value={volume} onChange={e => { const v = Number(e.target.value); setVolume(v); transport.current?.volume(v); }} />
    <p role="status" className={styles.message}>{state.message}</p>
  </section>;
}
