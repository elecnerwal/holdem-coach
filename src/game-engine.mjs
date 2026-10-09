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
