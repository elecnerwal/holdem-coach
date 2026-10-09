// Bankroll/rebuy panel presentation and actions.
export function showRebuyUI({$,onRebuy}){
 $("coach").classList.add("show");$("toggleCoach").textContent="Hide coach";
 $("recLabel").textContent="Bankroll";$("recommend").textContent="YOU'RE OUT OF CHIPS";
 $("thinking").textContent="You can buy back into the cash game for $200.";
 $("analysisBox").style.display="block";$("analysisBox").classList.add("show");
 $("analysis").innerHTML='<button id="rebuyHero" class="primary">Buy back in for $200</button> <button id="leaveHero">End session</button>';
 const rebuy=$("rebuyHero"),leave=$("leaveHero");
 if(rebuy)rebuy.onclick=onRebuy;
 if(leave)leave.onclick=()=>{$("analysis").textContent="Session ended."};
 $("next").style.display="none";$("actions").style.display="none";
}
