import {askDocs} from '../docs.mjs';
import {contractView} from './chain.mjs';
import {chainInfo,DEFAULT_TOKEN} from '../read.mjs';
import {address} from './core.mjs';
import {formatUnits} from 'ethers';
export function routeIntent(request){
 if(typeof request!=='string'||!request.trim())throw new Error('A request is required');
 if(/\b(?:delete|deploy|transfer|send|swap|approve|buy|sell|stake|borrow|withdraw|bridge|mint|burn)\b/i.test(request))return null;
 const matches=[/total\s*supply|totalsupply/i,/decimals/i,/native.*balance|PROS.*balance|balance.*PROS/i].filter(r=>r.test(request));if(matches.length!==1)return null;
 const viewPattern=/^\s*(?:(?:how do i|please|can you|i want to)\s+)?(?:read|query|check|get|show)\s+(?:the\s+|my\s+)?(?:(?:usdc|erc20)\s+)?(?:total\s*supply|totalsupply|decimals)(?:\s*\(\s*\))?(?:\s+(?:for|of|at)\s+(?:contract\s+)?0x[0-9a-f]{40})?(?:\s+on\s+pharos)?\s*\??$/i;
 const nativePattern=/^\s*(?:(?:how do i|please|can you|i want to)\s+)?(?:read|query|check|get|show)\s+(?:the\s+|my\s+)?(?:native\s+(?:pros\s+)?balance|pros\s+balance)(?:\s+(?:for|of|at)\s+0x[0-9a-f]{40})?(?:\s+on\s+pharos)?\s*\??$/i;
 if(!viewPattern.test(request)&&!nativePattern.test(request))return null;
 if(/total\s*supply|totalsupply/i.test(request))return {kind:'contract',function:'totalSupply'};
 if(/decimals/i.test(request))return {kind:'contract',function:'decimals'};
 if(/native.*balance|PROS.*balance|balance.*PROS/i.test(request))return {kind:'native',function:'get_balance'};
 return null;
}
export async function groundedRequest(docs,chain,request,{wallet,contract=DEFAULT_TOKEN}={}){
 const intent=routeIntent(request);const question=intent?.kind==='native'?`How do I read the native PROS balance of an address on Pharos via get_balance/eth_getBalance? Explain units and a read-only verification method.`:intent?`How do I read the ERC20 ${intent.function}() function on Pharos using a read-only call? Explain exactly what this function returns, its parameters and units. Use the Pharos contract tutorials and cite the documentation.`:request;
 const answer=await askDocs(docs.raw.bind(docs),question);
 const mentioned=request.match(/0x[0-9a-f]{40}/gi)??[];const target=intent?.kind==='native'?wallet:contract;
 const targetMismatch=mentioned.some(a=>address(a)!==address(target))||intent?.kind==='contract'&&(/\b(?:USDT|WETH|DAI|WBTC)\b/i.test(request)||/\bUSDC\b/i.test(request)&&address(contract)!==address(DEFAULT_TOKEN));
 const plan={request,intent,resolvedTarget:target,question,answer,createdAt:new Date().toISOString()};
 if(targetMismatch)return {status:'unsupported',plan,executed:false,reason:'Requested target is not the configured target; supply the correct supported contract or wallet explicitly.'};
 if(!intent||answer.status!=='answered'||!answer.sources.length)return {status:'unsupported',plan,executed:false,reason:!intent?'No supported executable intent; documents cannot authorize arbitrary execution.':'Docs MCP did not supply a sourced answer.'};
 const name=intent.function==='get_balance'?'(?:get_balance|eth_getBalance|balance)':intent.function; if(!new RegExp(name,'i').test(answer.answer))return {status:'unsupported',plan,executed:false,reason:'The sourced answer does not explain the selected operation.'};
 const {block}=await chainInfo(chain.call.bind(chain)),tag='0x'+block.toString(16);let result,verification;
 if(intent.kind==='native'){wallet=address(wallet);result=await chain.call('get_balance',{address:wallet,block:tag});verification=await chain.call('get_balance',{address:wallet,block:tag});}
 else{result=await contractView(chain.call.bind(chain),{contract,func:intent.function,block:tag});verification=await contractView(chain.call.bind(chain),{contract,func:intent.function,block:tag});}
 const verified=JSON.stringify(result)===JSON.stringify(verification);let humanValue;
 if(intent.function==='totalSupply'){const decimals=await contractView(chain.call.bind(chain),{contract,func:'decimals',block:tag});humanValue={decimals:Number(decimals.value),amount:formatUnits(result.value,Number(decimals.value))};}
 return {status:verified?'verified':'verification-failed',plan,executed:true,result,verification,humanValue,block:tag,interpretation:intent.function==='decimals'?`This token reports ${result.value} decimal places; divide raw token amounts by 10^${result.value}.`:intent.function==='totalSupply'?`totalSupply returned ${result.value} raw token units (${humanValue.amount} tokens at ${humanValue.decimals} decimals) at block ${block}.`:`The address held ${result.balance} ${result.symbol} at block ${block}.`,verificationMethod:'Repeat the same read at the same block; this checks consistency, not independent-provider agreement.',capturedAt:new Date().toISOString()};
}
