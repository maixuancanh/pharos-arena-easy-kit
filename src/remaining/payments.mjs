import {getAddress,Interface,parseUnits,toBeHex,AbiCoder} from 'ethers';
import {readFileSync,writeFileSync,renameSync,mkdirSync,openSync,closeSync,unlinkSync,existsSync} from 'node:fs';
import {dirname} from 'node:path';
export const erc20=new Interface(['function decimals() view returns(uint8)','function balanceOf(address) view returns(uint256)','function transfer(address,uint256) returns(bool)','event Transfer(address indexed from,address indexed to,uint256 value)']);
const clarify=reason=>({status:'needs-clarification',question:reason});
const amountOK=x=>typeof x==='string'&&/^(0|[1-9]\d*)(\.\d+)?$/.test(x)&&Number(x)>0;
export function parseIntent(text){
 const m=String(text).trim().match(/^(?:please\s+)?(?:send|pay|transfer)\s+(\S+)\s+([A-Za-z][A-Za-z0-9]*)\s+to\s+(0x[a-fA-F0-9]{40})[.!]?$/i);
 if(!m||!amountOK(m[1]))return clarify('Specify one positive decimal amount, token symbol and 0x recipient, for example: send 1 USDC to 0x… . Names and multiple recipients require clarification.');
 try{return {status:'parsed',payment:{amount:m[1],token:m[2].toUpperCase(),recipient:getAddress(m[3])}};}catch{return clarify('Provide a valid recipient address with a valid checksum.');}
}
// Invoices deliberately accept a flat object of string fields only.
function flatInvoiceJSON(text){
 const input=String(text).trim();let i=0;const obj=Object.create(null);
 const whitespace=()=>{while(/\s/.test(input[i]??'')&&i<input.length)i++;};
 const string=()=>{whitespace();if(input[i]!=='"')throw Error('Invoice fields must be JSON strings');const begin=i++;let escaped=false;while(i<input.length){const c=input[i++];if(escaped){escaped=false;continue;}if(c==='\\'){escaped=true;continue;}if(c==='"')return JSON.parse(input.slice(begin,i));}throw Error('Unterminated JSON string');};
 if(input[i++]!=='{')throw Error('Expected invoice object');whitespace();if(input[i]==='}')i++;else while(true){const key=string();if(Object.hasOwn(obj,key))throw Error('Duplicate invoice fields');whitespace();if(input[i++]!==':')throw Error('Expected colon');obj[key]=string();whitespace();const end=input[i++];if(end==='}')break;if(end!==',')throw Error('Expected comma or object end');}
 whitespace();if(i!==input.length)throw Error('Unexpected invoice content');return obj;
}
export function parseInvoice(text){
 let obj;try{if(String(text).trim().startsWith('{')){obj=flatInvoiceJSON(text);}else{obj={};for(const line of String(text).trim().split(/\r?\n/)){const m=line.match(/^\s*(payee|recipient|amount|token|currency|reference)\s*:\s*(.*?)\s*$/i);if(!m)throw Error('Unknown invoice line');const key=m[1].toLowerCase();if(Object.hasOwn(obj,key))throw Error('Duplicate invoice fields');obj[key]=m[2];}}
 if(obj.payee&&obj.recipient&&obj.payee.toLowerCase()!==obj.recipient.toLowerCase()||obj.token&&obj.currency&&obj.token.toUpperCase()!==obj.currency.toUpperCase())throw Error('Conflicting invoice fields');
 if(Object.keys(obj).some(k=>!['payee','recipient','amount','token','currency','reference'].includes(k)))throw Error('Unsupported invoice field; resolve totals or conversion explicitly');
 const p={recipient:obj.payee??obj.recipient,amount:obj.amount,token:obj.token??obj.currency,reference:obj.reference};
 if(!amountOK(p.amount)||!p.token||typeof p.reference!=='string'||!p.reference.trim()||p.reference.length>200)throw Error('Missing or invalid amount, token, reference or payee');p.recipient=getAddress(p.recipient);p.token=p.token.toUpperCase();return {status:'parsed',payment:p};
 }catch(e){return clarify(`Correct the invoice: ${e.message}`);}
}
export async function preparePayment(call,payment,config,onSummary=()=>{}){
 const p={...payment,from:getAddress(payment.from),recipient:getAddress(payment.recipient)};
 if(!amountOK(p.amount))throw Error('Amount must be a positive plain decimal string');
 if(p.recipient==='0x0000000000000000000000000000000000000000')throw Error('Zero recipient is forbidden');
 if(p.from===p.recipient)throw Error('Self-payment is unsupported');
 const token=config.tokens[p.token];if(!token)throw Error(`Unknown token ${p.token}; configure its verified contract explicitly`);
 const info=await call('get_chain_info',{});if(BigInt(info.chainId)!==BigInt(config.chainId))throw Error('Wrong chain');const block=info.latestBlockHex??toBeHex(BigInt(info.latestBlock));
 let decimals=18,contract=null;
 if(token.address){contract=getAddress(token.address);const code=await call('get_code',{address:contract,block});if(!/^(0x)?[a-fA-F0-9]+$/.test(code.code??code)||BigInt((code.code??code)||'0x0')===0n)throw Error('Token contract has no bytecode');const d=await call('eth_call',{transaction:{to:contract,data:erc20.encodeFunctionData('decimals')},block});decimals=Number(erc20.decodeFunctionResult('decimals',d)[0]);if(decimals!==token.decimals)throw Error('Token decimals mismatch');}
 else if(p.token!==info.nativeSymbol)throw Error('Native symbol does not match chain');
 const raw=parseUnits(p.amount,decimals);if(raw<=0n)throw Error('Amount rounds to zero');
 const native=await call('get_balance',{address:p.from,block});let balance=BigInt(native.balanceWei);
 if(contract){const r=await call('eth_call',{transaction:{to:contract,data:erc20.encodeFunctionData('balanceOf',[p.from])},block});balance=erc20.decodeFunctionResult('balanceOf',r)[0];}if(balance<raw)throw Error('Insufficient token balance');
 const tx={from:p.from,to:contract??p.recipient,value:toBeHex(contract?0n:raw),data:contract?erc20.encodeFunctionData('transfer',[p.recipient,raw]):'0x'};
 if(p.reference){if(typeof p.reference!=='string'||!p.reference.trim()||p.reference.length>200)throw Error('Invalid invoice reference');if(!contract)throw Error('Invoice memo currently supports ERC20 payments only');tx.data+=AbiCoder.defaultAbiCoder().encode(['string'],[p.reference]).slice(2);}if(contract){const sim=await call('eth_call',{transaction:tx,block});if(!erc20.decodeFunctionResult('transfer',sim)[0])throw Error('Token transfer simulation returned false');}
 const estimate=await call('estimate_gas',{transaction:tx}),quote=await call('get_gas_price',{});const gas=(BigInt(estimate.gas??estimate)*120n+99n)/100n,price=BigInt(quote.gasPriceWei);if(gas<=0n||price<=0n)throw Error('Invalid gas quote');if(BigInt(native.balanceWei)<gas*price+(contract?0n:raw))throw Error('Insufficient native balance for gas and value');
 const nonce=await call('get_transaction_count',{address:p.from,block:'pending'});
 const summary=`Send ${p.amount} ${p.token} from ${p.from} to ${p.recipient}${p.reference?` for invoice ${p.reference}`:''}; maximum estimated gas budget ${gas*price} wei. Review before signing. Nothing has been sent.`;await onSummary(summary);
 return {status:'prepared',mode:'unsigned-only',summary,reference:p.reference??null,payment:p,tokenContract:contract,amountRaw:String(raw),block,checkedAt:new Date().toISOString(),transaction:{...tx,chainId:toBeHex(BigInt(info.chainId)),nonce:toBeHex(BigInt(nonce.transactionCount??nonce.nonce??nonce.count??nonce)),gasLimit:toBeHex(gas),gasPrice:toBeHex(price)},limits:'Quote and nonce can become stale. Revalidate before signing. Invoice reference is also an ABI-encoded string appended after standard ERC20 arguments. A successful preflight is required; token contracts may reject appended data.'};
}
export function dueAt(schedule,index){if(!['weekly','monthly'].includes(schedule.frequency)||!Number.isSafeInteger(index)||index<0)throw Error('Invalid schedule');const start=new Date(schedule.start);if(!Number.isFinite(start.valueOf())||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(schedule.start)||start.toISOString().slice(0,19)!==schedule.start.slice(0,19))throw Error('Schedule start must be UTC ISO date');if(schedule.frequency==='weekly')return new Date(start.valueOf()+index*7*86400000).toISOString();const d=new Date(start);d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()+index);const last=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)).getUTCDate();d.setUTCDate(Math.min(start.getUTCDate(),last));return d.toISOString();}
const save=(file,state)=>{writeFileSync(file+'.tmp',JSON.stringify(state,null,2)+'\n');renameSync(file+'.tmp',file);};
async function locked(file,fn){mkdirSync(dirname(file),{recursive:true});let fd;try{fd=openSync(file+'.lock','wx');return await fn();}finally{if(fd!==undefined){closeSync(fd);unlinkSync(file+'.lock');}}}
export async function runSchedule(file,schedule,now,prepare){return locked(file,async()=>{dueAt(schedule,0);const time=new Date(now);if(!Number.isFinite(time.valueOf()))throw Error('Invalid now');const state=existsSync(file)?JSON.parse(readFileSync(file,'utf8')):{schedule,history:[]};if(JSON.stringify(state.schedule)!==JSON.stringify(schedule))throw Error('Schedule changed; use a new state file');let i=state.history.length;if(i>10000)throw Error('History limit');while(new Date(dueAt(schedule,i))<=time&&!state.history.some(row=>row.status==='pending')){if(i>=10000)throw Error('Catch-up limit');const row={id:`${schedule.id}:${dueAt(schedule,i)}`,due:dueAt(schedule,i),status:'pending',phase:'preparing'};state.history.push(row);save(file,state);try{row.envelope=await prepare(schedule.payment);row.phase='awaiting-signature';}catch(e){row.status='failed';row.error=e.message;row.phase='preparation-failed';}save(file,state);i++;}state.nextDue=dueAt(schedule,i);save(file,state);return state;});}
export function verifyReceipt(envelope,tx,receipt,head,confirmations=2){
 if(!Number.isSafeInteger(confirmations)||confirmations<1)throw Error('Invalid confirmation threshold');if(!tx||!receipt)return {status:'pending',reason:'Transaction or receipt unavailable'};
 const expected=envelope.transaction,eq=(a,b)=>String(a).toLowerCase()===String(b).toLowerCase();
 if(!eq(tx.from,expected.from)||!eq(tx.to,expected.to)||BigInt(tx.value)!==BigInt(expected.value)||!eq(tx.input??tx.data,expected.data)||BigInt(tx.nonce)!==BigInt(expected.nonce)||BigInt(tx.chainId??(tx.v!==undefined&&BigInt(tx.v)>=35n?(BigInt(tx.v)-35n)/2n:-1n))!==BigInt(expected.chainId)||!eq(receipt.transactionHash,tx.hash)||!eq(receipt.blockHash,tx.blockHash)||!eq(receipt.from,expected.from)||!eq(receipt.to,expected.to))throw Error('Receipt transaction does not match prepared payment');
 const count=BigInt(head)-BigInt(receipt.blockNumber)+1n;if(count<BigInt(confirmations))return {status:'pending',confirmations:String(count)};
 if(BigInt(receipt.status)===0n)return {status:'failed',reason:'Mined transaction reverted',hash:tx.hash};if(BigInt(receipt.status)!==1n)throw Error('Unknown receipt status');
 if(envelope.tokenContract){const matching=(receipt.logs??[]).some(log=>{try{const event=erc20.parseLog(log);return eq(log.address,envelope.tokenContract)&&event.name==='Transfer'&&eq(event.args.from,expected.from)&&eq(event.args.to,envelope.payment.recipient)&&event.args.value===BigInt(envelope.amountRaw);}catch{return false;}});if(!matching)throw Error('Missing matching token Transfer event');}
 return {status:'paid',hash:tx.hash,confirmations:String(count)};
}
export async function reconcile(file,id,hash,call,confirmations=2){if(!/^0x[\da-f]{64}$/i.test(hash))throw Error('Invalid transaction hash');return locked(file,async()=>{const state=JSON.parse(readFileSync(file,'utf8')),row=state.history.find(x=>x.id===id);if(!row?.envelope)throw Error('Occurrence has no prepared envelope');if(state.history.some(x=>x.id!==id&&x.hash===hash))throw Error('Transaction already belongs to another occurrence');if(row.status==='paid')return state;if(row.hash&&row.hash!==hash)throw Error('Occurrence is bound to another transaction');const tx=await call('get_transaction',{hash}),receipt=await call('get_transaction_receipt',{hash}),info=await call('get_chain_info',{});const result=verifyReceipt(row.envelope,tx,receipt,info.latestBlock,confirmations);if(tx&&receipt)row.hash=hash;Object.assign(row,result);row.phase='reconciled';save(file,state);return state;});}

export async function paymentWorker(tick,{runs=Infinity,pollMs=60000,sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms))}={}){if(!(runs===Infinity||Number.isSafeInteger(runs)&&runs>0)||!Number.isSafeInteger(pollMs)||pollMs<1)throw Error('Invalid worker options');let result;for(let i=0;i<runs;i++){try{result=await tick();}catch(error){if(error.code!=='EEXIST')throw error;result??={status:'busy',reason:'State is being reconciled; next poll will retry'};}if(i+1<runs)await sleep(pollMs);}return result;}
