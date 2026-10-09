// DOM event binding for game actions and chat. Gameplay remains in the controller.
export function bindGameControls({$,document,getState,setState,unlockAudio,start,heroAction,callAmt,potFractionRaiseTarget,skipToEnd,afterHero,render,sendChat}){
$("toggleCoach").onclick=()=>{let {coachVisible}=getState();coachVisible=!coachVisible;setState({coachVisible});$("toggleCoach").textContent=coachVisible?"Hide coach":"Show coach";render()}

$("dealIn").onclick=()=>{unlockAudio();$("dealIn").style.display="none";$("newHand").style.display="inline-block";start()};
$("newHand").onclick=()=>{unlockAudio();start()};
$("next").onclick=()=>{unlockAudio();start()};
$("fold").onclick=()=>heroAction("fold");
$("checkCall").onclick=()=>heroAction(callAmt(0)?"call":"check");
$("raise").onclick=()=>$("sizes").classList.toggle("show");
document.querySelectorAll("[data-size]").forEach(b=>b.onclick=()=>{const f=+b.dataset.size;const {pot,currentBet,minRaise}=getState();const target=potFractionRaiseTarget({pot,currentBet,minRaise,streetBet:getState().players[0].streetBet,stack:getState().players[0].stack},f);$("sizes").classList.remove("show");heroAction("raise",target)});
$("customRaise").onclick=()=>{
  const {pot,currentBet,minRaise}=getState();let max=getState().players[0].streetBet+getState().players[0].stack;
  let min=currentBet?currentBet+minRaise:2;
  let raw=prompt("Raise/bet TO what total amount? Minimum $"+min+", maximum $"+max+".", String(Math.min(max,Math.max(min,Math.round(pot*1.5)))));
  if(raw===null)return;
  let target=Number(raw.replace(/[$,]/g,""));
  if(!Number.isFinite(target))return;
  target=Math.max(min,Math.min(max,Math.round(target)));
  $("sizes").classList.remove("show");
  heroAction("raise",target);
};
$("skipEnd").onclick=skipToEnd;
$("continue").onclick=()=>{if(getState().gptVerdictBusy)return;setState({paused:false,coachVisible:false});$("toggleCoach").textContent="Show coach";$("continue").style.display="none";afterHero()};
render();
$("turn").textContent="Click Deal In to start";
$("engineState").textContent="Ready to deal";
$("actions").style.display="none";

}
