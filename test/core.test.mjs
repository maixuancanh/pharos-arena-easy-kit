import test from 'node:test';
import assert from 'node:assert/strict';
import { Interface } from 'ethers';
import { readToken } from '../src/read.mjs';
import { scanRange, TRANSFER_TOPIC, newState } from '../src/monitor.mjs';
import { normalizeDocs } from '../src/docs.mjs';
import { unwrapTool } from '../src/mcp.mjs';

const address = '0xc879c018db60520f4355c26ed1a6d572cdac1815';
const abi = new Interface(['function name() view returns(string)', 'function symbol() view returns(string)', 'function decimals() view returns(uint8)', 'function totalSupply() view returns(uint256)', 'event Transfer(address indexed from,address indexed to,uint256 value)']);
test('read pins all four values to one block and preserves large token amounts', async () => {
  const calls = [];
  const values = { name: 'USD Coin', symbol: 'USDC', decimals: 6, totalSupply: 123456789123456789123456n };
  const call = async (name, args) => {
    if (name === 'get_chain_info') return {chainId:1672,latestBlock:'1234'};
    if (name === 'get_code') return {code:'0x1234'};
    assert.equal(name,'eth_call'); calls.push(args);
    const fn = abi.getFunction(args.transaction.data).name;
    return abi.encodeFunctionResult(fn,[values[fn]]);
  };
  const output = await readToken(call,address);
  assert.equal(output.totalSupply,'123456789123456789.123456');
  assert.equal(output.block,1234);
  assert.equal(calls.length,4);
  assert.ok(calls.every(c => c.block === '0x4d2'));
});
test('wrong network fails before any contract read', async () => {
  await assert.rejects(() => readToken(async()=>({chainId:688688,latestBlock:'1'}),address),/1672/);
});
test('real Chain MCP get_code wrapper rejects an address with no contract', async()=>{
  const call=async name=>{
    if(name==='get_chain_info')return {chainId:1672,latestBlock:'1234'};
    if(name==='get_code')return {code:'0x'};
    throw new Error('should not call contract');
  };
  await assert.rejects(()=>readToken(call,address),/no deployed contract/);
});
const from='0x1111111111111111111111111111111111111111';
const to='0x2222222222222222222222222222222222222222';
const encoded = abi.encodeEventLog(abi.getEvent('Transfer'),[from,to,1234567n]);
const log={address, ...encoded, blockNumber:'0xa',transactionHash:'0x'+'a'.repeat(64),logIndex:'0x0',blockHash:'0x'+'b'.repeat(64)};
test('monitor filters exact contract and event, decodes and deduplicates overlap',async()=>{
  const state=newState(address,10);
  const events=[];
  const call=async(name,args)=>{
    assert.equal(name,'get_logs'); assert.equal(args.address,address);
    assert.deepEqual(args.topics,[TRANSFER_TOPIC]); return [log,log];
  };
  await scanRange(call,state,10,6,e=>events.push(e));
  await scanRange(call,state,10,6,e=>events.push(e));
  assert.equal(events.length,1); assert.equal(events[0].amount,'1.234567');
  assert.equal(events[0].from,from); assert.equal(events[0].to,to);
  assert.equal(state.nextBlock,11);
});
test('monitor pages in 1000-block windows and never advances on RPC failure',async()=>{
  const state=newState(address,1),ranges=[];
  await scanRange(async(n,a)=>{ranges.push([Number(a.fromBlock),Number(a.toBlock)]);return [];},state,2001,6,()=>{});
  assert.deepEqual(ranges,[[1,1000],[1001,2000],[2001,2001]]);
  await assert.rejects(()=>scanRange(async()=>{throw Error('offline');},state,2002,6,()=>{}),/offline/);
  assert.equal(state.nextBlock,2002);
});
test('foreign or malformed log cannot silently advance the cursor',async()=>{
  const state=newState(address,10);
  await assert.rejects(()=>scanRange(async()=>[{...log,address:from}],state,10,6,()=>{}),/filter/);
  assert.equal(state.nextBlock,10);
});
test('documentation cannot present an unsourced answer as success',()=>{
  assert.equal(normalizeDocs('hello',{content:[{type:'text',text:'This is an unsupported claim.'}]}).status,'no-answer');
  assert.equal(normalizeDocs('hello',{content:[]}).status,'no-answer');
  const out=normalizeDocs('chain ID',{content:[{type:'text',text:'The chain ID is 1672. [Network](https://docs.pharos.xyz/getting-started/network)'}]});
  assert.equal(out.status,'answered'); assert.equal(out.sources.length,1);
});
test('upstream no-answer remains no-answer even with a generic source URL',()=>{
  assert.equal(normalizeDocs('nonsense',{content:[{type:'text',text:'No relevant information found. https://docs.pharos.xyz/'}]}).status,'no-answer');
});
test('MCP failures are errors and result wrappers are unwrapped without losing zero',()=>{
  assert.throws(()=>unwrapTool({isError:true,content:[{type:'text',text:'RPC failed'}]}),/RPC failed/);
  assert.equal(unwrapTool({content:[{type:'text',text:'{"result":"0x0"}'}]}),'0x0');
});
