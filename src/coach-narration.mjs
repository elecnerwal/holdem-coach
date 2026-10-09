// Coaching language and decision review. Dependencies are supplied by the live game UI.
export function createCoachNarration({heroBoardRelation,actionPressure,heroHand,getStreet}){
function money(n){return "$"+Math.round(n)}
function coachVoicePost(d,pc){
 let rel=heroBoardRelation(),ap=actionPressure(),call=d.c,hn=heroHand().toLowerCase();
 if(call&&pc.quality==="range-aware fold"){
  if(rel.pocket&&rel.boardOver)return "I don't like this spot. The overcard is already bad for your pocket pair, and the action in front of you makes it worse. I'd let this go.";
  if(ap.calls)return "This is getting too strong in front of us. A bet is one thing; a bet plus a caller is another. I wouldn't pay to find out.";
  return "They're showing a lot of strength here. Your hand has some equity, but not enough that I want to get stubborn with it.";
 }
 if(call&&pc.quality==="clear continue")return "I think we're still good often enough. The price is reasonable and nobody has shown enough strength to scare me off. I'd continue.";
 if(call&&pc.quality==="thin continue")return "This one's close. We're getting just enough of a price to continue, but I wouldn't love facing more heat.";
 if(call&&pc.quality==="close fold")return "Pretty close, but I lean fold. We don't have enough cushion to justify forcing it.";
 if(call&&pc.quality==="clear fold")return "Easy enough fold for me. We're just not getting the right price.";
 if(!call&&pc.quality==="strong value")return "We've got a real hand here. I'd start getting value rather than giving everyone a free card.";
 if(!call&&pc.quality==="medium-strength")return "We're in decent shape, but this isn't a hand I want to build a huge pot with automatically. Betting and checking can both make sense.";
 if(!call&&pc.quality==="drawing or marginal")return "We have something to work with, but not enough to force the action. I'd usually keep the pot manageable unless there's a good reason to bluff.";
 return "Not much reason to put money in right now. I'd check and see what develops.";
}
function coachVoicePre(pc){
 if(pc.rec==="Raise"&&pc.grade==="strong")return "Strong hand. Let's put money in and make worse hands pay.";
 if(pc.rec==="Raise")return "This is good enough to open from here. I'd raise.";
 if(pc.rec==="Call")return "I don't want to fold this, but I don't need to blow the pot up either. Calling looks good.";
 if(pc.rec==="Fold")return "I wouldn't get involved with this one from here. Just let it go.";
 return "Nothing to do here. Take the free card.";
}
function actionAnalysis(type,pc,d){
 const street=getStreet();
 let rel=street?heroBoardRelation():null, ap=street?actionPressure():null;
 if(street===0){
  if(type==="fold"&&pc.rec==="Fold")return "Good. No need to manufacture a hand from a bad starting spot.";
  if(type==="raise"&&pc.rec==="Raise")return pc.grade==="strong"?"Good. That's exactly the kind of hand we want to build a pot with.":"Good open. This hand is strong enough from your position.";
  if(type==="call"&&pc.rec==="Call")return "Good. You stayed in without turning a medium hand into a big pot.";
  if(type==="fold"&&(pc.rec==="Raise"||pc.rec==="Call"))return "A little too cautious. This hand was good enough to keep playing.";
  if(type==="call"&&pc.rec==="Raise")return "Playable, but I'd rather take the initiative here.";
  if(type==="raise"&&pc.rec==="Call")return "That's more aggression than this hand really needs.";
  return "That line is looser than I'd like from this position.";
 }
 if(type==="fold"){
  if(pc.quality==="range-aware fold"){
   if(rel&&rel.pocket&&rel.boardOver)return "Good fold. Pocket pairs are hard to release, but once the board beats your pair and multiple players show strength, you don't need to be a hero.";
   if(ap&&ap.calls)return "Good fold. The caller matters here — you're not just trying to beat the bettor anymore.";
   return "Good fold. There was enough strength in front of you that hanging on would be expensive.";
  }
  if(pc.quality==="clear fold")return "Good fold. The price just wasn't there.";
  if(pc.quality==="close fold")return "Fine fold. It was close enough that I wouldn't lose sleep over it.";
  return "I think that's a little too cautious. We had enough going for us to continue.";
 }
 if(type==="call"){
  if(pc.quality==="range-aware fold")return "I think that's a call we can save next time. The action was telling us we're probably behind.";
  if(pc.quality==="clear continue")return "Good call. We're ahead of the price often enough and the action isn't especially alarming.";
  if(pc.quality==="thin continue")return "Reasonable call. It's close, so I wouldn't treat this as an automatic continue every time.";
  if(pc.quality==="close fold")return "A little sticky. It's not a disaster, but folding is cleaner here.";
  return "Too loose. We're paying too much for what this hand is worth.";
 }
 if(type==="check"){
  if(pc.quality==="strong value")return "I'd rather bet. There are worse hands that can pay us, and checking gives up that chance.";
  return "Good check. No need to force the pot bigger.";
 }
 if(type==="raise"){
  if(pc.quality==="strong value")return "Good. We have a hand that wants more money in the pot.";
  if(pc.quality==="medium-strength")return "That's defensible, but be careful about getting called or raised — we're not at the top of our range.";
  if(pc.quality==="drawing or marginal")return "This can work as pressure, but now we're relying on folds as much as our actual hand.";
  return "That's ambitious. Without much hand strength, we need them to fold a lot for this to work.";
 }
 return "";
}

return {coachVoicePost,coachVoicePre,actionAnalysis};
}
