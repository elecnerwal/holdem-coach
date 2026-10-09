export function createChatUI($){
function addChatMessage(role,message){
 const m=$("chatMessages"),el=document.createElement("div");
 el.className=role==="user"?"chatUser":"chatBot";
 el.textContent=message;m.appendChild(el);m.scrollTop=m.scrollHeight;
 return el;
}

 function takeQuestion(){const inp=$("chatInput"),q=inp.value.trim();if(q)inp.value="";return q}
 function setMessage(element,text){element.textContent=text}
 function setBusy(busy){$("chatSend").disabled=busy}
 function scroll(){const m=$("chatMessages");m.scrollTop=m.scrollHeight}
 return {addChatMessage,takeQuestion,setMessage,setBusy,scroll};
}
