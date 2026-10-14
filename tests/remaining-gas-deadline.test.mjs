import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {GasQueue,readState} from '../src/remaining/execution.mjs';
const file=()=>join(mkdtempSync(join(tmpdir(),'gas-deadline-')),'state.json');
const job=(id,deadline)=>({id,deadline,requestedAt:0,requestPriceWei:'100',targetPriceWei:'1',transaction:{id}});
test('unmined first transaction does not block a later deadline tick',async()=>{
 const path=file(),q=new GasQueue(path);q.enqueue(job('slow',10));q.enqueue(job('urgent',20));
 let finish;const mined=new Promise(r=>finish=r);const sent=[];
 const submit=async tx=>{sent.push(tx.id);return{hash:tx.id,wait:async()=>{await mined;return{status:1,hash:tx.id,gasUsed:1n,gasPrice:100n}}}};
 const first=q.tick(10,'100',submit);await new Promise(r=>setTimeout(r,10));
 try{await q.tick(20,'100',submit,{waitForReceipts:false});assert.deepEqual(sent,['slow','urgent']);}finally{finish();await first;}
 assert.equal(readState(path).jobs[0].status,'confirmed');
});
test('dispatch lead attempts before deadline and restart does not repeat pending payment',async()=>{
 const path=file(),q=new GasQueue(path);q.enqueue({...job('early',1000),dispatchLeadMs:100});let sent=0;
 const submit=async()=>{sent++;return{hash:'0xearly',wait:async()=>null}};
 await q.tick(899,'100',submit,{waitForReceipts:false});assert.equal(sent,0);
 await q.tick(900,'100',submit,{waitForReceipts:false});assert.equal(sent,1);
 assert.equal(readState(path).jobs[0].reason,'deadline-buffer');
 await new GasQueue(path).tick(1000,'100',submit,{waitForReceipts:false});assert.equal(sent,1);
});
test('ambiguous broadcast timeout releases queue for another deadline without retrying the unknown job',async()=>{
 const path=file(),q=new GasQueue(path);q.enqueue(job('unknown',10));q.enqueue(job('next',20));let attempts=0;
 await q.tick(10,'100',async()=>{attempts++;return new Promise(()=>{});},{waitForReceipts:false,submitTimeoutMs:10});
 assert.equal(readState(path).jobs[0].status,'needs-reconciliation');
 await new GasQueue(path).tick(20,'100',async tx=>{attempts++;return{hash:tx.id};},{waitForReceipts:false});
 assert.equal(attempts,2);assert.equal(readState(path).jobs[1].status,'pending');
 assert.throws(()=>q.recordReceipt('next',{hash:'wrong',status:1,gasUsed:1n,gasPrice:1n}),/hash mismatch/);
 q.recordReceipt('next',null);assert.equal(readState(path).jobs[1].status,'pending');
});
