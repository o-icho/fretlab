"use client";
import { useEffect, useState } from "react";
import { decodeBackingTrack, type BackingTrack } from "@/domain/music/backingTracks";
import { LocalTrackRepository } from "./TrackRepository";
import { BackingTrackPlayer } from "./BackingTrackPlayer";
import styles from "./backingTracks.module.css";

const repository = new LocalTrackRepository();
export function BackingTrackAuthoring({ catalogue }: { catalogue: BackingTrack[] }) {
  const [local, setLocal] = useState<BackingTrack[]>([]), [selected, setSelected] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => { let mounted = true; queueMicrotask(() => { if (!mounted) return; try { setLocal(repository.list()); } catch { setMessage("Bibliothèque locale indisponible ou incompatible. Les données existantes sont conservées."); } }); return () => { mounted = false; }; }, []);
  const tracks = [...catalogue, ...local.filter(t => !catalogue.some(c => c.id === t.id))];
  const current = tracks.find(t => t.id === selected) ?? tracks[0];
  async function importFile(file: File) {
    try {
      if (file.size > 1_000_000) throw new Error("Fiche trop volumineuse (1 Mo maximum).");
      const track = decodeBackingTrack(JSON.parse(await file.text()));
      if (catalogue.some(t => t.id === track.id || t.slug === track.slug)) throw new Error("Ce morceau du catalogue existe déjà. Choisissez un autre identifiant et slug.");
      if (local.some(t => t.id === track.id) && !window.confirm("Remplacer la fiche locale de ce morceau ?")) return;
      repository.save(track); setLocal(repository.list()); setSelected(track.id); setMessage("Morceau importé sur cet appareil. Les fichiers audio restent à leurs URL.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Import impossible : vérifiez le fichier et l’espace de stockage."); }
  }
  return <div className={styles.workspace}>
    <div className={styles.library}>
      <label htmlFor="backing-track">Votre accompagnement</label>
      <select id="backing-track" value={current?.id ?? ""} disabled={!tracks.length} onChange={e => setSelected(e.target.value)}>{!tracks.length && <option value="">Aucun morceau pour le moment</option>}{tracks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}</select>
      <details><summary>Ajouter un morceau</summary><p className={styles.help}>Importez une fiche JSON contenant les deux URL audio et la timeline d’accords. Elle sera conservée uniquement sur cet appareil. Aucun fichier audio n’est envoyé ni enregistré.</p><label htmlFor="track-import">Fiche du morceau (.json)</label><input id="track-import" type="file" accept="application/json,.json" onChange={e => { const file = e.target.files?.[0]; e.target.value = ""; if (file) void importFile(file); }} /></details>
      {current && local.some(t => t.id === current.id) && <button onClick={() => { if (!window.confirm(`Supprimer « ${current.title} » de cet appareil ?`)) return; try { repository.remove(current.id); setLocal(repository.list()); setMessage("Fiche supprimée."); } catch { setMessage("Suppression impossible. Les données sont conservées."); } }}>Supprimer la fiche locale</button>}
      <p role="status" className={styles.message}>{message}</p>
    </div>
    {current ? <BackingTrackPlayer key={current.id + JSON.stringify(current)} track={current} /> : <section className={styles.player}><p className="eyebrow">VOTRE PROCHAINE SESSION</p><h2>Un morceau, deux façons de jouer.</h2><p className={styles.help}>Jouez sur l’accompagnement, écoutez la version complète et suivez les accords au fil du morceau. Le premier backing track sera disponible après l’ajout de ses fichiers audio et de sa grille.</p></section>}
    <p className={styles.help}>Les fichiers intégrés à l’application Android sont disponibles hors ligne. Les URL distantes nécessitent une connexion. Le navigateur choisit la quantité d’audio préchargée.</p>
  </div>;
}
