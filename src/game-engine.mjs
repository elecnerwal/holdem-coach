// Pure game-engine primitives: seats, turn order and showdown side-pot accounting.
export function seatPositions(seats,dealer){
function activeSeatIds(){return seats.map((p,i)=>p&&p.stack>0?i:-1).filter(i=>i>=0)}
function clockwiseActive(from){let a=[];for(let n=1;n<=seats.length;n++){let j=(from+n)%seats.length;if(seats[j]&&seats[j].stack>0)a.push(j)}return a}
function pos(i){
 let active=activeSeatIds();if(!active.includes(i))return "OUT";
 let order=[dealer,...clockwiseActive(dealer)];
 let idx=order.indexOf(i),n=active.length;
 if(n===2)return idx===0?"BTN/SB":"BB";
 if(idx===0)return "BTN";if(idx===1)return "SB";if(idx===2)return "BB";
 let pre=n-idx;
 const labels={1:"CO",2:"HJ",3:"LJ",4:"MP2",5:"MP1",6:"UTG+1",7:"UTG"};
 return labels[pre]||("UTG+"+Math.max(0,pre-1));
}

return {activeSeatIds,clockwiseActive,pos};
}
export function settleShowdown(players,contributions,board,eval7,cmp){
 const levels=[...new Set(contributions.filter(x=>x>0))].sort((a,b)=>a-b);
 const payouts=Array(players.length).fill(0),pots=[];let prev=0;
 for(const level of levels){
  const participants=contributions.map((x,i)=>x>=level?i:-1).filter(i=>i>=0);
  const amount=(level-prev)*participants.length;prev=level;if(!amount)continue;
  const eligible=participants.filter(i=>!players[i].folded);if(!eligible.length)continue;
  let best=null,winners=[];
  for(const i of eligible){const rank=eval7(players[i].cards.concat(board));if(!best||cmp(rank,best)>0){best=rank;winners=[i]}else if(cmp(rank,best)===0)winners.push(i)}
  const share=Math.floor(amount/winners.length),remainder=amount-share*winners.length;
  winners.forEach((i,k)=>payouts[i]+=share+(k===0?remainder:0));
  pots.push({amount,winners,rank:best});
 }
 return {payouts,pots};
}

/** Compute a wager without mutating state. Caller applies the returned patch. */
export function calculateWager({stack,streetBet,currentBet,minRaise,pot},type,target=0){
 const toCall=Math.max(0,currentBet-streetBet);
 if(type==="fold"||type==="check")return {type,pay:0,toBet:streetBet,newPot:pot,newCurrentBet:currentBet,newMinRaise:minRaise,allin:stack===0};
 if(type==="call"){
  const pay=Math.min(toCall,stack);
  return {type,pay,toBet:streetBet+pay,newPot:pot+pay,newCurrentBet:currentBet,newMinRaise:minRaise,allin:pay===stack};
 }
 if(type==="raise"){
  const toBet=Math.min(target,streetBet+stack),pay=toBet-streetBet;
  return {type,pay,toBet,newPot:pot+pay,newCurrentBet:toBet,newMinRaise:Math.max(2,toBet-currentBet),allin:pay===stack};
 }
 throw Error("Unknown betting action: "+type);
}
export function bettingRoundComplete(players,acted,currentBet){
 const actionable=players.map((p,i)=>!p.folded&&!p.allin?i:-1).filter(i=>i>=0);
 return actionable.length===0||actionable.every(i=>acted.has(i)&&players[i].streetBet===currentBet);
}
export function nextActionableSeat(players,from){
 for(let n=1;n<=players.length;n++){const i=(from+n)%players.length;if(!players[i].folded&&!players[i].allin)return i}
 return -1;
}

/** Apply an already calculated call to the player's state. Returns its chip payment. */
export function applyCall(player,wager){
 player.stack-=wager.pay;
 player.streetBet=wager.toBet;
 player.action="Call "+wager.pay;
 if(player.stack===0)player.allin=true;
 return wager.pay;
}

/**
 * Authoritative betting state transition. Mutates the supplied game state,
 * player and action histories. Presentation (sounds/logs) stays in the UI.
 * Rejects invalid actions before changing chips or action history.
 */
export function applyBettingAction(state,i,type,target=0){
 const {players,board,street,position,streetActions,handActions}=state;
 const p=players[i];
 if(!p||p.folded||p.allin)throw Error("Player cannot act");
 const toCall=Math.max(0,state.currentBet-p.streetBet);
 const maxBet=p.streetBet+p.stack;
 if(type==="check"&&toCall>0)throw Error("Cannot check facing a bet");
 if(type==="call"&&toCall===0)throw Error("Nothing to call");
 if(type==="raise"){
  if(!Number.isFinite(target)||!Number.isInteger(target)||target<=state.currentBet||target>maxBet)throw Error("Invalid raise target");
  if(target<state.currentBet+state.minRaise&&target!==maxBet)throw Error("Raise below minimum");
 }
 if(!["fold","check","call","raise"].includes(type))throw Error("Unknown action");
 const potBefore=state.pot,betBefore=state.currentBet,fromBet=p.streetBet;
 let amount=0,actionText="",allin=false;
 if(type==="fold"){p.folded=true;p.action="Fold";actionText="folds";}
 else if(type==="check"){p.action="Check";actionText="checks";}
 else {
  const wager=calculateWager({stack:p.stack,streetBet:p.streetBet,currentBet:state.currentBet,minRaise:state.minRaise,pot:state.pot},type,target);
  amount=wager.pay;
  p.stack-=amount;p.streetBet=wager.toBet;state.pot=wager.newPot;
  if(type==="call"){p.action="Call "+amount;actionText="calls "+amount;}
  else {state.currentBet=wager.newCurrentBet;state.minRaise=wager.newMinRaise;p.action=betBefore?"Raise to "+target:"Bet "+target;actionText=p.action.toLowerCase();}
  allin=p.stack===0;if(allin)p.allin=true;
 }
 if(type==="raise")state.acted=new Set([i]);else state.acted.add(i);
 const record={i,type,amount,potBefore,betBefore,fromBet,toBet:p.streetBet,potAfter:state.pot,position,street,board:board.map(c=>({...c}))};
 if(type==="raise")record.target=target;
 streetActions.push(record);handActions.push(record);
 return {record,actionText,allin};
}
/** Award an uncontested pot without exposing any player's cards. */
export function settleUncontested(state){
 const remaining=state.players.map((p,i)=>!p.folded?i:-1).filter(i=>i>=0);
 if(remaining.length!==1)return null;
 const winner=remaining[0],amount=state.pot;
 state.players[winner].stack+=amount;state.pot=0;state.ended=true;
 return {winner,amount};
}
/** Distribute showdown winnings and close the hand. */
export function finishShowdown(state,eval7,cmp){
 const contributions=state.players.map((p,i)=>Math.max(0,state.handStartStacks[i]-p.stack));
 const settlement=settleShowdown(state.players,contributions,state.board,eval7,cmp);
 for(let i=0;i<state.players.length;i++)state.players[i].stack+=settlement.payouts[i];
 const totalPot=state.pot;
 state.pot=0;state.street=4;state.ended=true;
 return {...settlement,totalPot,winners:settlement.payouts.map((n,i)=>n>0?i:-1).filter(i=>i>=0)};
}
