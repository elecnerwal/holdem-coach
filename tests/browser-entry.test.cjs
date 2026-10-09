'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const script=html.match(/<script type="module">([\s\S]*?)<\/script>/);
test('browser entry script parses after removing static imports',()=>{
 assert.ok(script,'Missing browser module script');
 const source=script[1].replace(/^import .*?;\s*$/gm,'');
 assert.doesNotThrow(()=>new vm.Script(source,{filename:'index.html'}));
});
test('poker state is session-owned, without sync mirrors',()=>{
 assert.doesNotMatch(script[1],/function syncController\s*\(/);
 assert.match(script[1],/gameSession\.begin\(hand\)/);
 assert.match(script[1],/gameSession\.state\.players/);
 assert.doesNotMatch(script[1],/let deck=\[\], players=/);
});

test('session preserves one authoritative state through actions and showdown',async()=>{
 const {createGameSession}=await import('../src/game-session.mjs');
 const session=createGameSession();
 const hand={players:[{stack:200},{stack:200}],board:[],deck:[],button:0,street:0,pot:3,currentBet:2,minRaise:2,actor:1,acted:new Set(),raiseLocked:new Set(),streetActions:[],handActions:[],handStartStacks:[200,200],ended:false};
 const active=session.begin(hand);
 assert.strictEqual(session.state,active);
 session.setActor(0);
 assert.equal(active.actor,0);
 session.rebuy(0,200);
 assert.equal(active.players[0].stack,200);
 assert.throws(()=>session.rebuy(0,-10),/Invalid rebuy/);
 active.players[0].stack=198;active.players[1].stack=199;
 session.clearPot();
 assert.equal(session.state.pot,0);
 session.finish();
 assert.equal(active.ended,true);
 session.assertFinite();
 active.players[0].stack=NaN;
 assert.throws(()=>session.assertFinite(),/Invalid stack/);
});

test('entrypoint delegates DOM presentation to UI modules',()=>{
 const source=script[1];
 assert.doesNotMatch(source,/\$\("[^"]+"\)\.(?:textContent|innerHTML|style|classList|onclick|onchange)\b/);
 for(const name of ['audio-ui.mjs','session-ui.mjs','coach-ui.mjs','chat-ui.mjs','game-controls-ui.mjs','table-ui.mjs']){
  assert.ok(source.includes(name),'Missing UI module '+name);
 }
});
