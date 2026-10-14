// LOCAL EVM FIXTURE ONLY. Does not load user keys, use network RPCs, or broadcast publicly.
import ganache from 'ganache';
import solc from 'solc';
import {BrowserProvider,ContractFactory,toQuantity} from 'ethers';
import {mkdirSync,writeFileSync,existsSync} from 'node:fs';
import {runSchedule,preparePayment,reconcile,verifyReceipt} from '../src/remaining/payments.mjs';
const out=process.argv[2]??'evidence/remaining/payments/local-receipts.json';
const stateFile=out+'.state.json';if(existsSync(stateFile))throw Error('Use a fresh output path to preserve existing receipt evidence');
const local=ganache.provider({logging:{quiet:true},chain:{chainId:31337},wallet:{totalAccounts:3}});
const provider=new BrowserProvider(local);const rpc=(method,params=[])=>local.request({method,params});
try{
 const [from,to]=await rpc('eth_accounts');const signer=await provider.getSigner(from);
 const source='pragma solidity ^0.8.20; contract Token { uint8 public decimals=6; mapping(address=>uint256) public balanceOf; bool public fail; event Transfer(address indexed from,address indexed to,uint256 value); constructor(){balanceOf[msg.sender]=1000000000;} function setFail(bool f) external {fail=f;} function transfer(address to,uint256 amount) external returns(bool){require(!fail,"forced failure");require(balanceOf[msg.sender]>=amount,"balance");balanceOf[msg.sender]-=amount;balanceOf[to]+=amount;emit Transfer(msg.sender,to,amount);return true;} }';
 const output=JSON.parse(solc.compile(JSON.stringify({language:'Solidity',sources:{'T.sol':{content:source}},settings:{evmVersion:'shanghai',outputSelection:{'*':{'*':['abi','evm.bytecode.object']}}}})));
 const compiled=output.contracts['T.sol'].Token;const token=await new ContractFactory(compiled.abi,compiled.evm.bytecode.object,signer).deploy();await token.waitForDeployment();const address=await token.getAddress();
 const config={chainId:31337,tokens:{LOCAL:{address,decimals:6}}};
 const call=async(name,a={})=>{switch(name){case 'get_chain_info':return {chainId:31337,latestBlock:BigInt(await rpc('eth_blockNumber')).toString(),nativeSymbol:'ETH'};case 'get_code':return {code:await rpc('eth_getCode',[a.address,a.block])};case 'eth_call':return rpc('eth_call',[a.transaction,a.block]);case 'get_balance':return {balanceWei:BigInt(await rpc('eth_getBalance',[a.address,a.block])).toString()};case 'estimate_gas':return {gas:await rpc('eth_estimateGas',[a.transaction])};case 'get_gas_price':return {gasPriceWei:BigInt(await rpc('eth_gasPrice')).toString()};case 'get_transaction_count':return {count:await rpc('eth_getTransactionCount',[a.address,a.block])};case 'get_transaction':return rpc('eth_getTransactionByHash',[a.hash]);case 'get_transaction_receipt':return rpc('eth_getTransactionReceipt',[a.hash]);default:throw Error('Unsupported local fixture read');}};
 const schedule={id:'local-weekly',frequency:'weekly',start:'2026-10-14T00:00:00Z',payment:{from,recipient:to,amount:'1',token:'LOCAL'}};
 let insufficientBalance;try{await preparePayment(call,{from,recipient:to,amount:'10000000000',token:'LOCAL'},config);}catch(error){insufficientBalance=error.message;}if(!insufficientBalance?.includes('Insufficient'))throw Error('Expected balance rejection');
 const summaries=[];const prepare=p=>preparePayment(call,p,config,s=>summaries.push(s));
 let state=await runSchedule(stateFile,schedule,schedule.start,prepare);const first=state.history[0];
 const send=async envelope=>{const {gasLimit,chainId,...tx}=envelope.transaction;return rpc('eth_sendTransaction',[{...tx,gas:toQuantity(gasLimit),nonce:toQuantity(tx.nonce),value:toQuantity(tx.value),gasPrice:toQuantity(tx.gasPrice)}]);};
 const hash1=await send(first.envelope);const tx1=await call('get_transaction',{hash:hash1}),receipt1=await call('get_transaction_receipt',{hash:hash1});
 const unconfirmed=verifyReceipt(first.envelope,tx1,receipt1,(await call('get_chain_info')).latestBlock,2);await rpc('evm_mine');
 state=await reconcile(stateFile,first.id,hash1,call,2);const afterPaid=structuredClone(state);
 state=await runSchedule(stateFile,schedule,'2026-10-21T00:00:00Z',prepare);const second=state.history[1];
 // A different local account toggles failure, so the payment sender's prepared nonce stays valid.
 const toggle=await token.connect(await provider.getSigner(2)).setFail(true);await toggle.wait();
 const hash2=await send(second.envelope);const tx2=await call('get_transaction',{hash:hash2}),receipt2=await call('get_transaction_receipt',{hash:hash2});await rpc('evm_mine');
 state=await reconcile(stateFile,second.id,hash2,call,2);const restart=await runSchedule(stateFile,schedule,'2026-10-21T00:00:00Z',prepare);
 if(state.history[0].status!=='paid'||state.history[1].status!=='failed'||restart.history.length!==2||unconfirmed.status!=='pending')throw Error('Local demo invariant failed');
 mkdirSync(new URL('../evidence/remaining/payments/',import.meta.url),{recursive:true});
 writeFileSync(out,JSON.stringify({label:'Actual receipts from ephemeral local Ganache EVM, chain 31337. NOT Pharos receipts. No public-chain broadcast.',capturedAt:new Date().toISOString(),insufficientBalance,summaries,unconfirmed,successful:{transaction:tx1,receipt:receipt1,state:afterPaid},reverted:{transaction:tx2,receipt:receipt2},restart},null,2)+'\n');console.log(`Verified local paid, pending confirmations, reverted failed, and restart idempotence: ${out}`);
}finally{await local.disconnect();}
