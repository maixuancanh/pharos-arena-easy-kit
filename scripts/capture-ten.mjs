import {spawn} from 'node:child_process';
import {writeFileSync,mkdirSync} from 'node:fs';
import {connect,CHAIN_MCP} from '../src/mcp.mjs';
import {chainInfo,DEFAULT_TOKEN} from '../src/read.mjs';
import {newState,scanRange} from '../src/monitor.mjs';
import {save} from '../src/ten/jobs.mjs';
const root='evidence/ten';mkdirSync(root,{recursive:true});const wallet='0x200a5eb1477503cfc6e64fd8116c1bb967ba22c1';
const since='2026-10-01T00:00:00Z',until=new Date().toISOString();
async function run(name,args){console.log('RUN',name);const p=spawn(process.execPath,['ten.mjs',...args,'--output',`${root}/${name}.json`,'--evidence',`${root}/${name}-mcp.jsonl`],{stdio:['ignore','pipe','pipe']});let out='',err='';p.stdout.on('data',d=>out+=d);p.stderr.on('data',d=>err+=d);const code=await new Promise(r=>p.on('exit',r));writeFileSync(`${root}/${name}-console.txt`,out+err);if(code!==0)throw new Error(`${name}: ${err}`);console.log('OK',name);}
const start=process.argv[2]??'all';
if(['all','compose'].includes(start))for(const f of ['totalSupply','decimals'])await run('compose-'+f,['compose',`How do I read ERC20 ${f} on Pharos?`,'--wallet',wallet,'--docs-evidence',`${root}/compose-${f}-docs-mcp.jsonl`]);
if(['all','reports'].includes(start)){
 await run('audit',['audit','--wallet',wallet,'--since',since,'--until',until]);
 const c=await connect(CHAIN_MCP,`${root}/whale-setup-mcp.jsonl`);try{const {block}=await chainInfo(c.call.bind(c));const state=newState(DEFAULT_TOKEN,block-999),events=[];await scanRange(c.call.bind(c),state,block-3,6,e=>events.push(e));const addresses=[...new Set(events.flatMap(e=>[e.from.toLowerCase(),e.to.toLowerCase()]).filter(a=>a!=='0x'+'0'.repeat(40)))].slice(0,5);if(addresses.length<5)throw new Error('Not enough public addresses in live log range');save('configs/ten/whale.json',{addresses,fromBlock:block-999,tokens:[{address:DEFAULT_TOKEN,symbol:'USDC',threshold:'1000'}],labels:{[DEFAULT_TOKEN]:'USDC contract (official registry)'}});}finally{await c.close();}
 await run('whale',['whale','--config','configs/ten/whale.json']);
 await run('risk-clean',['risk','--wallet',DEFAULT_TOKEN,'--since',since,'--until',until,'--max-pages','2','--config','configs/ten/risk.json']);
 await run('risk-observed',['risk','--wallet','0x869379f2d9df67891e0159dd2520dc1681908f10','--since',since,'--until',until,'--max-pages','3','--config','configs/ten/risk.json']);
 await run('digest',['digest','--wallet',wallet,'--schedule','--interval-seconds','2','--runs','2','--period-days','7','--html','digest-latest.html']);
}
if(['all','skills'].includes(start)){
 for(const [name,command,config] of [['policy-allow','policy','policy'],['policy-spend-deny','policy','policy-spend-deny'],['policy-address-deny','policy','policy-address-deny'],['policy-time-deny','policy','policy-time-deny'],['guardian-fire','guardian','guardian'],['guardian-hold','guardian','guardian-hold'],['dry-run-success','dry-run','dry-run'],['dry-run-revert','dry-run','dry-run-revert'],['flow','flow','flow']])await run(name,[command,'--config',`configs/ten/${config}.json`]);
}
if(['all','builder'].includes(start))for(const [name,request] of [['builder-supply','How do I read the USDC total supply on Pharos?'],['builder-decimals','How do I read USDC decimals on Pharos?'],['builder-native','How do I read my native PROS balance on Pharos?'],['builder-unsupported','How do I grow bananas on Mars using the Pharos blockchain?']])await run(name,['builder',request,'--wallet',wallet,'--docs-evidence',`${root}/${name}-docs-mcp.jsonl`]);
console.log('Requested capture group completed');
