// Imperative UI transitions. Game state and poker rules remain outside this module.
export function createSessionUI($){
 return {
  skipToEnd(){ $("continue").style.display="none";$("skipEnd").style.display="none" },
  review(){ $("toggleCoach").textContent="Hide coach";$("continue").style.display="inline-block" },
  finishHand(){ $("next").style.display="inline-block" },
  newHand(){ $("continue").style.display="none";$("next").style.display="none";$("sizes").classList.remove("show");$("toggleCoach").textContent="Show coach" },
  resetChat(){const cm=$("chatMessages");if(cm)cm.innerHTML='<div class="chatBot">Ask ChatGPT about your hand, your decision, or what the other players might have.</div>'},
  gameOver(){alert("Game over — only one player remains.")},
  setVerdict(status,reason){$("recLabel").textContent="Verdict";$("recommend").textContent=status;$("thinking").textContent=reason},
  setChatBusy(busy){$("chatSend").disabled=busy},
  scrollChat(){const m=$("chatMessages");m.scrollTop=m.scrollHeight}
 };
}
