import { Interface, getAddress, formatUnits } from 'ethers';

export const DEFAULT_TOKEN='0xc879c018db60520f4355c26ed1a6d572cdac1815';
export const TOKEN_ABI=new Interface([
  'function name() view returns(string)',
  'function symbol() view returns(string)',
  'function decimals() view returns(uint8)',
  'function totalSupply() view returns(uint256)'
]);
export async function chainInfo(call) {
  const info=await call('get_chain_info');
  if(Number(info.chainId)!==1672) throw new Error('Expected Pharos Pacific mainnet chain ID 1672');
  const block=Number(info.latestBlock);
  if(!Number.isSafeInteger(block)||block<0) throw new Error('Invalid latest block');
  return {info,block};
}
export async function readToken(call,address=DEFAULT_TOKEN) {
  const contract=getAddress(address).toLowerCase();
  const {block}=await chainInfo(call);
  const blockTag='0x'+block.toString(16);
  const codeResult=await call('get_code',{address:contract,block:blockTag});
  const code=typeof codeResult==='string'?codeResult:codeResult?.code;
  if(typeof code!=='string'||!/^0x[0-9a-f]+$/i.test(code)) throw new Error('Address has no deployed contract at this block');
  const values={};
  for(const name of ['name','symbol','decimals','totalSupply']) {
    const raw=await call('eth_call',{transaction:{to:contract,data:TOKEN_ABI.encodeFunctionData(name)},block:blockTag});
    values[name]=TOKEN_ABI.decodeFunctionResult(name,raw)[0];
  }
  return {
    network:'Pharos Pacific Mainnet',chainId:1672,contract,block,blockTag,
    name:values.name,symbol:values.symbol,decimals:Number(values.decimals),
    totalSupply:formatUnits(values.totalSupply,values.decimals),
    totalSupplyRaw:values.totalSupply.toString(),
    explanation:`${values.name} (${values.symbol}) has a total supply of ${formatUnits(values.totalSupply,values.decimals)} ${values.symbol} at block ${block}.`,
    explorer:`https://pharosscan.xyz/address/${contract}`,
    capturedAt:new Date().toISOString()
  };
}
