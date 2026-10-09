export function createPreflopCharts({$,getContext,canonHand,inRange,openRanges,TAG_PF,LOOSE_OPEN,LOOSE_ISO,LOOSE_OVERLIMP,strategyRecommendation,coachData}){
function renderPreflopChart(){
 const {STRATEGY_MODE,players}=getContext();
 const situation=$("chartSituation").value,position=$("chartPosition").value;
 $("chartPositionWrap").style.display=situation==="rfi"?"":"none";
 const range=STRATEGY_MODE==="LOOSE_TAG"?(situation==="rfi"?(LOOSE_OPEN[position]||openRanges[position]||[]):situation==="overlimp"?LOOSE_OVERLIMP:situation==="isoValue"?LOOSE_ISO:(TAG_PF[situation]||[])):(situation==="rfi"?(openRanges[position]||[]):(TAG_PF[situation]||[]));
 const order="AKQJT98765432",hero=players&&players[0]&&players[0].cards&&players[0].cards.length===2?canonHand(players[0].cards):null;
 const cells=[];
 for(let row=0;row<13;row++)for(let col=0;col<13;col++){
  const hand=row===col?order[row]+order[col]:row<col?order[row]+order[col]+"s":order[col]+order[row]+"o";
  const included=inRange(hand,range);
  cells.push('<div class="handCell'+(included?' active':'')+(hero===hand?' heroHand':'')+'" title="'+hand+' — '+(included?'In range':'Outside range')+'">'+hand+'</div>');
 }
 $("chartMatrix").innerHTML=cells.join("");
 const descriptions={rfi:"Raise-first-in baseline for the selected position. BB has no unopened-pot opening range because it already posted the big blind.",overlimp:"Hands the TAG engine currently permits overlimping at a small price, outside the small blind. This is not a general recommendation to limp every listed hand in every situation.",isoValue:"Value isolation-raise candidates against limpers. Sizing depends on the number of limpers.",flatRaise:"Potential calls against a single open at manageable sizing; position and price restrictions still apply.",threeBet:"Early-position value 3-bet baseline.",threeBetLate:"Late-position value 3-bet baseline.",fourBet:"Value 4-bet baseline.",defend3Bet:"Hands eligible to continue against a 3-bet when the price is manageable."};
 $("chartDescription").textContent=(descriptions[situation]||"")+" These are provisional educational TAG rules, not solver-validated charts. The grid shows hand eligibility; it does not encode every situational condition.";
}
$("openCharts").onclick=()=>{
 const {ended,street,handActions,pos}=getContext();
 $("chartPosition").value=pos(0) in openRanges?pos(0):"BTN";
 if(!ended&&street===0){
  const before=handActions.filter(a=>a.street===0&&a.i!==0);
  const raises=before.filter(a=>a.type==="raise").length;
  const limpers=before.filter(a=>a.type==="call"&&a.betBefore<=2).length;
  const tag=strategyRecommendation(coachData());
  $("chartSituation").value=raises>=2?(tag.action==="raise"?"fourBet":"defend3Bet"):raises===1?(tag.action==="raise"?"threeBetLate":"flatRaise"):limpers?(tag.action==="raise"?"isoValue":"overlimp"):"rfi";
 }else $("chartSituation").value="rfi";
 renderPreflopChart();$("chartOverlay").classList.add("open");
};
$("closeCharts").onclick=()=>$("chartOverlay").classList.remove("open");
$("chartOverlay").addEventListener("click",e=>{if(e.target===$("chartOverlay"))$("chartOverlay").classList.remove("open")});
$("chartSituation").onchange=renderPreflopChart;
$("chartPosition").onchange=renderPreflopChart;
document.addEventListener("keydown",e=>{if(e.key==="Escape")$("chartOverlay").classList.remove("open")});

 return {renderPreflopChart};
}
