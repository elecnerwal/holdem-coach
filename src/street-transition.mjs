// Pure transition from preflop/flop/turn to the next betting street.
// The caller retains ownership of game state, sounds, logs and showdown.
export function advanceStreet({street,players,board,deck,button}){
 if(street<0||street>=3)throw Error("No further community-card street");
 const next=street+1;
 const count=next===1?3:1;
 const newBoard=board.concat(Array.from({length:count},()=>deck.pop()));
 const newPlayers=players.map(p=>({...p,streetBet:0,action:""}));
 let actor=-1;
 for(let n=1;n<=newPlayers.length;n++){
  const i=(button+n)%newPlayers.length;
  if(!newPlayers[i].folded&&!newPlayers[i].allin){actor=i;break}
 }
 return {street:next,players:newPlayers,board:newBoard,currentBet:0,minRaise:2,actor,dealCount:count,label:next===1?"Flop dealt.":next===2?"Turn dealt.":"River dealt."};
}
