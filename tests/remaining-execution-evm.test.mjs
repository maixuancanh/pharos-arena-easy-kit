import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {createLab,normalizeTx} from '../src/remaining/execution-lab.mjs';
import {runSaga} from '../src/remaining/execution.mjs';
test('real EVM batch preserves successful independent actions and saga recovers mined failure',async()=>{
 const lab=await createLab();try{
 const a=await lab.deploy('ActionLab'),batch=await lab.deploy('BatchExecutorLab');
 const calls=[a.interface.encodeFunctionData('action',[0,7,false]),a.interface.encodeFunctionData('action',[1,8,true]),a.interface.encodeFunctionData('action',[2,9,false])];
 const receipt=await (await batch.execute(Array(3).fill(await a.getAddress()),calls)).wait();
 const events=receipt.logs.map(x=>batch.interface.parseLog(x));assert.deepEqual(events.map(x=>x.args.success),[true,false,true]);assert.equal(await a.values(0),7n);assert.equal(await a.values(1),0n);assert.equal(await a.values(2),9n);
 for(const fail of [false,true]){
 const c=await lab.deploy('SagaLab');const path=join(mkdtempSync(join(tmpdir(),'arena-evm-')),'saga.json');
 const steps=[{id:'approve',send:async()=>normalizeTx(await c.approve(100)),compensate:async()=>normalizeTx(await c.approve(0))},{id:'swap',send:async()=>normalizeTx(await c.swap(100)),compensate:async()=>normalizeTx(await c.undoSwap(100))},{id:'deposit',send:async()=>normalizeTx(await c.deposit(100,fail,{gasLimit:150000}))}];
 const state=await runSaga(path,steps);assert.equal(state.status,fail?'compensated':'completed');assert.equal(await c.cash(),fail?1000n:900n);assert.equal(await c.assets(),0n);assert.equal(await c.deposited(),fail?0n:100n);assert.equal(await c.allowance(),0n);
 assert.equal(state.steps[0].receipt.status,1);assert.equal(state.steps[1].receipt.status,1);
 }
 }finally{await lab.close();}
});
