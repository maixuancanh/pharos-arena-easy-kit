import {mkdtempSync,mkdirSync,copyFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {createLab,normalizeTx} from '../src/remaining/execution-lab.mjs';
import {runSaga,observeTrend,GasQueue,scanArbitrage,saveState,receiptData,readState} from '../src/remaining/execution.mjs';
import {connect,CHAIN_MCP} from '../src/mcp.mjs';

const out=resolve('evidence/remaining/execution');mkdirSync(out,{recursive:true});
const work=mkdtempSync(join(tmpdir(),'arena-execution-demo-'));
const summary={capturedAt:new Date().toISOString(),localChain:{chainId:31337,network:'ephemeral Ganache local EVM; NOT Pharos mainnet/testnet',keys:'ephemeral internally generated accounts; never exported'},tasks:{}};
const lab=await createLab();
try{
 // Compare identical independent calldata against fresh storage targets.
 const batch=await lab.deploy('BatchExecutorLab'),batchedTarget=await lab.deploy('ActionLab'),individualTarget=await lab.deploy('ActionLab');
 const actions=[{id:0,value:7,fail:false},{id:1,value:8,fail:true},{id:2,value:9,fail:false}];
 const calls=actions.map(a=>batchedTarget.interface.encodeFunctionData('action',[a.id,a.value,a.fail]));
 const batchedReceipt=await (await batch.execute(Array(3).fill(await batchedTarget.getAddress()),calls,{gasLimit:500000})).wait();
 const individualReceipts=[];
 for(const a of actions){const tx=normalizeTx(await individualTarget.action(a.id,a.value,a.fail,{gasLimit:150000}));const r=await tx.wait();individualReceipts.push({hash:r.hash,status:Number(r.status),gasUsed:r.gasUsed.toString(),gasPrice:r.gasPrice.toString()});}
 const individualGas=individualReceipts.reduce((n,r)=>n+BigInt(r.gasUsed),0n);
 const batchEvidence={executionMode:summary.localChain.network,actions,contract:await batch.getAddress(),target:await batchedTarget.getAddress(),receipt:receiptData(batchedReceipt),results:batchedReceipt.logs.map(x=>{const e=batch.interface.parseLog(x);return {index:Number(e.args.index),success:e.args.success,returnData:e.args.returnData};}),individualReceipts,gasComparison:{individualGas:individualGas.toString(),batchGas:batchedReceipt.gasUsed.toString(),gasSaved:(individualGas-batchedReceipt.gasUsed).toString(),stepReduction:'3 signed transactions -> 1 (2 fewer / 66.67%)',excludes:'contract deployment; identical actions on fresh mappings; one action intentionally reverts'},state:await Promise.all(actions.map(async a=>({id:a.id,value:(await batchedTarget.values(a.id)).toString()})))};
 saveState(join(out,'batch.json'),batchEvidence);summary.tasks['batch-executor']={status:'local-EVM-demonstrated',evidence:'execution/batch.json',...batchEvidence.gasComparison};

 for(const forcedFailure of [false,true]){
  const c=await lab.deploy('SagaLab');const name=forcedFailure?'saga-forced-failure':'saga-success';let attempts=0;
  const steps=[{id:'approve',send:async()=>{if(++attempts===1)throw Object.assign(Error('Injected pre-broadcast transient transport failure'),{transient:true,safeToRetry:true});return normalizeTx(await c.approve(100));},compensate:async()=>normalizeTx(await c.approve(0))},{id:'swap',send:async()=>normalizeTx(await c.swap(100)),compensate:async()=>normalizeTx(await c.undoSwap(100))},{id:'deposit',send:async()=>normalizeTx(await c.deposit(100,forcedFailure,{gasLimit:150000}))}];
  const path=join(work,name+'.json');const state=await runSaga(path,steps,{maxAttempts:3,retryDelayMs:5});
  const replay=await runSaga(path,steps);if(replay.log.length!==state.log.length)throw Error('Saga replay duplicated work');
  saveState(join(out,name+'.json'),{network:summary.localChain,contract:await c.getAddress(),injection:'one transient failure before broadcasting approve; forced failure is a real mined reverted deposit',state,balances:{cash:(await c.cash()).toString(),allowance:(await c.allowance()).toString(),assets:(await c.assets()).toString(),deposited:(await c.deposited()).toString()},restartReplay:'terminal saga reopening caused zero broadcasts'});
 }
 summary.tasks['saga-executor']={status:'local-EVM-demonstrated',evidence:['execution/saga-success.json','execution/saga-forced-failure.json'],limitations:'Lab accounting is reversible 1:1. Real swaps cannot roll back atomically and unwind can lose value. Unknown broadcast/receipt states require reconciliation; never blindly rebroadcast.'};

 const trendPath=join(work,'trend.json'),readings=[100,30,100,90,80,70];const outputs=[];
 for(let i=0;i<readings.length;i++){outputs.push(observeTrend(trendPath,{id:String(i+1),at:i+1,value:readings[i],source:'controlled fixture; not oracle'},{count:3,direction:'down'}));if(i===3)outputs.push(observeTrend(trendPath,{id:'4',at:4,value:90},{count:3,direction:'down'}));}
 saveState(join(out,'trend.json'),{source:'controlled fixture; each call reloads disk state',readings,outputs,stored:readState(trendPath),expected:'isolated 100->30->100 spike does not trigger; observation 5 (100->90->80) triggers once; duplicate 4 rejected'});
 summary.tasks['trend-watcher']={status:'persistent-fixture-demonstrated',evidence:'execution/trend.json'};

 const gasPath=join(work,'gas-queue.json'),q=new GasQueue(gasPath),recipient=await (await lab.provider.getSigner(1)).getAddress();
 q.enqueue({id:'cheaper',requestedAt:0,deadline:100,requestPriceWei:'3000000000',targetPriceWei:'2000000000',transaction:{to:recipient,value:'1'}});
 const submit=async(tx,price)=>normalizeTx(await lab.signer.sendTransaction({...tx,value:BigInt(tx.value),gasPrice:BigInt(price),gasLimit:21000}));
 await q.tick(10,'3000000000',submit);await new GasQueue(gasPath).tick(20,'1500000000',submit);
 q.enqueue({id:'deadline',requestedAt:20,deadline:100,requestPriceWei:'3000000000',targetPriceWei:'1000000000',transaction:{to:recipient,value:'1'}});
 await q.tick(99,'4000000000',submit);await q.tick(100,'4000000000',submit);
 saveState(join(out,'gas.json'),{network:summary.localChain,clock:'controlled virtual scheduler ticks; EVM receipts and actual fee payments are real locally',state:readState(gasPath),benchmark:'actual gas used multiplied by request-time price; counterfactual fee, not a second historical transaction',limitation:'At first tick >= deadline submits even if expensive. No absolute deadline guarantee during scheduler downtime, RPC outage, congestion, OS suspension or signature delay. Receipt inclusion is not guaranteed by submission deadline.'});
 summary.tasks['gas-fee-optimizer']={status:'partial-local-EVM-demonstrated',evidence:'execution/gas.json',gap:'Organizer never misses deadline is only demonstrated for healthy controlled scheduler ticks; no unconditional timing guarantee.'};

 const arbPath=join(work,'arbitrage.json');const venueA=await lab.deploy('PriceSourceLab'),venueB=await lab.deploy('PriceSourceLab');
 for(const sellPrice of [11000,10010]){
  const update=await (await venueB.setPrice(sellPrice)).wait();const blockNumber=update.blockNumber;const observedAt=Date.now();
  const adapter=c=>async()=>({source:await c.getAddress(),price:Number(await c.price({blockTag:blockNumber}))/100,at:observedAt,blockNumber,network:'local chain 31337 controlled reference-rate contract'});
  await scanArbitrage(arbPath,[adapter(venueA),adapter(venueB)],{quantity:10,feeBps:30,slippageBps:20,gasCost:2,threshold:5});
 }
 saveState(join(out,'arbitrage.json'),{source:'two distinct real local EVM reference-rate contracts read at the same pinned block; prices are deliberately controlled, NOT market prices or live Pharos oracles',units:'prices, fees, gas and profit use same quote currency; quantity is base token units',...readState(arbPath)});
 summary.tasks['arbitrage-scanner']={status:'simulated-demonstrated',evidence:'execution/arbitrage.json',limitations:'Reads two local EVM reference-rate contracts with controlled prices; simulated execution explicitly allowed. Profit is a quoted estimate, not an executable market guarantee.'};
}finally{await lab.close();}

if(process.argv.includes('--live')){
 let mcp;try{
  mcp=await connect(CHAIN_MCP,join(out,'live-mcp.jsonl'));const chain=await mcp.call('get_chain_info');const readings=[];
  const liveTrendPath=join(work,'live-trend.json');
  for(let i=0;i<3;i++){const gas=await mcp.call('get_gas_price');const observation={id:`${Date.now()}-${i}`,at:Date.now(),value:Number(gas.gasPriceWei),source:CHAIN_MCP,gas};readings.push(observation);observeTrend(liveTrendPath,observation,{count:3,direction:'down'});}
  saveState(join(out,'live-trend.json'),{source:'actual current Pharos MCP gas quotes persisted through observeTrend; no synthetic values',...readState(liveTrendPath)});
  saveState(join(out,'live-gas.json'),{source:CHAIN_MCP,chain,readings,usage:'read-only current network gas quotes; no broadcasts. Three close readings demonstrate access, not a statistically meaningful trend.'});
  summary.liveReadEvidence='execution/live-gas.json';
 }catch(e){summary.liveReadError=e.message;}finally{if(mcp)await mcp.close();}
}
saveState(resolve('evidence/remaining/execution-summary.json'),summary);
console.log(JSON.stringify(summary,null,2));
