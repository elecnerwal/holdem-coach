// Coach panel presentation. Strategy decisions and state are provided by the app.
export function createCoachUI({$,getState,coachData,strategyRecommendation,setCoachVisible}){
function renderCoach(){const {ended,paused,snapshot,STRATEGY_MODE}=getState();if(ended){showHandVerdict();return}$("decisionMathBox").style.display="";if(paused&&snapshot){$("thinking").textContent=snapshot.txt;$("recLabel").textContent="Verdict";$("recommend").textContent=snapshot.verdict;$("position").textContent=snapshot.p;$("startingStrength").textContent=snapshot.startingStrength?(snapshot.handStrength?snapshot.handStrength.percent.toFixed(1)+"%":"—"):"—";$("equity").textContent=snapshot.e.toFixed(0)+"%";$("needed").textContent=snapshot.c?snapshot.need.toFixed(1)+"%":"—";$("price").textContent="$"+snapshot.c;$("afterPot").textContent="$"+snapshot.finalPot;$("playersLive").textContent=snapshot.live;$("handLabel").textContent=snapshot.hand;$("analysisBox").classList.add("show");$("analysis").textContent=snapshot.analysis}
 else {let d=coachData();$("recLabel").textContent="Recommendation";$("position").textContent=d.p;$("startingStrength").textContent=d.startingStrength?(d.handStrength?d.handStrength.percent.toFixed(1)+"%":"—"):"—";$("equity").textContent=d.e.toFixed(0)+"%";$("needed").textContent=d.c?d.need.toFixed(1)+"%":"—";$("price").textContent="$"+d.c;$("afterPot").textContent="$"+d.finalPot;$("playersLive").textContent=d.live;$("handLabel").textContent=d.hand;$("analysisBox").classList.remove("show");let rec=strategyRecommendation(d);$("recommend").textContent=(STRATEGY_MODE==="LOOSE_TAG"?"LOOSE TAG":"TAG")+": "+rec.action.toUpperCase()+(rec.target?" TO $"+rec.target:"");$("thinking").textContent=rec.why+" ["+rec.ruleId+"]"}}

function showHandVerdict(){const {finalHandVerdict}=getState();setCoachVisible(true);
 $("decisionMathBox").style.display="none";
$("coach").classList.add("show");$("toggleCoach").textContent="Hide coach";
 $("recLabel").textContent="Hand Verdict";
 $("recommend").textContent=finalHandVerdict?finalHandVerdict.verdict:"Reviewing hand…";
 $("thinking").textContent=finalHandVerdict?finalHandVerdict.reason:"Checking your TAG decisions and the final result.";
 $("analysisBox").classList.remove("show");
}

 return {renderCoach,showHandVerdict};
}
