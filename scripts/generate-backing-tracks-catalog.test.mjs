import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rename } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { scanBackingTracks, generateBackingTracksCatalog } from './generate-backing-tracks-catalog.mjs';
import { TRACK_ID, BACKING_FILE, EXAMPLE_FILE, TRACK_FILE, decodeContentTrack } from '../src/features/backing-tracks/content.ts';
import { decodeTrackDetail, loadTrackDetail } from '../src/features/backing-tracks/detail.ts';
import { queryTracks } from '../src/features/backing-tracks/library.ts';

const detail = (id='test_01') => ({id,title:'Test',style:'blues',key:'G',bpm:115,durationMs:9000,chordCoverageEndMs:6000,chordTimeline:[{symbol:'G7',startMs:0,endMs:6000}],analysis:{offsetMs:9999}});
async function fixture(options={}) {
  const root=await mkdtemp(join(tmpdir(),'fretlab-catalog-'));
  const id=options.id??'test_01',folder=join(root,id);await mkdir(folder);
  const files={[options.backing??'Backingtrack_'+id+'.mp3']:'audio',[options.example??'Example_'+id+'.mp3']:'audio',[options.json??'Track_'+id+'.json']:JSON.stringify(options.data??detail(id))};
  for(const [name,value] of Object.entries(files)) if(name!==options.omit) await writeFile(join(folder,name),value);
  return {root,folder,id};
}
test('regex officielles : casse, underscores, captures et dossiers invalides',()=>{
  for(const id of ['a-frame-blues','slow_rock-01','0']) assert.ok(TRACK_ID.test(id));
  for(const id of ['_hidden','Bad','a b','../track']) assert.equal(TRACK_ID.test(id),false);
  for(const [regex,prefix,ext] of [[BACKING_FILE,'Backingtrack','mp3'],[EXAMPLE_FILE,'Example','mp3'],[TRACK_FILE,'Track','json']]){
    assert.equal(regex.exec(prefix+'_test_01.'+ext)[1],'test_01');
    assert.equal(regex.test(prefix.toLowerCase()+'_test_01.'+ext),false);
    assert.equal(regex.test(prefix+'_other.wav'),false);
  }
});
test('génération déterministe, détails chargés, filtres et extras ignorés',async()=>{
  const {root,folder}=await fixture();
  await mkdir(join(root,'_analysis'));await mkdir(join(folder,'_analysis'));
  await writeFile(join(root,'root.txt'),'ignored');await writeFile(join(folder,'score.mid'),'ignored');
  const entries=await generateBackingTracksCatalog(root);
  assert.equal(entries.length,1);assert.equal(entries[0].detailUrl,'/backing-tracks/test_01/Track_test_01.json');
  assert.equal('chordTimeline' in entries[0],false);assert.equal('analysis' in entries[0],false);
  assert.deepEqual(JSON.parse(await readFile(join(root,'catalog.generated.json'),'utf8')),entries);
  assert.deepEqual(await generateBackingTracksCatalog(root),entries);
  const track=await loadTrackDetail(entries[0],new AbortController().signal,async(url)=>{
    assert.equal(url,entries[0].detailUrl);return {ok:true,json:async()=>detail()};
  });
  assert.equal(track.chordTimeline[0].symbol,'G7');assert.equal(track.audio.exampleOffsetMs,0);
  assert.equal(track.audio.backingUrl,entries[0].backingUrl);assert.equal('analysis' in track,false);
  assert.equal(queryTracks(entries,{genre:'blues',key:'G',tempoRange:'90-120',page:1}).total,1);
  assert.throws(()=>decodeTrackDetail({...detail(),bpm:120},entries[0]));
});
test('erreurs explicites : dossier, mismatch fichier/JSON, fichiers manquants, doublons, JSON invalide',async()=>{
  for(const options of [{id:'Bad'},{backing:'Backingtrack_other.mp3'},{example:'Example_other.mp3'},{json:'Track_other.json'},{data:detail('other')},{omit:'Example_test_01.mp3'},{omit:'Backingtrack_test_01.mp3'},{omit:'Track_test_01.json'}]){
    const {root}=await fixture(options);await assert.rejects(scanBackingTracks(root),/\[.*\]/);
  }
  const {root,folder}=await fixture();await writeFile(join(folder,'Backingtrack_other.mp3'),'audio');
  await assert.rejects(scanBackingTracks(root),/exactement 1/);
  await rename(join(folder,'Backingtrack_other.mp3'),join(folder,'extra.mp3'));
  await writeFile(join(folder,'Track_test_01.json'),'{bad');
  await assert.rejects(scanBackingTracks(root),/test_01/);
});
test('validation musicale réutilisée, URLs interdites et analysis sans effet',()=>{
  assert.throws(()=>decodeContentTrack({...detail(),audio:{}}));
  assert.throws(()=>decodeContentTrack({...detail(),bpm:0}));
  assert.throws(()=>decodeContentTrack({...detail(),chordCoverageEndMs:5000}));
  assert.equal(decodeContentTrack({...detail(),exampleOffsetMs:300}).audio.exampleOffsetMs,300);
});
test('vrai contenu publié : timeline préservée sans modification',async()=>{
  const entries=await scanBackingTracks(join(process.cwd(),'public/backing-tracks'));
  for(const entry of entries){
    const raw=JSON.parse(await readFile(join(process.cwd(),'public',entry.detailUrl),'utf8'));
    const track=decodeTrackDetail(raw,entry);
    assert.deepEqual(track.chordTimeline,raw.chordTimeline);
    assert.equal(track.chordCoverageEndMs,raw.chordCoverageEndMs);
  }
});
