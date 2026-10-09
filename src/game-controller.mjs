// Pure hand controller. Owns the sequence of a hand; UI owns timing and presentation.
import {nextDealer,initializeHand,advanceStreet,applyBettingAction,bettingRoundComplete,nextActionableSeat,shouldRunOut,settleUncontested,finishShowdown,legalActions} from './poker-engine.mjs';

export function createHand(stacks,previousButton,deck,styles=[]){
 const rotation=nextDealer(stacks,previousButton);
 if(!rotation)return null;
 const setup=initializeHand(stacks,rotation.button,deck,styles);
 return {
  players:setup.players,button:rotation.button,deck,board:[],street:0,
  pot:setup.pot,currentBet:setup.currentBet,minRaise:2,actor:setup.actor,
  acted:new Set(),raiseLocked:new Set(),streetActions:[],handActions:[],
  handStartStacks:setup.players.map(p=>p.stack),ended:false,setup
 };
}
export function takeAction(state,seat,type,target=0,position=''){
 const p=state.players[seat];
 if(!p)throw Error('Invalid player');
 const toCall=Math.max(0,state.currentBet-p.streetBet);
 if(type==='raise'){
  const rights=legalActions(state,seat);
  const max=p.streetBet+p.stack;
  const minimum=state.currentBet?state.currentBet+state.minRaise:Math.max(2,state.minRaise);
  if(!rights.raise||max<=state.currentBet)type=toCall?'call':'check';
  else target=Math.min(max,Math.max(target,Math.min(max,minimum)));
 }
 const result=applyBettingAction({...state,position},seat,type,target);
 // applyBettingAction can replace sets rather than mutate them.
 // A single shared transition object ensures the caller receives those changes.
 return {type,...result};
}
export function act(state,seat,type,target=0,position=''){
 const p=state.players[seat];
 if(!p)throw Error('Invalid player');
 const toCall=Math.max(0,state.currentBet-p.streetBet);
 if(type==='raise'){
  const rights=legalActions(state,seat),max=p.streetBet+p.stack;
  const minimum=state.currentBet?state.currentBet+state.minRaise:Math.max(2,state.minRaise);
  if(!rights.raise||max<=state.currentBet)type=toCall?'call':'check';
  else target=Math.min(max,Math.max(target,Math.min(max,minimum)));
 }
 state.position=position;
 const result=applyBettingAction(state,seat,type,target);
 return {type,...result};
}
export function roundComplete(state){
 return bettingRoundComplete(state.players,state.acted,state.currentBet);
}
export function nextActor(state,seat){
 return nextActionableSeat(state.players,seat);
}
export function dealNextStreet(state){
 if(state.street===3)return null;
 const next=advanceStreet(state);
 Object.assign(state,{street:next.street,board:next.board,currentBet:next.currentBet,minRaise:next.minRaise,actor:next.actor,acted:new Set(),raiseLocked:new Set(),streetActions:[]});
 return next;
}
export function needsRunout(state){
 return !state.ended&&shouldRunOut(state.players,state.currentBet);
}
export function runout(state){
 if(!needsRunout(state))return [];
 const dealt=[];
 while(state.street<3)dealt.push(dealNextStreet(state));
 return dealt;
}
export function awardUncontested(state){
 return settleUncontested(state);
}
export function resolveShowdown(state,eval7,cmp){
 return finishShowdown(state,eval7,cmp);
}
