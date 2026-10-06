import { decodeContentTrack } from "./content.ts";
import { decodeBackingTrackSummary } from "../../domain/music/backingTracks.ts";
import { decodeTrackDetail, detailPath, loadTrackDetail } from "./detail.ts";
import { test } from "node:test";
import assert from "node:assert/strict";

import { chordsAt, decodeBackingTrack, mediaTimeMs, referenceTimeMs, validAudioUrl } from "../../domain/music/backingTracks.ts";
import { TrackTransport } from "./TrackTransport.ts";
import { LocalTrackRepository } from "./TrackRepository.ts";
const fixture = () => ({ id: "test", slug: "test", title: "Test", key: "A", bpm: 120, durationMs: 10000, audio: { backingUrl: "/audio/test.wav", exampleUrl: "/audio/example.wav", exampleOffsetMs: 500 }, chordTimeline: [{ symbol: "A7", startMs: 0, endMs: 2000 }, { symbol: "D7", startMs: 3000, endMs: 6000 }, { symbol: "E7", startMs: 6000, endMs: 10000 }] });
const contentFixture = () => { const { audio, ...track } = fixture(); return { ...track, exampleOffsetMs: audio.exampleOffsetMs }; };
const media = () => ({ currentTime: 0, duration: 11, volume: 1, paused: true, readyState: 1, async play() { this.paused = false; }, pause() { this.paused = true; } });

