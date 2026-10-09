// Public-information-only heuristic opponents. Never accepts the hero's hole cards.
import {rv,eval7} from './poker-engine.mjs';
export const BOT_STYLE_PARAMETERS={
 TAG:{loose:0,aggr:.12,sticky:0},
 'Calling Station':{loose:2,aggr:-.12,sticky:.20},
 Nit:{loose:-2,aggr:-.08,sticky:-.20},
 LAG:{loose:3,aggr:.28,sticky:.05},
 Beginner:{loose:1,aggr:.02,sticky:.08},
 'Strong Reg':{loose:0,aggr:.16,sticky:-.04}
};
export function decideBotAction({cards,board,street,pot,currentBet,minRaise,streetBet,stack,opponentCount,styleName},random=Math.random){
 if(!Array.isArray(cards)||cards.length!==2)throw Error('Bot needs its own two cards');
 const c=Math.max(0,currentBet-streetBet),r=random(),style=BOT_STYLE_PARAMETERS[styleName]||BOT_STYLE_PARAMETERS.TAG;
 const cap=streetBet+stack;
 if(street===0){
  const a=rv(cards[0].r),b=rv(cards[1].r),pair=a===b,hi=Math.max(a,b),lo=Math.min(a,b),suited=cards[0].s===cards[1].s;
  const score=hi+(pair?8:0)+(suited?2:0)+(lo>=10?2:0)+style.loose;
  const pressure=currentBet>=6?2:currentBet>2?1:0;
  if(c){
   if(score<11+pressure*2&&r<.82-style.sticky)return ['fold',0];
   if(c>Math.max(12,pot*.55)&&score<17&&r<.80-style.sticky)return ['fold',0];
   if(score>=20&&r<.28+style.aggr)return ['raise',Math.min(cap,currentBet+Math.max(minRaise,Math.round(pot*.65)))];
   return ['call',0];
  }
  if(score>=15&&r<.48+style.aggr)return ['raise',Math.min(cap,Math.max(4,Math.round(pot*.65)))];
  return ['check',0];
 }
 const rank=eval7(cards.concat(board))[0]||0,frac=c/Math.max(1,pot),multi=opponentCount;
 if(c){
  let f=rank===0?.82:rank===1?(frac>=.75?.78:frac>=.4?.58:.35)+(multi>=4?.12:0):rank===2?(frac>=.9?.45:.18)+(multi>=5?.10:0):.04;
  f=Math.max(.02,Math.min(.95,f-style.sticky));
  if(r<f)return ['fold',0];
  if(rank>=3&&r<.30+style.aggr)return ['raise',Math.min(cap,currentBet+Math.max(minRaise,Math.round(pot*.55)))];
  return ['call',0];
 }
 if(rank>=3&&r<.58+style.aggr)return ['raise',Math.min(cap,Math.max(2,Math.round(pot*.6)))];
 if(rank>=1&&r<.25+style.aggr)return ['raise',Math.min(cap,Math.max(2,Math.round(pot*.45)))];
 return ['check',0];
}
