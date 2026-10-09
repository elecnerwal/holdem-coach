// Single authoritative mutable game session. The UI may read a snapshot, but
// all poker-engine transitions mutate this one state object.
export function createGameSession(){
 let current={players:[],board:[],deck:[],button:-1,street:0,pot:0,currentBet:0,minRaise:2,actor:0,acted:new Set(),raiseLocked:new Set(),streetActions:[],handActions:[],handStartStacks:[],ended:false};
 return {
  get state(){return current},
  begin(hand){if(!hand||!Array.isArray(hand.players)||!Array.isArray(hand.handStartStacks))throw Error('Invalid hand state');current=hand;return current},
  setActor(seat){current.actor=seat;return seat},
  rebuy(seat,amount){if(!Number.isFinite(amount)||amount<=0||!Number.isInteger(seat)||!current.players[seat])throw Error("Invalid rebuy");current.players[seat].stack=amount;return current.players[seat].stack},
  setDeck(deck){current.deck=deck;return deck},
  finish(){current.ended=true},
  clearPot(){current.pot=0},
  assertFinite(){for(const [i,p] of current.players.entries())if(!Number.isFinite(p.stack)||p.stack<0)throw Error('Invalid stack at seat '+i);if(!Number.isFinite(current.pot)||current.pot<0)throw Error('Invalid pot');}
 };
}
