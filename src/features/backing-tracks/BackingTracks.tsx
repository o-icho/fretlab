"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import type { BackingTrack, BackingTrackSummary } from "@/domain/music/backingTracks";
import { LocalTrackRepository } from "./TrackRepository";
import { TrackDetailPlayer } from "./TrackDetailPlayer";
import { filterOptions, filterQuery, queryTracks, readFilters, type TrackFilters } from "./library";
import styles from "./backingTracks.module.css";
import { BACKING_TRACK_TEMPO_RANGES, styleLabel } from "./filterConfig";
const repository = new LocalTrackRepository();
export function BackingTracks({ catalogue, adminEnabled }: { catalogue: BackingTrackSummary[]; adminEnabled: boolean }) {
  const params = useSearchParams(), pathname = usePathname();
  const [local, setLocal] = useState<BackingTrack[]>([]), [loaded, setLoaded] = useState(false);
  const [selected, setSelected] = useState(""), [message, setMessage] = useState("");
  const playerPanel = useRef<HTMLDivElement>(null);
  useEffect(() => { if (selected) { playerPanel.current?.focus({ preventScroll: true }); playerPanel.current?.scrollIntoView({ block: "start" }); } }, [selected]);
  useEffect(() => { let mounted = true; queueMicrotask(() => { if (!mounted) return; try { setLocal(repository.list()); } catch { setMessage("Bibliothèque locale indisponible. Le catalogue reste accessible."); } setLoaded(true); }); return () => { mounted = false; }; }, []);
  const tracks = [...catalogue, ...local.filter(t => !catalogue.some(c => c.id === t.id))];
  const filters = readFilters(new URLSearchParams(params.toString()));
  const result = queryTracks(tracks, filters), options = filterOptions();
  const normalized = filterQuery({ ...filters, page: result.page });
  useEffect(() => {
    if (loaded && normalized !== params.toString()) window.history.replaceState(null, "", `${pathname}${normalized ? `?${normalized}` : ""}`);
  }, [loaded, normalized, params, pathname]);
  const update = (next: TrackFilters) => { const query = filterQuery(next); window.history.pushState(null, "", `${pathname}${query ? `?${query}` : ""}`); };
  const active = Boolean(filters.genre || filters.key || filters.tempoRange);
  const current = tracks.find(t => t.id === selected);
  return <div className={styles.workspace}>
    {adminEnabled && <p className={styles.help}><Link href="/backing-tracks/ajouter/">Ajouter un morceau</Link></p>}
    <form className={styles.library} key={normalized} onSubmit={event => {
      event.preventDefault(); const data = new FormData(event.currentTarget), query = new URLSearchParams();
      for (const key of ["genre", "key", "tempo"]) { const value = String(data.get(key) ?? ""); if (value) query.set(key, value); }
      update({ ...readFilters(query), page: 1 });
    }}>
      <h2>Parcourir les morceaux</h2>
      <div className={styles.filters}>
        <div><label htmlFor="track-genre">Style</label><select id="track-genre" name="genre" defaultValue={filters.genre ?? ""}><option value="">Tous les styles</option>{options.styles.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}</select></div>
        <div><label htmlFor="track-key">Tonalité</label><select id="track-key" name="key" defaultValue={filters.key ?? ""}><option value="">Toutes les tonalités</option>{options.keys.map(k => <option key={k.id} value={k.id}>{k.label}</option>)}</select></div>
        <div><label htmlFor="track-tempo">Tempo</label><select id="track-tempo" name="tempo" defaultValue={filters.tempoRange ?? ""}><option value="">Tous les tempos</option>{BACKING_TRACK_TEMPO_RANGES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}</select></div>
      </div>
      <div className={styles.controls}><button type="submit">Appliquer les filtres</button>{active && <button type="button" onClick={() => update({page:1})}>Réinitialiser les filtres</button>}</div>
    </form>
    <p role="status" className={styles.help}>{loaded ? `${result.total} morceau${result.total === 1 ? "" : "x"}` : "Chargement de la bibliothèque…"}</p>
    {message && <p role="status">{message}</p>}
    {loaded && !result.total && <div className={styles.library}><p>Aucun backing track ne correspond à ces filtres.</p>{active ? <button onClick={() => update({page:1})}>Réinitialiser les filtres</button> : <p className={styles.help}>Les premiers morceaux seront disponibles prochainement.</p>}</div>}
    <ul className={styles.results}>{result.items.map(track => <li key={track.id}><h2>{catalogue.some(t => t.id === track.id) ? <Link href={`/backing-tracks/${track.slug}/`}>{track.title}</Link> : track.title}</h2><p>{styleLabel(track.style)} · {track.key} · {track.bpm} BPM</p><button onClick={() => setSelected(track.id)} aria-label={`Ouvrir le player : ${track.title}`}>Écouter</button></li>)}</ul>
    <nav className={styles.controls} aria-label="Pagination des backing tracks"><button disabled={result.page <= 1} onClick={() => update({...filters,page:result.page-1})}>Précédent</button><span>Page {result.page} / {result.pages}</span><button disabled={result.page >= result.pages} onClick={() => update({...filters,page:result.page+1})}>Suivant</button></nav>
    {current && <div ref={playerPanel} tabIndex={-1} aria-label={`Player : ${current.title}`} className={styles.selection}><button onClick={() => setSelected("")}>Fermer le player</button><TrackDetailPlayer key={current.id} summary={current} localTrack={catalogue.some(t => t.id === current.id) ? undefined : local.find(t => t.id === current.id)} /></div>}
  </div>;
}
