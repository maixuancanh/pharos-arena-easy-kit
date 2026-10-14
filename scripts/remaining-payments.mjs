import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {dirname} from 'node:path';
import {connect,CHAIN_MCP} from '../src/mcp.mjs';
import {parseIntent,parseInvoice,preparePayment,runSchedule,reconcile,paymentWorker} from '../src/remaining/payments.mjs';
const [command,...args]=process.argv.slice(2);let mcp;
try{
 if(!['intent','invoice','schedule','worker','reconcile'].includes(command))throw Error('Usage: node scripts/remaining-payments.mjs intent CONFIG TEXT OUT | invoice CONFIG INVOICE OUT | schedule CONFIG SCHEDULE STATE OUT [NOW] | reconcile CONFIG STATE OCCURRENCE HASH OUT');
 const config=JSON.parse(readFileSync(args[0],'utf8'));let parsed;
 if(command==='intent')parsed=parseIntent(args[1]);if(command==='invoice')parsed=parseInvoice(readFileSync(args[1],'utf8'));
 const out=['schedule','worker'].includes(command)?args[3]:command==='reconcile'?args[4]:args[2];if(!out)throw Error('Output path required');mkdirSync(dirname(out),{recursive:true});
 let result;if(parsed?.status==='needs-clarification'){result=parsed;}else{
 mcp=await connect(CHAIN_MCP,out+'.mcp.jsonl');const call=(name,input)=>mcp.call(name,input);
 const prepare=p=>preparePayment(call,{from:config.from,...p},config,summary=>console.log('PAYMENT SUMMARY (before unsigned envelope):\n'+summary));
 if(parsed)result=await prepare(parsed.payment);
 else if(command==='worker')result=await paymentWorker(async()=>{const state=await runSchedule(args[2],JSON.parse(readFileSync(args[1],'utf8')),new Date().toISOString(),prepare);writeFileSync(out,JSON.stringify(state,null,2)+'\n');console.log(`${new Date().toISOString()} next due ${state.nextDue}; ${state.history.length} occurrences`);return state;},{pollMs:Number(args[4]??60000),runs:args[5]?Number(args[5]):Infinity});
 else if(command==='schedule')result=await runSchedule(args[2],JSON.parse(readFileSync(args[1],'utf8')),args[4]??new Date().toISOString(),prepare);
 else result=await reconcile(args[1],args[2],args[3],call,config.confirmations??2);
 }
 writeFileSync(out,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
}catch(e){console.error(e.message);process.exitCode=1;}finally{await mcp?.close();}
