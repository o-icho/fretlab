import { normalizeBackingTrackKeyRoot } from "./keys.ts";
import { test } from "node:test";
import assert from "node:assert/strict";
import styles from "../../data/backing-tracks/backing-track-styles.json" with { type: "json" };
import { filterOptions, readFilters, queryTracks, filterQuery } from "./library.ts";
import { BACKING_TRACK_TEMPO_RANGES, matchesTempoRange, validateStyles } from "./filterConfig.ts";
const tracks = Array.from({length:30}, (_, i) => ({id:String(i),style:i%2 ? "rock":"blues",key:i%3 ? "C#":"Db",bpm:80+i}));
test("sans filtres : ordre et pagination stables",()=>{
 const f=readFilters(new URLSearchParams(),tracks), r=queryTracks(tracks,f);
 assert.equal(r.total,30);assert.equal(r.items.length,12);assert.equal(r.pages,3);assert.equal(r.items[0].id,"0");assert.equal(filterQuery(f),"");
 assert.equal(queryTracks(tracks,{...f,page:2}).items[0].id,"12");
});
test("styles exclusivement issus du JSON, même catalogue vide ou style inconnu",()=>{
 assert.deepEqual(filterOptions(tracks).styles,styles);
 assert.deepEqual(filterOptions([]).styles,styles);
 assert.deepEqual(filterOptions([{style:"Jazz",key:"G"}]).styles,styles);
 assert.throws(()=>validateStyles([...styles,styles[0]]));
 assert.equal(filterOptions().keys.length,12);
 assert.equal(readFilters(new URLSearchParams("genre=funk"),[]).genre,"funk");
 assert.equal(queryTracks(tracks,{genre:"funk",page:1}).total,0);
});
test("style + tonalité + tempo AND avant pagination",()=>{
 const f=readFilters(new URLSearchParams("genre=blues&key=C%23&tempo=90-120"),tracks);
 assert.deepEqual(queryTracks(tracks,f).items.map(t=>t.id),["10","12","14","16","18","20","22","24","26","28"]);
 assert.equal(queryTracks(tracks,{...f,key:"C#"}).items.every(t=>["C#","Db"].includes(t.key)),true);
 assert.equal(queryTracks([{style:"Blues",bpm:100,key:"Db"}],f).total,1);
});
for(const [bpm,id] of [[59,"under-60"],[60,"60-90"],[89,"60-90"],[90,"90-120"],[119,"90-120"],[120,"120-180"],[179,"120-180"],[180,"180-220"],[220,"180-220"],[221,"over-220"],[89.99,"60-90"],[220.01,"over-220"]]) {
 test(`${bpm} BPM appartient uniquement à ${id}`,()=>{assert.deepEqual(BACKING_TRACK_TEMPO_RANGES.filter(r=>matchesTempoRange(bpm,r.id)).map(r=>r.id),[id]);assert.equal(matchesTempoRange(bpm),true);});
}
test("paramètres valides, invalides et anciennes bornes ignorées",()=>{
 const f=readFilters(new URLSearchParams("genre=Jazz&key=invalid&tempo=invalid&page=Infinity&tempoMin=90&tempoMax=120"),tracks);
 assert.equal(filterQuery(f),"");
 assert.equal(readFilters(new URLSearchParams("tempo=90-120"),tracks).tempoRange,"90-120");
 assert.equal(readFilters(new URLSearchParams("page=1.5"),tracks).page,1);
 assert.equal(queryTracks(tracks,{page:999}).page,3);
});
test("zéro résultat, reset, aller-retour URL et retour page 1 lors de l’application",()=>{
 const f=readFilters(new URLSearchParams("key=Db&tempo=over-220&page=2"),tracks);
 assert.equal(queryTracks(tracks,f).total,0);assert.equal(queryTracks(tracks,f).page,1);
 assert.equal(filterQuery({page:1}),"");
 const valid=readFilters(new URLSearchParams("genre=rock&tempo=90-120&page=2"),tracks);
 assert.deepEqual(readFilters(new URLSearchParams(filterQuery(valid)),tracks),valid);
 assert.equal(filterQuery({...valid,page:1}).includes("page="),false);
 assert.equal(queryTracks([],{page:99}).page,1);
});

test("tonalités prédéfinies dans l’ordre, indépendantes du catalogue",()=>{
 const expected=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
 assert.deepEqual(filterOptions().keys.map(k=>k.id),expected);
 assert.deepEqual(filterOptions().keys.map(k=>k.label),expected);
 assert.equal(readFilters(new URLSearchParams("key=F%23")).key,"F#");
});
for(const [input,root] of [["A","A"],["Am","A"],["A minor","A"],["C#m","C#"],["C# minor","C#"],["G# minor","G#"],["Bb","A#"],["Bbm","A#"],["Eb minor","D#"],["Ebm","D#"],["Db","C#"],["Gb","F#"],["Ab","G#"]]) {
 test(`fondamentale ${input} → ${root}, sans modifier la donnée`,()=>{
  const track={key:input,bpm:100};
  assert.equal(normalizeBackingTrackKeyRoot(input),root);
  assert.equal(queryTracks([track],{key:root,page:1}).total,1);
  assert.equal(track.key,input);
 });
}
test("valeurs de tonalité invalides et URL dièse encodée / reset",()=>{
 for(const key of ["","H","Am7","Apple","C##","unknown"]) assert.equal(normalizeBackingTrackKeyRoot(key),undefined);
 for(const key of ["Db","Am","F♯","invalid"]) assert.equal(readFilters(new URLSearchParams({key})).key,undefined);
 const query=filterQuery({key:"F#",page:1});assert.equal(query,"key=F%23");
 const url=new URL('/backing-tracks?'+query,'https://fretlab.fr');assert.equal(url.hash,"");assert.equal(readFilters(url.searchParams).key,"F#");
 assert.equal(new URLSearchParams(filterQuery({page:1})).has("key"),false);
});
