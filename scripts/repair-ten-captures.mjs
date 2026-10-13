import {spawn} from 'node:child_process';
import {existsSync,copyFileSync,writeFileSync} from 'node:fs';
import {formatUnits} from 'ethers';
import {connect,CHAIN_MCP} from '../src/mcp.mjs';
import {chainInfo,DEFAULT_TOKEN} from '../src/read.mjs';
import {newState,scanRange} from '../src/monitor.mjs';
import {contractView} from '../src/ten/chain.mjs';
import {save} from '../src/ten/jobs.mjs';
const root='evidence/ten';
async function run(name,args){if(existsSync(`${root}/${name}.json`)&&!existsSync(`${root}/${name}-initial.json`))copyFileSync(`${root}/${name}.json`,`${root}/${name}-initial.json`);console.log('RECHECK',name);const p=spawn(process.execPath,['ten.mjs',...args,'--output',`${root}/${name}.json`,'--evidence',`${root}/${name}-recheck-mcp.jsonl`],{stdio:['ignore','pipe','pipe']});let output='';p.stdout.on('data',d=>output+=d);p.stderr.on('data',d=>output+=d);const code=await new Promise(r=>p.on('exit',r));writeFileSync(`${root}/${name}-recheck-console.txt`,output);if(code)throw new Error(output);}
const c=await connect(CHAIN_MCP,`${root}/repair-setup-mcp.jsonl`);let from;try{
 const {block}=await chainInfo(c.call.bind(c));const events=[];await scanRange(c.call.bind(c),newState(DEFAULT_TOKEN,block-999),block-3,6,e=>events.push(e));const ranked=events.filter(e=>BigInt(e.amountRaw)>0n).sort((a,b)=>BigInt(a.amountRaw)>BigInt(b.amountRaw)?-1:1);const watched=new Set();let threshold;
 for(const e of ranked){for(const a of [e.from,e.to])if(a!=='0x'+'0'.repeat(40)&&watched.size<5)watched.add(a.toLowerCase());threshold=e.amountRaw;if(watched.size===5)break;}
 if(watched.size<5)throw new Error('Need five live watched addresses');save('configs/ten/whale.json',{addresses:[...watched],fromBlock:block-999,tokens:[{address:DEFAULT_TOKEN,symbol:'USDC',threshold:formatUnits(threshold,6)}],labels:{[DEFAULT_TOKEN]:'USDC (official registry)'}});
 const candidates=[...new Set(['0xf3503da2961ff5118adaa2c4ff8d9a6fb28a411f',...ranked.flatMap(e=>[e.from.toLowerCase(),e.to.toLowerCase()])])].filter(a=>a!=='0x'+'0'.repeat(40));
 for(const a of candidates.slice(0,20)){const code=await c.call('get_code',{address:a});if((typeof code==='string'?code:code.code)!=='0x')continue;const balance=await contractView(c.call.bind(c),{func:'balanceOf',args:[a]});const native=await c.call('get_balance',{address:a});if(BigInt(balance.value)>1n&&BigInt(native.balanceWei)>1000000000000000n){from=a;break;}}
 if(!from)throw new Error('No funded public EOA available for a successful read-only transfer simulation');save('configs/ten/dry-run.json',{from,to:'0x200a5eb1477503cfc6e64fd8116c1bb967ba22c1',contract:DEFAULT_TOKEN,amount:'1'});
}finally{await c.close();}
await run('whale',['whale','--config','configs/ten/whale.json']);
const until=new Date().toISOString();
for(const [key,wallet,max] of [['risk-clean',DEFAULT_TOKEN,'2'],['risk-observed','0x869379f2d9df67891e0159dd2520dc1681908f10','3']])await run(key,['risk','--wallet',wallet,'--since','2026-10-01T00:00:00Z','--until',until,'--max-pages',max,'--config','configs/ten/risk.json']);
await run('dry-run-success',['dry-run','--config','configs/ten/dry-run.json']);
console.log('Live boundary recaptures completed; public sender',from,'is used only for simulation, not claimed as owned.');