test("audio 248 s / timeline MIDI 214 s : durée et silence harmonique préservés", async () => {
  const track = decodeBackingTrack({ ...fixture(), durationMs: 248000, chordTimeline: [
    { symbol: "N.C.", startMs: 0, endMs: 1000, source: "manual" },
    { symbol: "Am", startMs: 2000, endMs: 214000, source: "midi", confidence: .8 },
  ] });
  assert.equal(track.durationMs, 248000);
  assert.equal(chordsAt(track.chordTimeline, 0).current.symbol, "N.C.");
  for (const t of [1500, 214000, 240000, 247999]) assert.equal(chordsAt(track.chordTimeline, t).current, undefined);
  const a = { ...media(), duration: 248 }, b = { ...media(), duration: 249 };
  const player = new TrackTransport(track, a, b);
  player.seek(220000); await player.play(); player.tick(); assert.equal(player.playing, true);
  await player.switchMode("EXAMPLE"); assert.equal(b.currentTime, 220.5); assert.equal(player.timeMs, 220000);
  assert.equal(chordsAt(track.chordTimeline, player.timeMs).current, undefined);
  await player.switchMode("BACKING"); assert.equal(a.currentTime, 220);
});
test("métadonnées facultatives conservées dans le stockage, anciens événements compatibles", () => {
  let json = null;
  const repo = new LocalTrackRepository(() => ({ getItem: () => json, setItem: (_, value) => { json = value; } }));
  const track = fixture();
  track.chordTimeline = [
    { symbol: "N.C.", startMs: 0, endMs: 500, source: "manual", confidence: 0 },
    { symbol: "A7", startMs: 500, endMs: 1000, source: "audio", confidence: 1 },
    { symbol: "D7", startMs: 1000, endMs: 2000, source: "midi", confidence: .75 },
    { symbol: "E7", startMs: 2000, endMs: 3000 },
  ];
  repo.save(track); assert.deepEqual(repo.list()[0], track);
  for (const annotation of [{source:"suno"}, {source:null}, {confidence:-.1}, {confidence:1.1}, {confidence:NaN}, {confidence:Infinity}, {confidence:"0.5"}, {confidence:null}]) {
    assert.throws(() => decodeBackingTrack({...fixture(),chordTimeline:[{symbol:"Am",startMs:0,endMs:500,...annotation}]}));
  }
});
test("tolérance de fin configurable, sans changer les timestamps ni tolérer les chevauchements", () => {
  const track = { ...fixture(), chordTimeline: [{symbol:"N.C.",startMs:9000,endMs:10050}] };
  assert.equal(decodeBackingTrack(track).chordTimeline[0].endMs,10050);
  assert.throws(() => decodeBackingTrack(track,{endToleranceMs:0}));
  assert.throws(() => decodeBackingTrack(track,{endToleranceMs:49}));
  assert.equal(decodeBackingTrack(track,{endToleranceMs:60}).durationMs,10000);
  for (const endToleranceMs of [-1, NaN, Infinity]) assert.throws(() => decodeBackingTrack(track,{endToleranceMs}));
  assert.throws(() => decodeBackingTrack({...track,chordTimeline:[{symbol:"Am",startMs:0,endMs:10051}]}));
  assert.throws(() => decodeBackingTrack({...track,chordTimeline:[{symbol:"Am",startMs:10000,endMs:10010}]}));
  assert.throws(() => decodeBackingTrack({...track,chordTimeline:[{symbol:"Am",startMs:0,endMs:500},{symbol:"C",startMs:499,endMs:1000}]}));
});
test("timeline : premier, dernier, frontière, trou et fin", () => {
  const t = fixture().chordTimeline;
  assert.equal(chordsAt(t, 0).current.symbol, "A7");
  assert.equal(chordsAt(t, 2000).current, undefined);
  assert.equal(chordsAt(t, 2000).next.symbol, "D7");
  assert.equal(chordsAt(t, 6000).current.symbol, "E7");
  assert.equal(chordsAt(t, 9999).current.symbol, "E7");
  assert.equal(chordsAt(t, 10000).current, undefined);
  assert.deepEqual(chordsAt([], 0), { next: undefined });
});
test("seek avant/arrière et accords synchronisés", () => {
  const track = fixture(), player = new TrackTransport(track, media(), media());
  for (const [time, symbol] of [[7000, "E7"], [4000, "D7"], [500, "A7"]]) { player.seek(time); assert.equal(chordsAt(track.chordTimeline, player.timeMs).current.symbol, symbol); }
});
test("Backing → Exemple → Backing préserve temps, lecture et volume", async () => {
  const a = media(), b = media(), player = new TrackTransport(fixture(), a, b);
  player.volume(.4); player.seek(4321); await player.play(); await player.switchMode("EXAMPLE");
  assert.equal(b.currentTime, 4.821); assert.equal(player.timeMs, 4321); assert.equal(a.paused, true); assert.equal(b.paused, false); assert.equal(b.volume, .4);
  b.currentTime = 5; await player.switchMode("BACKING"); assert.equal(a.currentTime, 4.5); assert.equal(player.playing, true); assert.equal(b.paused, true);
  player.pause(); await player.switchMode("EXAMPLE"); assert.equal(player.playing, false); assert.equal(b.paused, true); assert.equal(player.timeMs, 4500);
});
test("offsets positifs et négatifs : convention réversible", () => {
  for (const offset of [-500, 0, 500]) assert.equal(referenceTimeMs(mediaTimeMs(3000, "EXAMPLE", offset), "EXAMPLE", offset), 3000);
});
test("offset négatif hors couverture ne ramène jamais au début", async () => {
  const track = fixture(); track.audio.exampleOffsetMs = -1000;
  const player = new TrackTransport(track, media(), media()); player.seek(500); await player.switchMode("EXAMPLE");
  assert.equal(player.mode, "BACKING"); assert.equal(player.timeMs, 500);
  player.seek(2000); await player.switchMode("EXAMPLE"); player.seek(200); assert.equal(player.mode, "BACKING"); assert.equal(player.timeMs, 200);
});
test("exemple absent ou invalide n’empêche pas la lecture", async () => {
  for (const url of [undefined, "", "javascript:alert(1)"]) {
    const track = fixture(); track.audio.exampleUrl = url;
    const player = new TrackTransport(decodeBackingTrack(track), media(), media()); await player.play(); await player.switchMode("EXAMPLE");
    assert.equal(player.exampleAvailable, false); assert.equal(player.mode, "BACKING"); assert.equal(player.playing, true);
  }
});
test("erreur exemple pendant lecture revient au backing au même temps", async () => {
  const player = new TrackTransport(fixture(), media(), media()); player.seek(3000); await player.play(); await player.switchMode("EXAMPLE"); await player.failed("EXAMPLE");
  assert.equal(player.mode, "BACKING"); assert.equal(player.timeMs, 3000); assert.equal(player.playing, true); assert.equal(player.exampleAvailable, false);
});
test("source non chargée ou trop courte : lecture actuelle conservée", async () => {
  const a = media(), b = media(), player = new TrackTransport(fixture(), a, b); player.seek(4000); await player.play();
  b.readyState = 0; await player.switchMode("EXAMPLE"); assert.equal(player.mode, "BACKING"); assert.equal(a.paused, false);
  b.readyState = 1; b.duration = 2; await player.switchMode("EXAMPLE"); assert.equal(player.timeMs, 4000); assert.equal(player.mode, "BACKING");
});
test("pause / destruction invalident une promesse play en attente", async () => {
  const a = media(); let reject; a.play = () => new Promise((_, fail) => { reject = fail; });
  const player = new TrackTransport(fixture(), a, media()), pending = player.play(); player.dispose(); reject(new Error("aborted")); await pending;
  assert.equal(player.playing, false); assert.equal(player.message, ""); await player.play(); assert.equal(player.playing, false);
});
test("timeline invalide rejetée, sans tri silencieux", () => {
  for (const events of [[{symbol:"A",startMs:-1,endMs:4}], [{symbol:" ",startMs:0,endMs:4}], [{symbol:"A",startMs:4,endMs:4}], [{symbol:"A",startMs:0,endMs:11000}], [{symbol:"A",startMs:3,endMs:5},{symbol:"B",startMs:2,endMs:4}], [{symbol:"A",startMs:0,endMs:5},{symbol:"B",startMs:4,endMs:6}]]) assert.throws(() => decodeBackingTrack({...fixture(),chordTimeline:events}));
  assert.equal(decodeBackingTrack({...fixture(),chordTimeline:[]}).chordTimeline.length, 0);
});
test("URLs sûres et URL backing obligatoire", () => {
  for (const url of ["//example.com/a", "data:audio/wav,a", "http://example.com/a", "https://user:pass@example.com/a", " /audio/a", "https://example.com/ a"]) assert.equal(validAudioUrl(url), false);
  assert.equal(validAudioUrl("/audio/a.mp3"), true); assert.equal(validAudioUrl("https://example.com/a.mp3"), true);
  assert.throws(() => decodeBackingTrack({...fixture(), audio:{...fixture().audio, backingUrl:""}}));
});
test("repository : sauvegarde, recharge, remplacement, suppression et schema protégé", () => {
  let value = null; const storage = { getItem: () => value, setItem: (_, v) => { value = v; } }, repo = new LocalTrackRepository(() => storage);
  repo.save(fixture()); assert.equal(new LocalTrackRepository(() => storage).list()[0].title, "Test");
  repo.save({...fixture(),title:"Autre"}); assert.equal(repo.list().length, 1); assert.equal(repo.list()[0].title,"Autre");
  assert.equal(JSON.parse(value).schemaVersion, 1); repo.remove("test"); assert.deepEqual(repo.list(), []);
  value = '{"schemaVersion":99,"tracks":[]}'; assert.throws(() => repo.save(fixture())); assert.equal(JSON.parse(value).schemaVersion,99);
});

