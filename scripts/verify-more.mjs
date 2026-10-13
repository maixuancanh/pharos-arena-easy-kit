import {connect,CHAIN_MCP} from '../src/mcp.mjs';
import {diagnose} from '../src/support.mjs';
import {deliveryStore,deliverOnce,thresholdRaw} from '../src/alerts.mjs';
import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const c=await connect(CHAIN_MCP,'evidence/support-three-mcp.jsonl');
try{const out=[];const rows=[read('evidence/support-trace-candidates.json')[0],...read('evidence/support-specific-candidates.json').filter(x=>['0x6044f77a5ca13bdad37f34f6224911e73a0fb4835a5a263105bfc2b3955de6a9','0xfc04ecf08781883a68a82bcfcbaecea33011680cfc089f084438e7ad60d65939'].includes(x.transaction.hash))];for(const row of rows){out.push(await diagnose(c.call.bind(c),row.transaction.hash));console.log(out.at(-1).hash,out.at(-1).diagnosis.type,out.at(-1).diagnosis.reason??'');}writeFileSync('evidence/support-three.json',JSON.stringify(out,null,2));assert.equal(new Set(out.map(x=>x.diagnosis.type)).size,3);assert.ok(out.every(x=>Number(x.receipt.status)===0));}finally{await c.close();}
const first=read('evidence/alert-live.json'),resume=read('evidence/alert-resume.json');
const delivered=first.results.filter(x=>x.status==='delivered');assert.ok(delivered.length);
assert.ok(first.results.some(x=>x.status==='below-threshold'));
assert.ok(!resume.results.some(x=>delivered.some(y=>x.id===y.event.id||x.event?.id===y.event.id)));
const threshold=thresholdRaw(first.configuration.threshold,6);const identity=JSON.stringify({chainId:1672,address:first.configuration.contract,threshold:threshold.toString(),topic:first.configuration.topic});
const store=deliveryStore('.state/alert-live.json.deliveries.json',identity);
const duplicate=await deliverOnce(delivered[0].event,{store,threshold,symbol:'USDC',topic:first.configuration.topic,fetcher:()=>{throw new Error('Duplicate must not publish');}});
assert.equal(duplicate.status,'duplicate-suppressed');writeFileSync('evidence/alert-dedup.json',JSON.stringify(duplicate,null,2));
const channel=await fetch(`https://ntfy.sh/${first.configuration.topic}/json?poll=1`);if(!channel.ok)throw new Error(`Channel ${channel.status}`);const text=await channel.text();writeFileSync('evidence/alert-channel-readback.jsonl',text);const messages=text.trim().split('\n').map(JSON.parse);assert.ok(delivered.every(x=>messages.some(m=>m.id===x.notification.id&&m.message===x.message)));
console.log('Three failure categories, real notification readback and persistent duplicate suppression verified');
