#!/usr/bin/env node
import {parseArgs} from 'node:util';
import {readFileSync,appendFileSync,mkdirSync} from 'node:fs';
import {dirname} from 'node:path';
import {setTimeout as sleep} from 'node:timers/promises';
import {connect,CHAIN_MCP,DOCS_MCP} from './src/mcp.mjs';
import {audit,auditMarkdown,auditCSV,risk,policyRun,guardianRun,flowRun,dryRun,whaleScan,digest,digestHTML,save} from './src/ten/jobs.mjs';
import {groundedRequest} from './src/ten/docs-agent.mjs';
const {positionals,values:v}=parseArgs({allowPositionals:true,options:{wallet:{type:'string'},since:{type:'string'},until:{type:'string'},config:{type:'string'},output:{type:'string'},evidence:{type:'string'},'docs-evidence':{type:'string'},'max-pages':{type:'string',default:'20'},'period-days':{type:'string',default:'7'},schedule:{type:'boolean'},'interval-seconds':{type:'string',default:'604800'},runs:{type:'string'},html:{type:'string'}}});
let chain,docs;
try{
 const command=positionals[0];if(!['compose','audit','whale','risk','digest','policy','guardian','dry-run','flow','builder'].includes(command))throw new Error('Commands: compose, audit, whale, risk, digest, policy, guardian, dry-run, flow, builder');
 const config=v.config?JSON.parse(readFileSync(v.config,'utf8')):{};const common={wallet:v.wallet??config.wallet,since:v.since??config.since,until:v.until??config.until,evidence:v.evidence,maxPages:Number(v['max-pages'])};
 if(!['audit','digest'].includes(command))chain=await connect(CHAIN_MCP,v.evidence);
 if(['compose','builder'].includes(command))docs=await connect(DOCS_MCP,v['docs-evidence']);
 let result;
 if(['compose','builder'].includes(command))result=await groundedRequest(docs,chain,positionals.slice(1).join(' '),{...config,wallet:common.wallet});
 if(command==='audit')result=await audit(common);
 if(command==='whale')result=await whaleScan(chain.call.bind(chain),config);
 if(command==='risk')result=await risk({...common,chain,flagged:config.flagged??[]});
 if(command==='policy')result=await policyRun(chain,config,(v.output??'policy-output.json')+'.audit.jsonl');
 if(command==='guardian')result=await guardianRun(chain,config);
 if(command==='dry-run')result=await dryRun(chain,config);
 if(command==='flow')result=await flowRun(chain,config);
 if(command==='digest'){
  const interval=Number(v['interval-seconds'])*1000,runs=v.runs===undefined?(v.schedule?Infinity:1):Number(v.runs);if(!Number.isFinite(interval)||interval<1000||runs!==Infinity&&(!Number.isSafeInteger(runs)||runs<1))throw new Error('Invalid schedule');const output=v.output??'evidence/ten/digest-latest.json',log=output+'.schedule.jsonl';let due=Date.now();
  for(let i=0;i<runs;i++){
   if(Date.now()<due)await sleep(due-Date.now());const startedAt=new Date().toISOString();result=await digest({...common,until:v.until??new Date().toISOString(),periodDays:Number(v['period-days'])});save(output,result);save(v.html??'digest-latest.html',digestHTML(result));due=Date.now()+interval;const tick={run:i+1,startedAt,completedAt:new Date().toISOString(),nextDueAt:new Date(due).toISOString(),intervalSeconds:interval/1000,html:v.html??'digest-latest.html'};mkdirSync(dirname(log),{recursive:true});appendFileSync(log,JSON.stringify(tick)+'\n');console.log(JSON.stringify(tick));if(!v.schedule)break;
  }
 }else{if(v.output)save(v.output,result);if(command==='audit'&&v.output){save(v.output+'.md',auditMarkdown(result));save(v.output+'.csv',auditCSV(result));}}
 console.log(JSON.stringify(result,null,2));
}catch(error){console.error(`Error: ${error.message}`);process.exitCode=1;}finally{if(docs)await docs.close();if(chain)await chain.close();}