// Catalogue/detail boundary: no network audio or track-specific player behavior.
test("résumé sans URLs ni timeline et détail fidèle au modèle existant",()=>{
 const track=fixture(),summary=decodeBackingTrackSummary(track);
 assert.deepEqual(Object.keys(summary).sort(),['id','slug','title','bpm','key','durationMs'].sort());
 assert.equal('audio' in summary,false);assert.equal('chordTimeline' in summary,false);
 assert.deepEqual(decodeTrackDetail(contentFixture(),summary),decodeContentTrack(contentFixture()));
 for(const field of ['id','slug','title','key','style','bpm','durationMs']) {
  const changed={...track,[field]: typeof track[field]==='number'?track[field]+1:'different'};
  assert.throws(()=>decodeTrackDetail(changed,summary));
 }
});
test("chargement à la demande depuis un fichier statique avec signal d’annulation",async()=>{
 const track=contentFixture(),summary=decodeBackingTrackSummary(track),controller=new AbortController();
 const received=[];
 const fetcher=async(url,options)=>{received.push([url,options.signal]);return {ok:true,json:async()=>track};};
 assert.deepEqual(await loadTrackDetail(summary,controller.signal,fetcher),decodeContentTrack(track));
 assert.deepEqual(received,[["/backing-tracks/test/Track_test.json",controller.signal]]);
 assert.throws(()=>detailPath('../secret'));
});
test("détail inaccessible, JSON erroné ou incohérent refusé",async()=>{
 const summary=decodeBackingTrackSummary(fixture()),signal=new AbortController().signal;
 await assert.rejects(loadTrackDetail(summary,signal,async()=>({ok:false})));
 await assert.rejects(loadTrackDetail(summary,signal,async()=>({ok:true,json:async()=>({})})));
 await assert.rejects(loadTrackDetail(summary,signal,async()=>({ok:true,json:async()=>({...fixture(),id:'other'})})));
});
test("un brouillon incomplet ne peut pas devenir un résumé ou un morceau jouable",()=>{
 assert.throws(()=>decodeBackingTrackSummary({...fixture(),durationMs:null}));
 assert.throws(()=>decodeBackingTrack({...fixture(),audio:{backingUrl:null,exampleOffsetMs:null},chordTimeline:null}));
});

