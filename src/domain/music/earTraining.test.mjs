import { test } from "node:test";
import assert from "node:assert/strict";
import { earExercises, drawEarExercise, earNoteStarts } from "./earTraining.ts";
import { SHARP_NOTES, parseNote } from "./pitch.ts";
import { chordFromSymbol } from "./harmony.ts";
test("sélection 3/4 notes et sens : pools stricts, complets et équiprobables",()=>{
 for(const root of SHARP_NOTES) {
  const three=earExercises(root,'chord',{chordSize:'3'}), four=earExercises(root,'chord',{chordSize:'4'});
  assert.equal(three.length,7);assert.equal(four.length,17);
  assert(three.every(e=>e.midi.length===3));assert(four.every(e=>e.midi.length===4));
  for(const direction of ['ascending','descending']) {
   const pool=earExercises(root,'interval',{direction});assert.equal(pool.length,12);
   assert(pool.every(e=>direction==='ascending'?e.midi[1]>e.midi[0]:e.midi[1]<e.midi[0]));
   assert.deepEqual(pool.map(e=>Math.abs(e.midi[1]-e.midi[0])),Array.from({length:12},(_,i)=>i+1));
  }
  for(const pool of [three,four,earExercises(root,'interval',{direction:'descending'})]) {
   const selected=Array.from({length:pool.length},(_,i)=>drawEarExercise(pool,()=> (i+.5)/pool.length));
   assert.deepEqual(selected,pool);
  }
 }
 assert.equal(earExercises('C','interval').length,25);
 assert.equal(earExercises('C','chord',{direction:'descending'}).length,24);
 assert.equal(earExercises('C','interval',{chordSize:'3'}).length,25);
 assert.throws(()=>earExercises('C','chord',{chordSize:'5'}));
});
test("24 voicings courants, sans doublons, trois ou quatre notes",()=>{
 const pool=earExercises('C','chord');
 assert.equal(pool.length,24);
 assert.equal(new Set(pool.map(e=>e.midi.join(','))).size,24);
 for(const e of pool) {
  assert([3,4].includes(e.midi.length));assert(chordFromSymbol(e.answer));
  assert.equal(e.midi[0],60);
 }
 for(const [symbol,offsets,names] of [
  ['Csus2',[0,2,7],['C','D','G']],['Csus4',[0,5,7],['C','F','G']],
  ['C7',[0,4,7,10],['C','E','G','Bb']],['Cmaj7',[0,4,7,11],['C','E','G','B']],
  ['Cm7b5',[0,3,6,10],['C','Eb','Gb','Bb']],['Cdim7',[0,3,6,9],['C','Eb','Gb','A']],
  ['CmMaj7',[0,3,7,11],['C','Eb','G','B']],['C6',[0,4,7,9],['C','E','G','A']],
  ['Cadd9',[0,4,7,14],['C','E','G','D']],['C7sus4',[0,5,7,10],['C','F','G','Bb']],
  ['C7#5',[0,4,8,10],['C','E','G#','Bb']],['Cmaj7b5',[0,4,6,11],['C','E','Gb','B']],
 ]) {
  const e=pool.find(e=>e.answer===symbol);assert(e,symbol);
  assert.deepEqual(e.midi,offsets.map(n=>n+60));assert.deepEqual(e.notes,names);
 }
 assert.equal(earNoteStarts(4).length,4);
 assert(Math.abs(earNoteStarts(4)[3]-2.1)<1e-10);
 assert.deepEqual(earNoteStarts(4,true),[0,0,0,0]);
});
test("quatre triades sur la même fondamentale, sans renversement", () => {
 const pool=earExercises('C','chord').slice(0,4);
 assert.deepEqual(pool.map(e=>e.answer),['C','Cm','Cdim','Caug']);
 assert.deepEqual(pool.map(e=>e.midi),[[60,64,67],[60,63,67],[60,63,66],[60,64,68]]);
 assert.deepEqual(earExercises('Bb','chord')[0].notes,['Bb','D','F']);
});
test("fondamentale et première note respectées pour les 12 notes",()=>{
 for(const root of SHARP_NOTES) for(const kind of ['chord','interval']) for(const e of earExercises(root,kind)) {
  assert.equal(e.midi[0]%12,parseNote(root).pitchClass);assert.equal(e.notes[0],root);
  e.notes.forEach((n,i)=>assert.equal(parseNote(n).pitchClass,e.midi[i]%12));
  if(kind==='chord') assert(e.midi.every((n,i)=>i===0||n>e.midi[i-1]));
 }
});
test("intervalles chromatiques simples dans les deux sens, unisson unique",()=>{
 const pool=earExercises('C','interval');assert.equal(pool.length,25);
 assert.equal(new Set(pool.map(e=>e.id)).size,25);
 assert.deepEqual(pool.map(e=>e.midi[1]-e.midi[0]).sort((a,b)=>a-b),Array.from({length:25},(_,i)=>i-12));
 assert.deepEqual(pool.find(e=>e.id==='interval-12--1').midi,[60,48]);
 assert.deepEqual(pool.find(e=>e.id==='interval-3--1').notes,['C','A']);
 assert.match(pool.find(e=>e.id==='interval-6-1').answer,/Triton/);
});
test("tirages équiprobables indépendants, répétitions, frontières et immutabilité",()=>{
 for(const kind of ['chord','interval']) {
  const pool=earExercises('C',kind), before=JSON.stringify(pool), counts=new Map();
  for(let i=0;i<pool.length*100;i++) {const e=drawEarExercise(pool,()=> (i+.5)/(pool.length*100));counts.set(e.id,(counts.get(e.id)||0)+1);}
  assert.deepEqual([...counts.values()],pool.map(()=>100));
  assert.equal(drawEarExercise(pool,()=>0),drawEarExercise(pool,()=>0));
  assert.equal(drawEarExercise(pool,()=>.999999),pool.at(-1));assert.equal(JSON.stringify(pool),before);
 }
 assert.throws(()=>drawEarExercise([],()=>0));assert.throws(()=>drawEarExercise(earExercises('C','chord'),()=>1));
});
test("départs 700 ms, accords et intervalles simultanés",()=>{
 assert.deepEqual(earNoteStarts(3),[0,.7,1.4]);assert.deepEqual(earNoteStarts(2),[0,.7]);
 assert.deepEqual(earNoteStarts(3,true),[0,0,0]);assert.deepEqual(earNoteStarts(2,true),[0,0]);
 assert.throws(()=>earNoteStarts(0));assert.throws(()=>earExercises('H','chord'));
});
