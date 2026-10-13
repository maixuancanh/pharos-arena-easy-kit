#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { mkdirSync, readFileSync, writeFileSync, renameSync, existsSync, openSync, closeSync, unlinkSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { connect, CHAIN_MCP, DOCS_MCP } from './src/mcp.mjs';
import { readToken, chainInfo, DEFAULT_TOKEN } from './src/read.mjs';
import { newState, scanRange, TRANSFER_TOPIC } from './src/monitor.mjs';
import { askDocs } from './src/docs.mjs';

const {values,positionals}=parseArgs({allowPositionals:true,options:{
  address:{type:'string',default:DEFAULT_TOKEN},evidence:{type:'string'},output:{type:'string'},
  state:{type:'string'},from:{type:'string'},polls:{type:'string'},interval:{type:'string',default:'5000'},
  confirmations:{type:'string',default:'3'},help:{type:'boolean',short:'h'}
}});
function integer(name,value,min=0) {
  const n=Number(value); if(!Number.isSafeInteger(n)||n<min) throw new Error(`${name} must be an integer >= ${min}`); return n;
}
function save(file,value) { mkdirSync(dirname(file),{recursive:true}); writeFileSync(file,JSON.stringify(value,null,2)+'\n'); }
const command=positionals[0];
let connection,lockPath,lockFd;
try {
  if(values.help||!command) {
    console.log('Pharos Arena Easy Kit\n\nnode cli.mjs read [--address 0x...] [--output file.json]\nnode cli.mjs monitor [--address 0x...] [--from BLOCK] [--polls N] [--interval 5000] [--state file.json]\nnode cli.mjs docs "How do I deploy a contract on Pharos?"\nnode cli.mjs discover\n\nAll commands accept --evidence path.jsonl. Monitor runs continuously unless --polls is supplied. Ctrl+C stops it.');
  } else {
    if(!['read','monitor','docs','discover'].includes(command)) throw new Error('Unknown command; use --help');
    if(command==='docs'&&!positionals.slice(1).join(' ').trim()) throw new Error('A natural-language question is required');
    connection=await connect(command==='docs'?DOCS_MCP:CHAIN_MCP,values.evidence);
    const call=connection.call.bind(connection);
    const print=value=>{console.log(JSON.stringify(value,null,2));if(values.output)save(values.output,value);};
    if(command==='discover') print(await connection.list());
    if(command==='read') print(await readToken(call,values.address));
    if(command==='docs') print(await askDocs(connection.raw.bind(connection),positionals.slice(1).join(' ')));
    if(command==='monitor') {
      const interval=integer('interval',values.interval,2000),confirmations=integer('confirmations',values.confirmations);
      const polls=values.polls===undefined?Infinity:integer('polls',values.polls,1);
      const token=await readToken(call,values.address);
      const start=values.from===undefined?Math.max(0,token.block-confirmations-100):integer('from',values.from);
      const file=resolve(values.state??`.state/${token.contract}.json`);
      mkdirSync(dirname(file),{recursive:true});
      lockPath=file+'.lock'; lockFd=openSync(lockPath,'wx');
      let state=existsSync(file)?JSON.parse(readFileSync(file,'utf8')):newState(token.contract,start);
      if(state.version!==1||state.chainId!==1672||state.contract!==token.contract||state.topic!==TRANSFER_TOPIC||!Number.isSafeInteger(state.nextBlock)||state.nextBlock<0||!Array.isArray(state.seen)) throw new Error('Checkpoint does not match this network/contract or is malformed');
      if(existsSync(file)&&values.from!==undefined) throw new Error('--from is only allowed with a new checkpoint path');
      const events=[];let running=true,failures=0;
      process.once('SIGINT',()=>{running=false;});
      const checkpoint=next=>{save(file+'.tmp',next);renameSync(file+'.tmp',file);};
      console.log(JSON.stringify({kind:'monitor-start',network:token.network,chainId:1672,contract:token.contract,symbol:token.symbol,decimals:token.decimals,headAtStart:token.block,nextBlock:state.nextBlock,confirmations,pollIntervalMs:interval,capturedAt:new Date().toISOString()}));
      for(let poll=0;running&&poll<polls;poll++) {
        try {
          const {block}=await chainInfo(call),end=Math.max(0,block-confirmations);
          await scanRange(call,state,end,token.decimals,event=>{
            const output={...event,symbol:token.symbol,observedAt:new Date().toISOString(),observedAfterStart:event.block>token.block};
            console.log(JSON.stringify(output)); if(values.output)events.push(output);
          },checkpoint);
          console.log(JSON.stringify({kind:'poll',poll:poll+1,head:block,nextBlock:state.nextBlock,capturedAt:new Date().toISOString()}));
          failures=0;
        } catch(error) { console.error(`Poll failed without advancing the failed range: ${error.message}`); if(++failures>=3) throw error; }
        if(running&&poll+1<polls) await sleep(interval);
      }
      if(failures) throw new Error('Monitor ended with an unresolved polling error');
      if(values.output)save(values.output,{contract:token.contract,symbol:token.symbol,events,state,capturedAt:new Date().toISOString()});
    }
  }
} catch(error) { console.error(`Error: ${error.message}`);process.exitCode=1; }
finally { if(lockFd!==undefined){closeSync(lockFd);unlinkSync(lockPath);} if(connection)await connection.close(); }
