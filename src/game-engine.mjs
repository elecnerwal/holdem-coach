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
