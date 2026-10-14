import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {observeTrend,scanArbitrage,GasQueue,runSaga,saveState} from '../src/remaining/execution.mjs';
const file=()=>join(mkdtempSync(join(tmpdir(),'arena-execution-')),'state.json');
test('trend survives reopen, rejects duplicates and isolated spike, triggers only once per episode',()=>{
 const p=file(); const feed=(id,value)=>observeTrend(p,{id,value,at:Number(id)},{count:3,direction:'down'});
 assert.equal(feed('1',100).triggered,false);assert.equal(feed('2',30).triggered,false);assert.equal(feed('3',100).triggered,false);
 assert.equal(feed('4',90).triggered,false);assert.equal(feed('4',90).duplicate,true);assert.equal(feed('5',80).triggered,true);
 assert.equal(feed('6',70).triggered,false);assert.equal(JSON.parse(readFileSync(p)).history.length,6);
 assert.throws(()=>feed('0',60),/order/);assert.throws(()=>observeTrend(p,{id:'7',value:1,at:7},{count:2,direction:'down'}),/3/);
});
test('arbitrage accounts for both fees, slippage, gas, and skips stale or failed sources',async()=>{
 const p=file();const sources=[async()=>({source:'A',price:100,at:1000}),async()=>({source:'B',price:110,at:1000})];
 const good=await scanArbitrage(p,sources,{now:1000,quantity:10,feeBps:30,slippageBps:20,gasCost:2,threshold:5});
 assert.equal(good.decision,'prepare-simulated');assert.equal(good.costs,12.5);assert.equal(good.net,87.5);
 assert.equal((await scanArbitrage(p,sources,{now:100000,quantity:10,feeBps:30,slippageBps:20,gasCost:2,threshold:5})).decision,'skip');
 assert.equal((await scanArbitrage(p,[sources[0],async()=>{throw Error('offline');}],{now:1000})).decision,'skip');
});
test('gas queue persists, waits, dispatches at deadline despite high price and never resends',async()=>{
 const p=file();let count=0;let q=new GasQueue(p);q.enqueue({id:'a',deadline:100,requestedAt:0,requestPriceWei:'100',targetPriceWei:'50',transaction:{to:'fixture'}});
 assert.equal((await q.tick(10,'90',async()=>{count++;})).length,0);q=new GasQueue(p);
 const submit=async()=>{count++;return {hash:'0x1',wait:async()=>({status:1,hash:'0x1',gasUsed:21000n,gasPrice:120n})};};
 const out=await q.tick(100,'120',submit);assert.equal(out[0].reason,'deadline');assert.equal(out[0].actualPaidWei,'2520000');
 assert.equal(out[0].requestTimeBenchmarkWei,'2100000');await new GasQueue(p).tick(110,'10',submit);assert.equal(count,1);
});
test('saga retries only explicit transient pre-broadcast failures and compensates reverse order',async()=>{
 const p=file();let tries=0;const events=[];
 const tx=id=>({hash:id,wait:async()=>({status:1,hash:id,gasUsed:1n,gasPrice:1n})});
 const steps=[{id:'approve',send:async()=>{if(++tries===1)throw Object.assign(Error('busy'),{transient:true,safeToRetry:true});events.push('approve');return tx('1');},compensate:async()=>{events.push('undo-approve');return tx('4');}},{id:'swap',send:async()=>{events.push('swap');return tx('2');},compensate:async()=>{events.push('undo-swap');return tx('3');}},{id:'deposit',send:async()=>{throw Object.assign(Error('permanent'),{permanent:true});}}];
 const state=await runSaga(p,steps,{maxAttempts:2,retryDelayMs:0});assert.equal(state.status,'compensated');assert.equal(tries,2);assert.deepEqual(events,['approve','swap','undo-swap','undo-approve']);
 await runSaga(p,steps);assert.equal(tries,2);
});
test('saga uncertain broadcast never retries or compensates blindly',async()=>{
 let calls=0;const p=file();const step={id:'a',send:async()=>{calls++;throw Error('connection lost');}};
 const result=await runSaga(p,[step,{id:'b'},{id:'c'}]);assert.equal(result.status,'needs-reconciliation');await runSaga(p,[step,{id:'b'},{id:'c'}]);assert.equal(calls,1);
});
test('all due jobs broadcast before waiting for first receipt',async()=>{
 const q=new GasQueue(file());for(const id of ['a','b'])q.enqueue({id,deadline:10,requestedAt:0,requestPriceWei:'100',targetPriceWei:'50',transaction:{id}});
 const sent=[];let release;const waiting=new Promise(r=>{release=r;});
 const done=q.tick(10,'100',async tx=>{sent.push(tx.id);if(sent.length===2)release();return {hash:tx.id,wait:async()=>{await waiting;return {status:1,hash:tx.id,gasUsed:1n,gasPrice:100n};}};});
 await Promise.race([done,new Promise((_,reject)=>setTimeout(()=>reject(Error('second broadcast blocked by first receipt')),500))]);assert.deepEqual(sent,['a','b']);
});
test('exhausted persisted saga step cannot become completed',async()=>{
 const p=file();saveState(p,{status:'running',steps:[{id:'a',status:'ready',attempts:3},{id:'b',status:'ready',attempts:0},{id:'c',status:'ready',attempts:0}],log:[]});
 const state=await runSaga(p,[{id:'a'},{id:'b'},{id:'c'}],{maxAttempts:3});assert.notEqual(state.status,'completed');
});
test('arbitrage overflowing notional fails closed',async()=>{
 const r=await scanArbitrage(file(),[async()=>({source:'A',price:1e308,at:1}),async()=>({source:'B',price:1.1e308,at:1})],{now:1,quantity:100});assert.equal(r.decision,'skip');assert.match(r.reason,/overflow/);
});
test('missing receipt leaves saga unresolved without compensation or next step',async()=>{
 let actions=0,compensations=0;const s=await runSaga(file(),[{id:'a',send:async()=>({hash:'0xpending',wait:async()=>null}),compensate:async()=>{compensations++;}},{id:'b',send:async()=>{actions++;}},{id:'c'}]);
 assert.equal(s.status,'needs-reconciliation');assert.equal(actions,0);assert.equal(compensations,0);
});