test("Play/Pause et fin dépendent exclusivement du média actif",async()=>{
 const a=media(),b=media(),player=new TrackTransport(fixture(),a,b);
 assert.equal(player.playing,false);await player.play();assert.equal(a.paused,false);assert.equal(player.playing,true);
 a.pause();assert.equal(player.playing,false); // External/native pause, without a transport command.
 await a.play();assert.equal(player.playing,true);
 a.ended=true;assert.equal(player.playing,false);
 a.ended=false;player.pause();assert.equal(a.paused,true);assert.equal(b.paused,true);
});
test("switch préserve la pause native et le volume réel dans les deux sens",async()=>{
 const a=media(),b=media(),player=new TrackTransport(fixture(),a,b);
 player.seek(2500);await player.play();a.pause();a.volume=.23;
 await player.switchMode("EXAMPLE");assert.equal(b.paused,true);assert.equal(b.currentTime,3);assert.equal(b.volume,.23);
 await b.play();b.volume=.37;await player.switchMode("BACKING");assert.equal(a.paused,false);assert.equal(b.paused,true);assert.equal(a.currentTime,2.5);assert.equal(a.volume,.37);
});
test("timeline synthétique G7/C7/D7 : courant, suivant, seek, pause et deux switches",async()=>{
 const track={...fixture(),chordTimeline:[{symbol:'G7',startMs:0,endMs:2000},{symbol:'C7',startMs:2000,endMs:4000},{symbol:'D7',startMs:4000,endMs:6000}]};
 const a=media(),b=media(),player=new TrackTransport(track,a,b);
 for(const [seconds,current,next] of [[.5,'G7','C7'],[2.5,'C7','D7'],[4.5,'D7',undefined]]) {
  a.currentTime=seconds;const result=chordsAt(track.chordTimeline,player.timeMs);assert.equal(result.current.symbol,current);assert.equal(result.next?.symbol,next);
 }
 player.seek(500);player.seek(4500);assert.equal(chordsAt(track.chordTimeline,player.timeMs).current.symbol,'D7');
 player.seek(1000);assert.equal(chordsAt(track.chordTimeline,player.timeMs).current.symbol,'G7');
 await player.play();player.pause();assert.equal(chordsAt(track.chordTimeline,player.timeMs).current.symbol,'G7');
 for(const mode of ['EXAMPLE','BACKING']){await player.switchMode(mode);assert.equal(chordsAt(track.chordTimeline,player.timeMs).current.symbol,'G7');assert.equal(player.playing,false);}
 assert.deepEqual(chordsAt([],player.timeMs),{next:undefined});
});

