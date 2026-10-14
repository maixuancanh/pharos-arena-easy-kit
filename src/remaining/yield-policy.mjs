import {optimizeYield} from './defi.mjs';
export function optimizeWithCostPolicy(snapshot,policy,options){
 const unknown=reason=>({decision:'unknown',reason,conditional:true,executed:false});
 if(!policy||policy.kind!=='user-supplied-budget'||!Number.isFinite(policy.gasBudget)||policy.gasBudget<0)return unknown('Provide an explicit gas budget in the underlying asset. No PROS conversion is guessed.');
 const venues=snapshot.vaults.filter(v=>v.status==='ok');
 if(venues.length<3||venues.some(v=>v.asset?.toLowerCase()!==policy.asset?.toLowerCase()))return unknown('Need three successful same-asset vault reads.');
 if(venues.some(v=>!policy.fees?.[v.id]?.source||!Number.isFinite(policy.fees[v.id].entryFee)||!Number.isFinite(policy.fees[v.id].exitFee)))return unknown('Missing fee amounts or provenance.');
 const sources=venues.map(v=>({...v,...policy.fees[v.id]}));
 const result=optimizeYield(sources,{...options,gasCost:policy.gasBudget});
 const zeroGas=optimizeYield(sources,{...options,gasCost:0});
 return {...result,conditional:true,executed:false,chainId:snapshot.chainId,block:snapshot.block,asset:policy.asset,costPolicy:policy,breakEvenGasCost:zeroGas.expectedNetGain??null,
 conditions:['Historical returns repeat over the stated horizon; future returns can differ.','Configured entry/exit fees apply to this investor and route. Verify offering terms before use.','Total gas in underlying asset stays within the configured budget; budget is not an oracle quote.','Investor eligibility, settlement timing and available capacity are verified before any rebalance.'],
 explanation:result.decision==='recommend'?`Conditional recommendation only: ${result.venue} has positive projected net gain with the supplied fee and gas budgets.`:result.reason};
}
