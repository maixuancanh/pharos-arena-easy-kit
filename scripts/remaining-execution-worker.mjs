// A bounded, healthy-process wall-clock scheduler demonstration. Local EVM only.
import {mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {setTimeout as sleep} from 'node:timers/promises';
import {createLab,normalizeTx} from '../src/remaining/execution-lab.mjs';
import {GasQueue,readState,saveState} from '../src/remaining/execution.mjs';
const lab=await createLab();
try{
 const path=join(mkdtempSync(join(tmpdir(),'arena-gas-worker-')),'queue.json');const queue=new GasQueue(path);
 const recipient=await (await lab.provider.getSigner(1)).getAddress();const start=Date.now(),deadline=start+500;
 queue.enqueue({id:'wall-clock-deadline',requestedAt:start,deadline,requestPriceWei:'2000000000',targetPriceWei:'1',transaction:{to:recipient,value:'1'}});
 const observed=[];
 while(readState(path).jobs.some(x=>x.status==='queued')){
  const now=Date.now();observed.push(now);
  await queue.tick(now,'2000000000',async(tx,price)=>normalizeTx(await lab.signer.sendTransaction({...tx,value:BigInt(tx.value),gasPrice:BigInt(price),gasLimit:21000})));
  const remaining=deadline-Date.now();if(remaining>0)await sleep(Math.min(50,remaining));
 }
 const evidence={network:'local Ganache chain 31337; not Pharos',clock:'real wall clock, healthy local process',observed,state:readState(path),guarantee:'Best effort first timer tick at or after deadline. latenessMs is measured, never hidden. No absolute timing or inclusion guarantee.'};
 saveState(resolve('evidence/remaining/execution/gas-worker.json'),evidence);console.log(JSON.stringify(evidence,null,2));
}finally{await lab.close();}
