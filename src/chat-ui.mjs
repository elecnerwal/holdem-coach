export function createChatUI($){
function addChatMessage(role,message){
 const m=$("chatMessages"),el=document.createElement("div");
 el.className=role==="user"?"chatUser":"chatBot";
 el.textContent=message;m.appendChild(el);m.scrollTop=m.scrollHeight;
 return el;
}

 return {addChatMessage};
}
