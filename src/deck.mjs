// Pure deck creation and Fisher–Yates shuffle. No UI or shared game state.
export function createShuffledDeck(ranks,suits,random=Math.random){
 const cards=[];
 for(const r of ranks)for(const s of suits)cards.push({r,s});
 for(let i=cards.length-1;i>0;i--){
  const j=Math.floor(random()*(i+1));
  [cards[i],cards[j]]=[cards[j],cards[i]];
 }
 return cards;
}
export function drawCard(deck){return deck.pop()}
