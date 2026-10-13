import { Interface, id, formatUnits, getAddress } from 'ethers';
export const TRANSFER_TOPIC=id('Transfer(address,address,uint256)');
const abi=new Interface(['event Transfer(address indexed from,address indexed to,uint256 value)']);
export function newState(address,start) {
  if(!Number.isSafeInteger(start)||start<0) throw new Error('Invalid start block');
  return {version:1,chainId:1672,contract:getAddress(address).toLowerCase(),topic:TRANSFER_TOPIC,nextBlock:start,seen:[]};
}
export async function scanRange(call,state,end,decimals,emit,checkpoint=()=>{}) {
  if(!Number.isSafeInteger(end)||end<0) throw new Error('Invalid end block');
  while(state.nextBlock<=end) {
    const from=state.nextBlock,to=Math.min(from+999,end);
    const logs=await call('get_logs',{address:state.contract,topics:[TRANSFER_TOPIC],fromBlock:from,toBlock:to});
    if(!Array.isArray(logs)) throw new Error('Expected array from get_logs');
    // Validate and decode the whole batch before emitting or moving the cursor.
    const decoded=logs.map(log=>{
      if(log.removed) throw new Error('Removed log returned; refusing to advance cursor');
      if(log.address?.toLowerCase()!==state.contract||log.topics?.[0]!==TRANSFER_TOPIC) throw new Error('Log violates contract/event filter');
      const block=Number(log.blockNumber);
      if(!Number.isSafeInteger(block)||block<from||block>to) throw new Error('Log outside requested block range');
      if(!/^0x[0-9a-f]{64}$/i.test(log.transactionHash??'')||!/^0x[0-9a-f]+$/i.test(log.logIndex??'')) throw new Error('Invalid log identity');
      const event=abi.decodeEventLog('Transfer',log.data,log.topics);
      return {kind:'Transfer',id:`${log.transactionHash.toLowerCase()}:${BigInt(log.logIndex)}`,
        contract:state.contract,from:event.from,to:event.to,amount:formatUnits(event.value,decimals),
        amountRaw:event.value.toString(),transactionHash:log.transactionHash,block,logIndex:Number(log.logIndex),
        explorer:`https://pharosscan.xyz/tx/${log.transactionHash}`};
    }).sort((a,b)=>a.block-b.block||a.logIndex-b.logIndex);
    const seen=new Set(state.seen);
    for(const event of decoded) if(!seen.has(event.id)) { await emit(event); seen.add(event.id); }
    const next={...state,nextBlock:to+1,seen:[...seen].slice(-4096)};
    await checkpoint(next);
    Object.assign(state,next);
  }
  return state;
}