test("fin naturelle : ne pas interrompre ended ; couper seulement une source plus longue",async()=>{
 const a=media(),player=new TrackTransport(fixture(),a,media());
 a.duration=10;await player.play();a.currentTime=10;player.tick();assert.equal(a.paused,false);
 a.ended=true;assert.equal(player.playing,false);
 a.ended=false;a.duration=11;player.tick();assert.equal(a.paused,true);
});

test("couverture stricte : trous internes, queue vide et aucune extrapolation",()=>{
 const track={...fixture(),durationMs:247880,chordCoverageEndMs:214127,chordTimeline:[{symbol:'G7',startMs:0,endMs:20000},{symbol:'C7',startMs:21000,endMs:210000}]};
 const decoded=decodeBackingTrack(track);assert.equal(decoded.durationMs,247880);assert.equal(decoded.chordCoverageEndMs,214127);assert.deepEqual(decoded.chordTimeline,track.chordTimeline);
 for(const time of [20000,20500,210000,214126,214127,247879]) assert.equal(chordsAt(decoded.chordTimeline,time,decoded.chordCoverageEndMs).current,undefined);
 assert.equal(chordsAt(decoded.chordTimeline,20500,214127).next.symbol,'C7');
 for(const coverage of [-1,247881,NaN,Infinity,null]) assert.throws(()=>decodeBackingTrack({...track,chordCoverageEndMs:coverage}));
 assert.throws(()=>decodeBackingTrack({...track,chordTimeline:[{symbol:'G',startMs:0,endMs:214128}]}));
 assert.equal(decodeBackingTrack({...track,chordTimeline:[]}).chordCoverageEndMs,214127);
 let json=null;const repo=new LocalTrackRepository(()=>({getItem:()=>json,setItem:(_,v)=>{json=v}}));repo.save(track);assert.deepEqual(repo.list()[0],decoded);
});
test("temps logique backing : couverture respectée avec offset positif ou négatif",async()=>{
 const {getBackingLogicalTimeMs}=await import('../../domain/music/backingTracks.ts');
 for(const offset of [-500,0,500]) {
  assert.equal(getBackingLogicalTimeMs((214127+offset)/1000,'EXAMPLE',offset),214127);
  assert.equal(getBackingLogicalTimeMs(214.127,'BACKING',offset),214127);
  const track={...fixture(),durationMs:247880,chordCoverageEndMs:214127,chordTimeline:[{symbol:'G7',startMs:0,endMs:20000},{symbol:'C7',startMs:21000,endMs:214127}],audio:{...fixture().audio,exampleOffsetMs:offset}};
  const a={...media(),duration:249},b={...media(),duration:249},player=new TrackTransport(track,a,b);
  for(const time of [20500,213000,214127,220000]) {player.seek(time);const before=chordsAt(track.chordTimeline,player.logicalTimeMs,214127);await player.switchMode('EXAMPLE');assert.deepEqual(chordsAt(track.chordTimeline,player.logicalTimeMs,214127),before);await player.switchMode('BACKING');assert.deepEqual(chordsAt(track.chordTimeline,player.logicalTimeMs,214127),before);}
 }
 assert.equal(getBackingLogicalTimeMs(.1,'EXAMPLE',500),-400);
});
