import {parseUnits,formatUnits} from 'ethers';
import {existsSync,readFileSync,writeFileSync,renameSync,mkdirSync} from 'node:fs';
import {dirname} from 'node:path';
export function thresholdRaw(value,decimals){if(!/^\d+(\.\d+)?$/.test(value))throw new Error('Threshold must be a nonnegative decimal');return parseUnits(value,decimals);}
export function alertMessage(event,symbol,threshold){return `${event.amount} ${symbol} transferred (threshold >= ${threshold} ${symbol}).\nFrom: ${event.from}\nTo: ${event.to}\nBlock: ${event.block}\n${event.explorer}`;}
export function deliveryStore(path,identity){
 const state=existsSync(path)?JSON.parse(readFileSync(path,'utf8')):{identity,delivered:{}};
 if(state.identity!==identity||!state.delivered||typeof state.delivered!=='object')throw new Error('Alert delivery state does not match this configuration');
 return {state,save(){mkdirSync(dirname(path),{recursive:true});writeFileSync(path+'.tmp',JSON.stringify(state,null,2));renameSync(path+'.tmp',path);}};
}
export async function deliverOnce(event,{store,threshold,symbol,topic,decimals=6,fetcher=fetch}){
 if(BigInt(event.amountRaw)<threshold)return {status:'below-threshold',id:event.id};
 if(Object.hasOwn(store.state.delivered,event.id))return {status:'duplicate-suppressed',id:event.id};
 const message=alertMessage(event,symbol,formatUnits(threshold,decimals));
 const response=await fetcher(`https://ntfy.sh/${topic}`,{method:'POST',headers:{Title:`Pharos ${symbol} transfer alert`,Click:event.explorer},body:message,signal:AbortSignal.timeout(20000)});
 if(!response.ok)throw new Error(`Notification delivery failed: HTTP ${response.status}`);
 const receipt=await response.json();if(!receipt.id||receipt.event!=='message')throw new Error('Invalid notification receipt');
 store.state.delivered[event.id]=receipt.id;store.save();
 return {status:'delivered',event,message,notification:receipt,capturedAt:new Date().toISOString()};
}
