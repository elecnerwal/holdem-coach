// TAG strategy; receives live state through a narrow adapter.
const openRanges={
 UTG:["55+","A2s","A3s","A4s","A5s","A6s","A7s","A8s","A9s","ATs","AJs","AQs","AKs","K9s","KTs","KJs","KQs","Q9s","QTs","QJs","J9s","JTs","T9s","98s","87s","76s","ATo","AJo","AQo","AKo","KJo","KQo","QJo"],
 BTN:["22+","A2s","A3s","A4s","A5s","A6s","A7s","A8s","A9s","ATs","AJs","AQs","AKs","K5s","K6s","K7s","K8s","K9s","KTs","KJs","KQs","Q7s","Q8s","Q9s","QTs","QJs","J7s","J8s","J9s","JTs","T7s","T8s","T9s","97s","98s","86s","87s","75s","76s","65s","54s","A8o","A9o","ATo","AJo","AQo","AKo","KTo","KJo","KQo","QTo","QJo","JTo"],
 SB:["22+","A2s","A3s","A4s","A5s","A6s","A7s","A8s","A9s","ATs","AJs","AQs","AKs","K5s","K6s","K7s","K8s","K9s","KTs","KJs","KQs","Q7s","Q8s","Q9s","QTs","QJs","J7s","J8s","J9s","JTs","T8s","T9s","98s","87s","76s","65s","A8o","A9o","ATo","AJo","AQo","AKo","KTo","KJo","KQo","QTo","QJo","JTo"],
 BB:[],
 "UTG":["77+","A9s","ATs","AJs","AQs","AKs","KTs","KJs","KQs","QTs","QJs","JTs","T9s","AQo","AKo"],
 "UTG+1":["66+","A8s","A9s","ATs","AJs","AQs","AKs","KTs","KJs","KQs","QTs","QJs","JTs","T9s","98s","AJo","AQo","AKo","KQo"],
 "UTG+2":["55+","A7s","A8s","A9s","ATs","AJs","AQs","AKs","K9s","KTs","KJs","KQs","Q9s","QTs","QJs","J9s","JTs","T9s","98s","87s","AJo","AQo","AKo","KQo"],
 MP1:["44+","A5s","A6s","A7s","A8s","A9s","ATs","AJs","AQs","AKs","K9s","KTs","KJs","KQs","Q9s","QTs","QJs","J9s","JTs","T9s","98s","87s","ATo","AJo","AQo","AKo","KQo"],
 MP2:["33+","A4s","A5s","A6s","A7s","A8s","A9s","ATs","AJs","AQs","AKs","K8s","K9s","KTs","KJs","KQs","Q9s","QTs","QJs","J9s","JTs","T9s","98s","87s","76s","ATo","AJo","AQo","AKo","KJo","KQo","QJo"],
 LJ:["22+","A2s","A3s","A4s","A5s","A6s","A7s","A8s","A9s","ATs","AJs","AQs","AKs","K8s","K9s","KTs","KJs","KQs","Q8s","Q9s","QTs","QJs","J8s","J9s","JTs","T8s","T9s","98s","87s","76s","65s","ATo","AJo","AQo","AKo","KJo","KQo","QJo"],
 HJ:["22+","A2s","A3s","A4s","A5s","A6s","A7s","A8s","A9s","ATs","AJs","AQs","AKs","K7s","K8s","K9s","KTs","KJs","KQs","Q8s","Q9s","QTs","QJs","J8s","J9s","JTs","T8s","T9s","98s","87s","76s","65s","54s","A9o","ATo","AJo","AQo","AKo","KTo","KJo","KQo","QTo","QJo","JTo"],
 CO:["22+","A2s","A3s","A4s","A5s","A6s","A7s","A8s","A9s","ATs","AJs","AQs","AKs","K6s","K7s","K8s","K9s","KTs","KJs","KQs","Q7s","Q8s","Q9s","QTs","QJs","J7s","J8s","J9s","JTs","T7s","T8s","T9s","97s","98s","87s","76s","65s","54s","A8o","A9o","ATo","AJo","AQo","AKo","KTo","KJo","KQo","QTo","QJo","JTo"]
};
const TAG_PF={
 threeBet:["QQ+","AKs","AKo"],
 threeBetLate:["JJ+","AQs","AKs","AKo"],
 flatRaise:["22+","AJs","AQs","AKs","KQs","QJs","JTs","T9s","98s","AQo","AKo"],
 isoValue:["88+","ATs","AJs","AQs","AKs","KJs","KQs","QJs","AJo","AQo","AKo","KQo"],
 overlimp:["22+","A2s","A3s","A4s","A5s","A6s","A7s","A8s","A9s","ATs","JTs","T9s","98s","87s","76s","65s","54s"],
 fourBet:["KK+","AKs"],
 defend3Bet:["QQ+","AKs","AKo","JJ","AQs"]
};
export {openRanges,TAG_PF};
export function createTagStrategy(ctx){
 const {canonHand,pos,inRange,postClass}=ctx;

 const state=()=>ctx.state();
 function tagPreflopDecision(d){
 const h=canonHand(ctx.players[0].cards),p=pos(0),prior=ctx.handActions.filter(a=>a.street===0&&a.i!==0);
 const raises=prior.filter(a=>a.type==="raise"),limpers=prior.filter(a=>a.type==="call"&&a.betBefore<=2);
 const isLate=["HJ","CO","BTN"].includes(p),hasPrice=d.c>0;
 const out=(rec,ruleId,why,confidence="baseline")=>({rec,ruleId,why,confidence});
 if(raises.length>=2){
  if(inRange(h,TAG_PF.fourBet))return out("Raise","TAG-PF-4BET-VALUE","Premium hand suitable for a value four-bet.");
  if(inRange(h,TAG_PF.defend3Bet)&&d.c<=Math.max(24,ctx.players[0].stack*.15))return out("Call","TAG-PF-3BET-DEFEND","Continue cautiously versus a three-bet with a strong hand.");
  return out(hasPrice?"Fold":"Check","TAG-PF-3BET-FOLD","Avoid defending marginal hands against heavy preflop aggression.");
 }
 if(raises.length===1){
  if(inRange(h,isLate?TAG_PF.threeBetLate:TAG_PF.threeBet))return out("Raise","TAG-PF-3BET-VALUE","Three-bet a strong value range against the opener.");
  if(inRange(h,TAG_PF.flatRaise)&&d.c<=Math.min(16,ctx.players[0].stack*.1))return out("Call","TAG-PF-CALL-OPEN","This hand can continue at a manageable price; position and opener range still matter.");
  return out(hasPrice?"Fold":"Check","TAG-PF-FOLD-OPEN","Outside the baseline defense range against this raise.");
 }
 if(limpers.length){
  if(inRange(h,TAG_PF.isoValue))return out("Raise","TAG-PF-ISO-VALUE","Raise for value against limpers; use a larger isolation size.");
  if(inRange(h,TAG_PF.overlimp)&&p!=="SB"&&hasPrice)return out("Call","TAG-PF-OVERLIMP","Overlimp a speculative hand at a small price, particularly in position.");
  return out(hasPrice?"Fold":"Check","TAG-PF-VS-LIMP-FOLD","This hand is not a profitable default isolation raise or overlimp.");
 }
 if(p==="BB"&&!hasPrice)return out("Check","TAG-PF-BB-FREE","Check your option in the big blind.");
 if(inRange(h,openRanges[p]||[]))return out("Raise","TAG-PF-RFI-"+p,"Open-raise this hand from "+p+" under the full-ring TAG chart.");
 return out(hasPrice?"Fold":"Check","TAG-PF-RFI-FOLD-"+p,"Outside the full-ring TAG opening range for "+p+".");
}
 function makeStrategy(){const {street,pot,currentBet,minRaise}=state();return {
 TAG:{
  recommend(d){
   const pc=street===0?tagPreflopDecision(d):postClass(d);
   let rec=pc.rec.toLowerCase(),action=rec.startsWith("raise")?"raise":rec.startsWith("fold")||rec.startsWith("usually fold")?"fold":rec.startsWith("call")?"call":rec.startsWith("bet")?"raise":rec.startsWith("check")?"check":"check";
   if(d.c===0&&action==="fold")action="check";
   if(d.c>0&&action==="check")action="fold";
   let target=null;
   if(action==="raise"){
    if(street===0){const limpers=ctx.handActions.filter(a=>a.street===0&&a.i!==0&&a.type==="call").length;target=currentBet>2?Math.max(currentBet+minRaise,currentBet*3):Math.max(6,8+2*limpers)}
    else target=currentBet?currentBet+Math.max(minRaise,Math.round(pot*.65)):Math.max(2,Math.round(pot*.65));
    target=Math.min(ctx.players[0].streetBet+ctx.players[0].stack,target);
   }
   return {action,target,why:pc.why,ruleId:pc.ruleId||(street===0?"TAG-PF-OTHER":"TAG-POST-"+pc.quality),confidence:pc.confidence||"baseline",strategy:"TAG"};
  },
  grade(d,type,target,rec){
   const matched=type===rec.action;
   const sizingOK=type!=="raise"||!rec.target||Math.abs(target-rec.target)<=Math.max(2,rec.target*.3);
   const close=type==="check"&&rec.action==="raise"&&street>0;
   const verdict=matched?(sizingOK?"GOOD "+type.toUpperCase():"SIZING DIFFERS FROM TAG BASELINE"):close?"REASONABLE CHECK":"DEVIATION FROM TAG STRATEGY";
   return {verdict,reason:matched?(sizingOK?rec.why:"TAG's reference sizing is $"+rec.target+". "+rec.why):"TAG recommends "+rec.action.toUpperCase()+(rec.target?" to $"+rec.target:"")+". "+rec.why,severity:matched?(sizingOK?"good":"minor"):close?"close":"minor"};
  }
 }
};}
 return {recommend(d){return makeStrategy().TAG.recommend(d)},grade(d,type,target,rec){return makeStrategy().TAG.grade(d,type,target,rec)}};
}
