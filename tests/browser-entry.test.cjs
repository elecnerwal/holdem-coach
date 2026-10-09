'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const script=html.match(/<script type="module">([\s\S]*?)<\/script>/);
test('browser entry script parses after removing static imports',()=>{
 assert.ok(script,'Missing browser module script');
 const source=script[1].replace(/^import .*?;\s*$/gm,'');
 assert.doesNotThrow(()=>new vm.Script(source,{filename:'index.html'}));
});
test('poker state is session-owned, without sync mirrors',()=>{
 assert.doesNotMatch(script[1],/function syncController\s*\(/);
 assert.match(script[1],/gameSession\.begin\(hand\)/);
 assert.match(script[1],/gameSession\.state\.players/);
 assert.doesNotMatch(script[1],/let deck=\[\], players=/);
});
