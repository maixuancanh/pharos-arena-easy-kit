import {mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {setTimeout as sleep} from 'node:timers/promises';
import {createLab,normalizeTx} from '../src/remaining/execution-lab.mjs';
import {GasQueue,readState,saveState} from '../src/remaining/execution.mjs';
const lab=await createLab();
try{
 const path=join(mkdtempSync(join(tmpdir(),'arena-gas-worker-')),'queue.json');const queue=new GasQueue(path);
 const recipient=await (await lab.provider.getSigner(1)).getAddress();const start=Date.now();const lead=200;
 queue.enqueue({id:'favorable-unmined',requestedAt:start,deadline:start+3000,dispatchLeadMs:lead,requestPriceWei:'3000000000',targetPriceWei:'2000000000',transaction:{to:recipient,value:'1'}});
 queue.enqueue({id:'deadline-while-other-pending',requestedAt:start,deadline:start+1000,dispatchLeadMs:lead,requestPriceWei:'3000000000',targetPriceWei:'1',transaction:{to:recipient,value:'2'}});
 await lab.rpc.request({method:'miner_stop',params:[]});let nonce=await lab.signer.getNonce('pending');const observed=[];
 const submit=async(tx,price)=>normalizeTx(await lab.signer.sendTransaction({...tx,value:BigInt(tx.value),gasPrice:BigInt(price),gasLimit:21000,nonce:nonce++}));
 // Gas sampling and pending receipt collection are independent of deadline dispatch.
 await queue.tick(Date.now(),'1500000000',submit,{waitForReceipts:false});
 const slowQuoteStarted=Date.now();const slowQuote=sleep(1500).then(()=>({finishedAt:Date.now(),priceWei:'4000000000'}));
 while(readState(path).jobs.some(x=>x.status==='queued')){
  observed.push({at:Date.now(),priceWei:'4000000000',source:'cached controlled quote; background quote intentionally slow'});
  await queue.tick(Date.now(),'4000000000',submit,{waitForReceipts:false});
  await queue.reconcile(hash=>lab.provider.getTransactionReceipt(hash));
  if(readState(path).jobs.some(x=>x.status==='queued'))await sleep(20);
 }
 const beforeMining=readState(path);if(beforeMining.jobs.some(j=>j.status!=='pending'||j.acceptedAt>j.deadline))throw Error('Deadline dispatch demonstration failed');
 const restarter=new GasQueue(path);let repeats=0;await restarter.tick(Date.now(),'1',async()=>{repeats++;});if(repeats)throw Error('Restart duplicated payment');
 await lab.rpc.request({method:'miner_start',params:[1]});
 for(let i=0;i<100&&readState(path).jobs.some(j=>j.status==='pending');i++){await restarter.reconcile(hash=>lab.provider.getTransactionReceipt(hash));await sleep(20);}
 const state=readState(path);if(state.jobs.some(j=>j.status!=='confirmed'))throw Error('Missing mined receipt');
 const quote=await slowQuote;
 const evidence={network:'isolated Ganache chain 31337; not Pharos',clock:'real wall clock',dispatchLeadMs:lead,pollMs:20,slowQuote:{startedAt:slowQuoteStarted,...quote},observed,beforeMining,state,restartBroadcasts:repeats,acceptanceBeforeDeadline:state.jobs.every(j=>j.acceptedAt<=j.deadline),scope:'Healthy local host, pre-authorized disposable signer and responsive broadcast RPC. Mining intentionally paused. Scheduler uses cached gas while a slow quote runs. Deadlines concern broadcast acceptance, not mining. Outages/suspension can still cause misses; lead margin is configurable and lateness is recorded.',benchmark:'Actual receipt gas used * request-time gas price; counterfactual comparison, not a historical transaction.'};
 saveState(resolve('evidence/remaining/execution/gas-worker.json'),evidence);console.log(JSON.stringify(evidence,null,2));
}finally{await lab.close();}
