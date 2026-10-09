// Pure hand setup: seat rotation, player creation, and blind posting.
// UI, timers, and persistent bankroll/rebuy decisions remain with the caller.
export function nextDealer(stacks,previousButton){
 const active=stacks.map((stack,i)=>stack>0?i:-1).filter(i=>i>=0);
 if(active.length<2)return null;
 return {active,button:active.find(i=>i>previousButton)??active[0]};
}
export function initializeHand(stacks,button,deck,styles=[]){
 const players=stacks.map((stack,i)=>{
  const out=stack<=0;
  return {cards:out?[]:[deck.pop(),deck.pop()],stack,streetBet:0,folded:out,allin:false,action:out?"OUT":"",style:styles[i]||"Hero"};
 });
 const active=stacks.map((stack,i)=>stack>0?i:-1).filter(i=>i>=0);
 if(active.length<2)throw Error("At least two active players required");
 const clockwise=[];
 for(let n=1;n<=players.length;n++){
  const j=(button+n)%players.length;
  if(players[j].stack>0)clockwise.push(j);
 }
 const sb=active.length===2?button:clockwise[0],bb=active.length===2?clockwise[0]:clockwise[1];
 const sbPay=Math.min(1,players[sb].stack),bbPay=Math.min(2,players[bb].stack);
 for(const [seat,amount,label] of [[sb,sbPay,"SB"],[bb,bbPay,"BB"]]){
  const p=players[seat];p.stack-=amount;p.streetBet=amount;p.action=label+" $"+amount;if(!p.stack)p.allin=true;
 }
 return {players,sb,bb,sbPay,bbPay,pot:sbPay+bbPay,currentBet:Math.max(sbPay,bbPay),actor:active.length===2?sb:clockwise.find(i=>i!==sb&&i!==bb&&players[i].stack>0)??-1};
}
