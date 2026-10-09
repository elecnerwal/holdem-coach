// Pure Hold'em hand evaluator. No DOM or game-state dependencies.
// Card shape: {r:"A",s:"♠"}; ranking vector compares lexicographically.
export const ranks="23456789TJQKA";
export function rv(r){return ranks.indexOf(r)+2}
export function rank5(cs){let rs=cs.map(c=>rv(c.r)).sort((a,b)=>b-a), counts={};rs.forEach(x=>counts[x]=(counts[x]||0)+1);let groups=Object.entries(counts).map(([r,n])=>[+r,n]).sort((a,b)=>b[1]-a[1]||b[0]-a[0]);let uniq=[...new Set(rs)];if(uniq.includes(14))uniq.push(1);let sh=0;for(let i=0;i<=uniq.length-5;i++)if(uniq[i]-uniq[i+4]===4){sh=uniq[i];break}let flush=cs.every(c=>c.s===cs[0].s);if(flush&&sh)return [8,sh];if(groups[0][1]===4)return [7,groups[0][0],groups[1][0]];if(groups[0][1]===3&&groups[1][1]===2)return [6,groups[0][0],groups[1][0]];if(flush)return [5,...rs];if(sh)return [4,sh];if(groups[0][1]===3)return [3,groups[0][0],...groups.slice(1).map(g=>g[0]).sort((a,b)=>b-a)];if(groups[0][1]===2&&groups[1][1]===2){let ps=[groups[0][0],groups[1][0]].sort((a,b)=>b-a);return [2,...ps,groups.find(g=>g[1]===1)[0]]}if(groups[0][1]===2)return [1,groups[0][0],...groups.slice(1).map(g=>g[0]).sort((a,b)=>b-a)];return [0,...rs]}
export function combos(a,k){let out=[];function rec(start,x){if(x.length===k){out.push(x.slice());return}for(let i=start;i<a.length;i++){x.push(a[i]);rec(i+1,x);x.pop()}}rec(0,[]);return out}
export function cmp(a,b){for(let i=0;i<Math.max(a.length,b.length);i++){let x=a[i]||0,y=b[i]||0;if(x!==y)return x-y}return 0}
export function eval7(cs){let best=null;for(const c of combos(cs,5)){let r=rank5(c);if(!best||cmp(r,best)>0)best=r}return best}
export const handNames=["High card","Pair","Two pair","Trips","Straight","Flush","Full house","Quads","Straight flush"];
