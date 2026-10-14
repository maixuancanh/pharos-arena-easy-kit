import {readFileSync,writeFileSync} from 'node:fs';
import {connect,CHAIN_MCP} from '../src/mcp.mjs';
import {readVaults} from '../src/remaining/defi.mjs';
import {optimizeWithCostPolicy} from '../src/remaining/yield-policy.mjs';
const config=JSON.parse(readFileSync('configs/remaining/defi.json'));
const c=await connect(CHAIN_MCP,'evidence/remaining/defi/yield-policy-mcp.jsonl');
try{
 const snapshot=await readVaults(c.call.bind(c),config);const gasQuote=await c.call('get_gas_price');
 const policy={kind:'user-supplied-budget',asset:snapshot.vaults.find(v=>v.status==='ok')?.asset,gasBudget:5,gasBudgetUnit:'underlying USDC',fees:Object.fromEntries(config.vaults.map(v=>[v.id,{entryFee:.005,exitFee:.005,source:'Example configured 0.5% cost allowance; not independently measured investor fees'}]))};
 const options={current:'JTRSY',principal:10000,days:90,minDays:30};
 const output={capturedAt:new Date().toISOString(),snapshot,gasQuote,policy,gasQuoteUsage:'Actual native gas observation for context only. No PROS/USDC exchange rate assumed; the optimizer takes a disclosed total USDC budget.',recommendation:optimizeWithCostPolicy(snapshot,policy,options),shortHold:optimizeWithCostPolicy(snapshot,policy,{...options,days:7}),highCost:optimizeWithCostPolicy(snapshot,{...policy,gasBudget:10000},options),unknownCosts:optimizeWithCostPolicy(snapshot,{...policy,fees:{}},options),scope:'Live Pharos yield reads with conditional cost inputs. This is a recommendation demonstration, not a verified executable investment quote.'};
 writeFileSync('evidence/remaining/defi/yield-policy.json',JSON.stringify(output,null,2)+'\n');
 console.log(JSON.stringify({block:snapshot.block,venues:snapshot.vaults.map(v=>({id:v.id,status:v.status,apy:v.apy})),recommendation:output.recommendation,shortHold:output.shortHold,highCost:output.highCost.decision,unknownCosts:output.unknownCosts.decision},null,2));
}finally{await c.close();}
