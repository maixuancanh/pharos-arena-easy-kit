import ganache from 'ganache';
import solc from 'solc';
import {BrowserProvider,ContractFactory,parseUnits,formatUnits,id} from 'ethers';
import {readFileSync} from 'node:fs';
import {readVaults,readLending,prepareRoute,answerPortfolio} from './defi.mjs';
export async function runDefiLab({onAlert=()=>{}}={}){
 const source=readFileSync(new URL('../../contracts/remaining/DefiLab.sol',import.meta.url),'utf8');
 const compiled=JSON.parse(solc.compile(JSON.stringify({language:'Solidity',sources:{'DefiLab.sol':{content:source}},settings:{evmVersion:'shanghai',outputSelection:{'*':{'*':['abi','evm.bytecode.object']}}}})));
 const errors=compiled.errors?.filter(e=>e.severity==='error');if(errors?.length)throw Error(errors.map(e=>e.formattedMessage).join('\n'));
 const rpc=ganache.provider({logging:{quiet:true},chain:{chainId:31337,hardfork:'shanghai'},wallet:{totalAccounts:2}}),provider=new BrowserProvider(rpc);provider.pollingInterval=20;
 try{
 const signer=await provider.getSigner(),wallet=await signer.getAddress();const transcript=[],deployments=[],receipts=[];
 const capture=r=>({hash:r.hash,status:Number(r.status),blockNumber:r.blockNumber,gasUsed:String(r.gasUsed),gasPrice:String(r.gasPrice)});
 const mine=async promise=>{const tx=await promise;let r;try{r=await tx.wait();}catch(e){console.error(JSON.stringify({gasLimit:String(tx.gasLimit),receiptGasUsed:String(e.receipt?.gasUsed),data:tx.data}));throw e;}const out=capture(r);receipts.push(out);return out;};
 const deploy=async(name,args=[])=>{const a=compiled.contracts['DefiLab.sol'][name];const c=await new ContractFactory(a.abi,a.evm.bytecode.object,signer).deploy(...args);await c.waitForDeployment();deployments.push({name,address:await c.getAddress(),receipt:capture(await c.deploymentTransaction().wait())});return c;};
 const block=async()=>parseInt(await rpc.request({method:'eth_blockNumber',params:[]}),16);
 const call=async(name,args={})=>{let result;if(name==='get_chain_info')result={chainId:31337,latestBlock:await block()};else if(name==='get_code')result=await rpc.request({method:'eth_getCode',params:[args.address,args.block??'latest']});else if(name==='eth_call')result=await rpc.request({method:'eth_call',params:[args.transaction,args.block??'latest']});else if(name==='get_block'){const b=await rpc.request({method:'eth_getBlockByNumber',params:[args.block,false]});result={...b,timestamp:parseInt(b.timestamp,16)};}else throw Error('Unsupported '+name);transcript.push({name,args,result});return result;};
 const token=await deploy('LabToken'),oracle=await deploy('LabOracle');const lending=await deploy('LabLending',[await token.getAddress(),await oracle.getAddress()]);
 const a=await deploy('LabVault',[await token.getAddress(),'Vault-A']),b=await deploy('LabVault',[await token.getAddress(),'Vault-B']);const units=v=>parseUnits(v,6);
 await mine(token.mint(wallet,units('1000')));await mine(token.mint(await lending.getAddress(),units('1000')));
 for(const vault of[a,b]){await mine(token.approve(await vault.getAddress(),units('500')));await mine(vault.deposit(units('100'),wallet));}
 // Actual prices at two blocks a year apart in the isolated lab; not market returns.
 const historyBlock=await block();await rpc.request({method:'evm_increaseTime',params:[31536000]});
 await mine(a.setPrice(parseUnits('1.04',18)));await mine(b.setPrice(parseUnits('1.10',18)));
 // Back reserves for fixture yield so withdrawal transfers real lab tokens.
 await mine(token.mint(await a.getAddress(),units('4')));await mine(token.mint(await b.getAddress(),units('10')));
 const config={wallet,expectedChainId:31337,lookbackBlocks:(await block())-historyBlock,vaults:[{id:'Vault-A',address:await a.getAddress()},{id:'Vault-B',address:await b.getAddress()}]};
 const snapshot=await readVaults(call,config),beforePreparationBlock=await block();
 const deposit=await prepareRoute(call,snapshot,{action:'deposit',amount:'27.5'}),withdraw=await prepareRoute(call,snapshot,{action:'withdraw',amount:'10.4'});
 const afterPreparationBlock=await block();if(deposit.decision!=='prepare'||withdraw.decision!=='prepare')throw Error('Funded preparation failed');
 // Only the harness signs with disposable local keys, never the agent or mainnet.
 const sendPrepared=async p=>{if(p.transaction.chainId!==31337)throw Error('Local signing guard');const {from,chainId,...tx}=p.transaction;return mine(signer.sendTransaction(tx));};
 const actionReceipts=[await sendPrepared(deposit),await sendPrepared(withdraw)];
 await mine(b.setAvailable(false));const outageConfig={...config,lookbackBlocks:(await block())-historyBlock};const outageSnapshot=await readVaults(call,outageConfig);const outage=await prepareRoute(call,outageSnapshot,{action:'deposit',amount:'1'});
 await mine(token.approve(await a.getAddress(),0));const noAllowanceSnapshot={...outageSnapshot,block:await block()};const insufficientAllowance=await prepareRoute(call,noAllowanceSnapshot,{action:'deposit',amount:'1'});
 const market=id('mutable lab lending market');await mine(token.approve(await lending.getAddress(),units('500')));await mine(lending.supplyCollateral(market,units('200')));await mine(lending.borrow(market,units('100'),{gasLimit:200000}));
 const observations=[];const observe=async()=>{const r=await readLending(call,{wallet,marketId:market,contract:await lending.getAddress(),expectedChainId:31337,thresholds:{warning:1.3,critical:1.1,target:1.5}});observations.push(r);if(r.alert.level!=='healthy')onAlert(r.alert);return r;};
 await observe();await mine(oracle.setPrice(75n*10n**34n));await observe();await mine(oracle.setPrice(625n*10n**33n));const critical=await observe();
 const repayUnits=BigInt(Math.ceil(critical.alert.repay*1e6));const repayment=await mine(lending.repay(market,repayUnits,{gasLimit:150000}));await observe();
 return {capturedAt:new Date().toISOString(),network:{chainId:31337,name:'isolated Ganache local EVM; not Pharos testnet or mainnet'},limitations:'Purpose-built contracts exercise transfers, approvals, share accounting, configurable prices and mutable lending state. Not audited production protocols. No interest, KYC or asynchronous settlement model. Controlled price increases are reserve-funded fixtures.',deployments,aggregator:{snapshot,queries:answerPortfolio('show my positions',snapshot),deposit,withdraw,beforePreparationBlock,afterPreparationBlock,receipts:actionReceipts,outage,unavailable:outageSnapshot.vaults.filter(v=>v.status==='unavailable'),insufficientAllowance,remainingSharesA:formatUnits(await a.balanceOf(wallet),6),remainingSharesB:formatUnits(await b.balanceOf(wallet),6)},lending:{market,observations,repayment,repayAmount:formatUnits(repayUnits,6)},allReceipts:receipts,transcript};
 }finally{await provider.destroy();await rpc.disconnect();}
}
