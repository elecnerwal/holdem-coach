// Loose TAG extends TAG preflop; shares its postflop baseline.
const LOOSE_OPEN={
 HJ:["22+","A2s+","K7s+","Q8s+","J8s+","T8s+","98s","87s","76s","65s","A9o+","KTo+","QTo+","JTo"],
 CO:["22+","A2s+","K5s+","Q7s+","J7s+","T7s+","97s+","86s+","75s+","65s","54s","A7o+","K9o+","Q9o+","J9o+","T9o"],
 BTN:["22+","A2s+","K2s+","Q5s+","J6s+","T6s+","96s+","85s+","74s+","64s+","53s+","43s","A2o+","K7o+","Q8o+","J8o+","T8o+","98o"],
 SB:["22+","A2s+","K5s+","Q7s+","J7s+","T7s+","97s+","86s+","76s","65s","54s","A7o+","K9o+","Q9o+","J9o+"]
};
const LOOSE_ISO=["66+","A8s+","KTs+","QTs+","JTs","T9s","98s","A9o+","KJo+","QJo"];
const LOOSE_OVERLIMP=["22+","A2s+","K7s+","Q8s+","J8s+","T8s+","98s","87s","76s","65s","54s","AJo","KQo"];
export {LOOSE_OPEN,LOOSE_ISO,LOOSE_OVERLIMP};
export function createLooseTagStrategy(ctx,tag){
 const {canonHand,pos,inRange}=ctx;
 const players=ctx.players,handActions=ctx.handActions;
 const STRATEGIES={TAG:tag};
 function makeStrategy(){const {street}=ctx.state();return {
 recommend(d){
  const base=STRATEGIES.TAG.recommend(d);
  if(street!==0)return {...base,strategy:"LOOSE_TAG",ruleId:"LT-"+base.ruleId,why:base.why+" (Loose TAG currently uses the TAG postflop baseline.)"};
  const h=canonHand(players[0].cards),p=pos(0);
  const prior=handActions.filter(a=>a.street===0&&a.i!==0);
  const raises=prior.filter(a=>a.type==="raise");
  const limpers=prior.filter(a=>a.type==="call"&&a.betBefore<=2);
  let action=base.action,why=base.why,ruleId=base.ruleId,target=base.target;
  if(!raises.length&&limpers.length&&inRange(h,LOOSE_ISO)){
   action="raise";ruleId="LT-PF-ISO";why="Loose TAG isolates limpers with a wider value range.";target=Math.max(8,8+2*limpers.length);
  }else if(!raises.length&&limpers.length&&p!=="SB"&&d.c>0&&inRange(h,LOOSE_OVERLIMP)&&action==="fold"){
   action="call";ruleId="LT-PF-OVERLIMP";why="Loose TAG can overlimp this playable hand at a small price.";target=null;
  }else if(!raises.length&&!limpers.length&&LOOSE_OPEN[p]&&inRange(h,LOOSE_OPEN[p])&&action==="fold"){
   action="raise";ruleId="LT-PF-OPEN-"+p;why="Wider late-position opening range in Loose TAG.";target=Math.max(6,8);
  }
  if(action==="raise")target=Math.min(players[0].streetBet+players[0].stack,target||8);
  return {action,target,why,ruleId,confidence:"provisional",strategy:"LOOSE_TAG"};
 },
 grade(d,type,target,rec){
  const g=STRATEGIES.TAG.grade(d,type,target,rec);
  return {...g,verdict:g.verdict.replace(/TAG/g,"LOOSE TAG"),reason:g.reason.replace(/TAG/g,"Loose TAG")};
 }
};}
 return {recommend(d){return makeStrategy().recommend(d)},grade(d,type,target,rec){return makeStrategy().grade(d,type,target,rec)}};
}
