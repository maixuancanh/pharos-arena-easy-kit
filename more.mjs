import {parseArgs} from 'node:util';
import {writeFileSync,existsSync,readFileSync,mkdirSync,renameSync,openSync,closeSync,unlinkSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {setTimeout as sleep} from 'node:timers/promises';
import {connect,CHAIN_MCP} from './src/mcp.mjs';
import {readToken,chainInfo,DEFAULT_TOKEN} from './src/read.mjs';
import {newState,scanRange} from './src/monitor.mjs';
import {thresholdRaw,deliverOnce,deliveryStore} from './src/alerts.mjs';
import {diagnose} from './src/support.mjs';
const {positionals,values}=parseArgs({allowPositionals:true,options:{threshold:{type:'string',default:'1000'},topic:{type:'string'},from:{type:'string'},polls:{type:'string',default:'3'},interval:{type:'string',default:'5000'},state:{type:'string',default:'.state/alert.json'},output:{type:'string'},evidence:{type:'string'},address:{type:'string',default:DEFAULT_TOKEN}}});
const save=(p,x)=>{mkdirSync(dirname(p),{recursive:true});writeFileSync(p,JSON.stringify(x,null,2)+'\n');};
let c,lock,fd;
try{
 const mode=positionals[0];if(!['alert','support'].includes(mode))throw new Error('Usage: node more.mjs support TXHASH | alert --topic TOPIC --threshold 1000 [--polls 3]');
 if(mode==='alert'&&!/^[a-zA-Z0-9_-]{10,100}$/.test(values.topic??''))throw new Error('Supply an isolated ntfy topic, 10-100 safe characters');
 c=await connect(CHAIN_MCP,values.evidence);const call=c.call.bind(c);
 if(mode==='support'){const output=await diagnose(call,positionals[1]);if(values.output)save(values.output,output);console.log(JSON.stringify(output,null,2));}
 else{
  const polls=Number(values.polls),interval=Number(values.interval);if(!Number.isSafeInteger(polls)||polls<1||!Number.isSafeInteger(interval)||interval<2000)throw new Error('Invalid polling configuration');
  const token=await readToken(call,values.address);const threshold=thresholdRaw(values.threshold,token.decimals);
  const file=resolve(values.state);mkdirSync(dirname(file),{recursive:true});lock=file+'.lock';fd=openSync(lock,'wx');
  const identity=JSON.stringify({chainId:1672,address:token.contract,threshold:threshold.toString(),topic:values.topic});
  const store=deliveryStore(file+'.deliveries.json',identity);
  const state=existsSync(file)?JSON.parse(readFileSync(file,'utf8')):newState(token.contract,values.from===undefined?token.block-100:Number(values.from));
  if(state.contract!==token.contract||state.chainId!==1672)throw new Error('Cursor does not match contract or network');
  const results=[];
  for(let i=0;i<polls;i++){
   const {block}=await chainInfo(call);await scanRange(call,state,block-3,token.decimals,async event=>{const result=await deliverOnce(event,{store,threshold,symbol:token.symbol,topic:values.topic});results.push(result);console.log(JSON.stringify(result));},next=>{save(file+'.tmp',next);renameSync(file+'.tmp',file);});
   console.log(JSON.stringify({kind:'poll',poll:i+1,head:block,nextBlock:state.nextBlock}));if(i+1<polls)await sleep(interval);
  }
  if(values.output)save(values.output,{configuration:{threshold:values.threshold,symbol:token.symbol,contract:token.contract,topic:values.topic},results,state,capturedAt:new Date().toISOString()});
 }
}catch(error){console.error(error.message);process.exitCode=1;}finally{if(fd!==undefined){closeSync(fd);unlinkSync(lock);}if(c)await c.close();}
