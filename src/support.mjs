import {AbiCoder} from 'ethers';
export function classifyFailure(message,tx,receipt){
 const data=message.match(/0x08c379a0[0-9a-f]+/i)?.[0];let reason;
 if(data){try{reason=AbiCoder.defaultAbiCoder().decode(['string'],'0x'+data.slice(10))[0];}catch{}}
 const text=reason??message;
 if(/slippage.*output below minimum/i.test(text))return {type:'slippage-minimum-output',reason,explanation:'The swap would return less than the minimum output requested, so the contract stopped it.',fix:'Refresh the quote, check the route and amount, and use a minimum output consistent with your chosen slippage tolerance. Do not remove the protection just to force execution.'};
 if(/allowance/i.test(text))return {type:'insufficient-allowance',explanation:'The spender is not approved to use enough of your tokens.',fix:'Check the spender and token, approve only the amount needed, then retry.'};
 if(/transfer amount exceeds balance|insufficient.*(?:token|balance)|exceeds.*balance/i.test(text))return {type:'insufficient-token-balance',explanation:'The requested token amount is larger than the available token balance.',fix:'Check the token balance and decimals, then reduce the amount or fund the wallet.'};
 if(/not have enough funds|insufficient funds/i.test(text))return {type:'insufficient-native-funds-on-replay',explanation:'The read-only replay could not cover the native coin value. This is not proof of the original cause.',fix:'Check the PROS balance at the original block and keep enough for the value plus fees.'};
 if(/out of gas/i.test(text))return {type:'out-of-gas',explanation:'The call ran out of execution gas.',fix:'Estimate gas for the same call and use a larger limit if the call itself is valid.'};
 if(/0x4e487b71/i.test(text))return {type:'contract-panic',explanation:'The contract stopped because an internal safety check failed.',fix:'Check the contract inputs and report the panic code to the dApp developer.'};
 if(reason||/execution reverted|revert/i.test(text))return {type:'contract-revert',reason,explanation:reason?`The contract refused the request: ${reason}. This code is preserved exactly; its contract-specific meaning is not verified.`:'The contract refused the request, but the provider did not return a readable reason.',fix:'Check recipient, amounts and contract restrictions. Simulate again before sending; ask the dApp to explain the exact returned code.'};
 if(receipt&&BigInt(receipt.gasUsed)===BigInt(tx.gas))return {type:'gas-limit-exhausted-uncertain',explanation:'The failed transaction used its entire gas limit. This can mean out of gas or another exceptional halt; the receipt alone does not prove which.',fix:'Inspect a trace if available and estimate gas. Do not retry blindly.'};
 return {type:'unknown',explanation:'The transaction failed, but the available data does not identify the cause.',fix:'Obtain a transaction trace or contact the dApp with the transaction link.'};
}
export function diagnoseTrace(trace){
 const t=trace.data;
 if(!t||t.status!==0||!t.error)return null;
 if(t.error==='insufficient_balance')return {type:'insufficient-native-balance',explanation:'PharosScan reports that the sender did not have enough native coin for this transfer.',fix:'Check the PROS balance and reduce the transfer amount, leaving enough for fees.'};
 if(t.error==='execute_revert')return {...classifyFailure(`execution reverted ${t.output??''}`),providerType:t.error,revertData:t.output};
 if(/out.?of.?gas/i.test(t.error))return classifyFailure('out of gas');
 if(t.error==='execute_failure')return {type:'execution-failure-unresolved',providerType:t.error,explanation:'PharosScan reports an execution failure and all supplied gas was used. The provider does not identify the exact cause.',fix:'Request a full VM trace from the dApp developer. Estimate gas before retrying; increasing gas alone may not fix the underlying error.'};
 return null;
}
export async function diagnose(call,hash,fetcher=fetch){
 if(!/^0x[0-9a-f]{64}$/i.test(hash))throw new Error('Expected a 32-byte transaction hash');
 const tx=await call('get_transaction',{hash});const receipt=await call('get_transaction_receipt',{hash});
 if(!tx)return {hash,status:'not-found',explanation:'No transaction was found on this network.'};
 if(!receipt)return {hash,status:'pending',explanation:'No receipt is available yet.'};
 if(Number(receipt.status)!==0)return {hash,status:'success',explanation:'This transaction succeeded; no failure diagnosis is needed.'};
 let message='Replay returned successfully; historical failure cause is unresolved.',replaySucceeded=true;
 try{await call('eth_call',{transaction:{from:tx.from,to:tx.to,data:tx.input,value:tx.value,gas:tx.gas},block:Number(receipt.blockNumber)-1});}catch(error){message=error.message;replaySucceeded=false;}
 const source=`https://api.socialscan.io/pharos-mainnet/v1/explorer/transaction/${hash}/traces`;let traceEvidence,traceDiagnosis;
 try{const response=await fetcher(source,{signal:AbortSignal.timeout(15000)});if(!response.ok)throw new Error(`HTTP ${response.status}`);const trace=await response.json();if(trace.data?.from_address?.toLowerCase()!==tx.from.toLowerCase()||trace.data?.to_address?.toLowerCase()!==tx.to?.toLowerCase())throw new Error('Trace sender/recipient mismatch');traceEvidence={source,trace,capturedAt:new Date().toISOString()};traceDiagnosis=diagnoseTrace(trace);}catch(error){traceEvidence={source,error:error.message};}
 return {hash,status:'failed',network:'Pharos Pacific Mainnet',transaction:tx,receipt,replay:{block:Number(receipt.blockNumber)-1,succeeded:replaySucceeded,message},traceEvidence,diagnosis:traceDiagnosis??classifyFailure(message,tx,receipt),confidence:traceDiagnosis?'Failure confirmed by Chain MCP receipt; original reason or category comes from third-party PharosScan trace. Contract-specific error code meanings require verified source.':'Receipt confirms failure. Replay uses the previous block, not exact transaction pre-state; its reason is a diagnostic hint.',explorer:`https://pharosscan.xyz/tx/${hash}`,capturedAt:new Date().toISOString()};
}
