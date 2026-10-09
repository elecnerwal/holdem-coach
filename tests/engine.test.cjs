'use strict';
// Run with: node --test tests/engine.test.cjs
// Tests load the actual functions and range tables from index.html, not copied implementations.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const evaluator=fs.readFileSync(path.join(__dirname,'..','src','hand-evaluator.mjs'),'utf8').replace(/\bexport\s+/g,'');
const tagSource=fs.readFileSync(path.join(__dirname,'..','src','strategies','tag.mjs'),'utf8').replace(/^export \{[^\n]*\};?\s*$/gm,'').replace(/\bexport\s+/g,'');
const gameEngine=fs.readFileSync(path.join(__dirname,'..','src','game-engine.mjs'),'utf8').replace(/\bexport\s+/g,'');
function extract(start){
 const at=html.indexOf(start);
 assert.ok(at>=0,'Missing production symbol: '+start);
 const open=html.indexOf('{',at);assert.ok(open>=0);
 let depth=0,quote=null,escaped=false,comment=0;
 for(let i=open;i<html.length;i++){
  const c=html[i],n=html[i+1];
  if(comment===1){if(c==='\n')comment=0;continue}
  if(comment===2){if(c==='*'&&n==='/'){comment=0;i++}continue}
  if(quote){if(escaped){escaped=false;continue}if(c==='\\'){escaped=true;continue}if(c===quote)quote=null;continue}
  if(c==='/'&&n==='/'){comment=1;i++;continue}
  if(c==='/'&&n==='*'){comment=2;i++;continue}
  if(c==='"'||c==="'"||c==='\x60'){quote=c;continue}
  if(c==='{')depth++;
  if(c==='}'&&!--depth)return html.slice(at,i+1);
 }
 throw Error('Unterminated symbol: '+start);
}
const symbols=['function canonHand(','function inRange(','function streetName(','function awardSingle(','function live('];
const tables=[];
function sandbox(extra={}){
 const ctx=vm.createContext({console,...extra});
 const src=evaluator+'\n'+gameEngine+'\n'+tagSource+'\nconst names=i=>i===0?"YOU":"P"+(i+1);\n'+tables.map(extract).join('\n')+'\n'+symbols.map(extract).join('\n');
 vm.runInContext(src,ctx);
 vm.runInContext('globalThis.pos=i=>seatPositions(players,button).pos(i);globalThis.activeSeatIds=()=>seatPositions(players,button).activeSeatIds();globalThis.clockwiseActive=i=>seatPositions(players,button).clockwiseActive(i)',ctx);
 vm.runInContext('globalThis.tagPreflopDecision=createTagStrategy({get players(){return players},get handActions(){return handActions},canonHand,pos,inRange,postClass:()=>({rec:"Check",why:"test"}),state:()=>({street:0,pot:3,currentBet:2,minRaise:2})}).preflop',ctx);
 return ctx;
}
function cards(s){return s.split(' ').map(v=>({r:v[0],s:v[1]}))}
test('hand evaluator: straight beats trips, including K-high straight',()=>{
 const x=sandbox();
 assert.equal(x.eval7(cards('K♥ 7♥ J♦ Q♠ T♦ 9♣ 7♦'))[0],4);
 assert.equal(x.eval7(cards('5♠ 5♣ 5♦ J♦ Q♠ T♦ 9♣'))[0],3);
});
test('hand evaluator: wheel, flush, full house, straight flush',()=>{
 const x=sandbox();
 assert.equal(x.eval7(cards('A♠ 2♦ 3♥ 4♣ 5♠ K♦ Q♣'))[1],5);
 assert.equal(x.eval7(cards('A♥ K♥ Q♥ J♥ 9♥ 2♣ 3♠'))[0],5);
 assert.equal(x.eval7(cards('A♥ A♦ A♠ K♥ K♠ 2♣ 3♠'))[0],6);
 assert.equal(x.eval7(cards('9♥ T♥ J♥ Q♥ K♥ 2♣ 3♠'))[0],8);
});
test('kickers break ties; exact ties compare equal',()=>{
 const x=sandbox();
 assert.ok(x.cmp(x.eval7(cards('A♠ K♣ Q♦ J♥ 9♣ 4♦ 2♥')),x.eval7(cards('A♠ K♣ Q♦ J♥ 8♣ 4♦ 2♥')))>0);
 assert.equal(x.cmp(x.eval7(cards('A♠ K♣ Q♦ J♥ T♣ 4♦ 2♥')),x.eval7(cards('A♠ K♣ Q♦ J♥ T♣ 5♦ 3♥'))),0);
});
test('full-ring positions rotate with button',()=>{
 const x=sandbox({players:Array.from({length:10},()=>({stack:200})),button:0});
 assert.equal(x.pos(0),'BTN');assert.equal(x.pos(1),'SB');assert.equal(x.pos(2),'BB');assert.equal(x.pos(3),'UTG');assert.equal(x.pos(9),'CO');
});
test('preflop RFI: AA opens UTG, 72o folds UTG',()=>{
 const x=sandbox({players:Array.from({length:10},()=>({stack:200,cards:cards('7♣ 2♦')})),button:0,handActions:[]});
 assert.equal(x.tagPreflopDecision({c:2}).rec,'Fold');
 x.players[0].cards=cards('A♠ A♥');
 assert.equal(x.tagPreflopDecision({c:2}).rec,'Raise');
});
test('preflop: BTN 75s overlimps; strong hands isolate',()=>{
 const x=sandbox({players:Array.from({length:10},()=>({stack:200,cards:cards('7♥ 5♥')})),button:0,handActions:[{street:0,i:3,type:'call',betBefore:2}]});
 assert.equal(x.tagPreflopDecision({c:2}).ruleId,'TAG-PF-VS-LIMP-FOLD'); // Documents current baseline: 75s not yet in overlimp list.
 x.players[0].cards=cards('A♠ K♠');
 assert.equal(x.tagPreflopDecision({c:2}).ruleId,'TAG-PF-ISO-VALUE');
});
test('preflop: value three-bet and fold versus open',()=>{
 const x=sandbox({players:Array.from({length:10},()=>({stack:200,cards:cards('A♠ K♠')})),button:0,handActions:[{street:0,i:3,type:'raise',betBefore:2}]});
 assert.equal(x.tagPreflopDecision({c:8}).ruleId,'TAG-PF-3BET-VALUE');
 x.players[0].cards=cards('7♣ 2♦');
 assert.equal(x.tagPreflopDecision({c:8}).rec,'Fold');
});
test('single remaining player wins without showdown and is highlighted',()=>{
 let finished=0;
 const logs=[];
 const x=sandbox({players:[{folded:true,stack:100},{folded:false,stack:80}],pot:25,board:[],ended:false,handWinnerIds:[],log(v){logs.push(v)},finishHand(){finished++}});
 assert.equal(x.awardSingle(),true);
 assert.equal(x.players[1].stack,105);
 assert.equal(x.pot,0);assert.equal(x.ended,true);
 assert.deepEqual(Array.from(x.handWinnerIds),[1]);assert.equal(finished,1);
});
test('street labels preserve strings rather than converting to showdown',()=>{
 const x=sandbox();
 assert.equal(x.streetName('Preflop'),'Preflop');
 assert.equal(x.streetName(3),'River');
});
test('structural invariants: split-pot winner assignment and UI winner class',()=>{
 assert.match(html,/handWinnerIds=winners\.slice\(\)/);
 assert.match(html,/classList\.toggle\("winner",ended&&handWinnerIds\.includes\(i\)\)/);
 assert.match(html,/\.seat\.winner\{outline:2px solid/);
});

test('side pots: short stack wins main pot, deep stack wins side pot',()=>{
 const x=sandbox();
 const players=[{folded:false,cards:cards('A♠ A♥')},{folded:false,cards:cards('K♠ K♥')},{folded:false,cards:cards('Q♠ Q♥')}];
 const result=x.settleShowdown(players,[20,50,50],cards('2♣ 3♦ 7♠ 9♥ J♣'),x.eval7,x.cmp);
 assert.deepEqual(Array.from(result.payouts),[60,60,0]);
 assert.equal(result.pots.length,2);
 assert.equal(result.payouts.reduce((a,b)=>a+b,0),120);
});

test('betting math: call is capped by stack and conserves chips',()=>{
 const x=sandbox();
 const w=x.calculateWager({stack:7,streetBet:2,currentBet:20,minRaise:18,pot:40},'call');
 assert.equal(w.pay,7);assert.equal(w.toBet,9);assert.equal(w.newPot,47);assert.equal(w.allin,true);
});
test('betting math: raise updates current bet and minimum raise',()=>{
 const x=sandbox();
 const w=x.calculateWager({stack:100,streetBet:2,currentBet:8,minRaise:6,pot:30},'raise',26);
 assert.equal(w.pay,24);assert.equal(w.newPot,54);assert.equal(w.newCurrentBet,26);assert.equal(w.newMinRaise,18);
});
test('round completion and next actor ignore folded and all-in seats',()=>{
 const x=sandbox();
 const ps=[{folded:false,allin:false,streetBet:10},{folded:true,allin:false,streetBet:0},{folded:false,allin:true,streetBet:6},{folded:false,allin:false,streetBet:10}];
 assert.equal(x.bettingRoundComplete(ps,new Set([0,3]),10),true);
 assert.equal(x.bettingRoundComplete(ps,new Set([0]),10),false);
 assert.equal(x.nextActionableSeat(ps,0),3);
});

test('deck module: 52 unique cards and draw removes exactly one',async()=>{
 const {createShuffledDeck,drawCard}=await import('../src/deck.mjs');
 const deck=createShuffledDeck('23456789TJQKA',['♠','♥','♦','♣']);
 assert.equal(deck.length,52);
 assert.equal(new Set(deck.map(c=>c.r+c.s)).size,52);
 const card=drawCard(deck);
 assert.ok(card.r&&card.s);
 assert.equal(deck.length,51);
});
test('deck module: deterministic shuffle using injected RNG',async()=>{
 const {createShuffledDeck}=await import('../src/deck.mjs');
 const a=createShuffledDeck('23456789TJQKA',['♠','♥','♦','♣'],()=>0.5);
 const b=createShuffledDeck('23456789TJQKA',['♠','♥','♦','♣'],()=>0.5);
 assert.deepEqual(a,b);
});
