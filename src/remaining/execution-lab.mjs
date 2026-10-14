import ganache from 'ganache';
import solc from 'solc';
import {BrowserProvider,ContractFactory} from 'ethers';
import {readFileSync} from 'node:fs';
export async function createLab(){
 const source=readFileSync(new URL('../../contracts/remaining/ExecutionLab.sol',import.meta.url),'utf8');
 const compiled=JSON.parse(solc.compile(JSON.stringify({language:'Solidity',sources:{'ExecutionLab.sol':{content:source}},settings:{evmVersion:'shanghai',optimizer:{enabled:true,runs:200},outputSelection:{'*':{'*':['abi','evm.bytecode.object']}}}})));
 const errors=compiled.errors?.filter(x=>x.severity==='error');if(errors?.length)throw Error(errors.map(x=>x.formattedMessage).join('\n'));
 const rpc=ganache.provider({logging:{quiet:true},chain:{chainId:31337,hardfork:'shanghai'},wallet:{totalAccounts:2},miner:{defaultGasPrice:2000000000}});
 const provider=new BrowserProvider(rpc);provider.pollingInterval=20;const signer=await provider.getSigner();
 async function deploy(name){const a=compiled.contracts['ExecutionLab.sol'][name];const c=await new ContractFactory(a.abi,a.evm.bytecode.object,signer).deploy();await c.waitForDeployment();return c;}
 return {rpc,provider,signer,deploy,close:async()=>{await provider.destroy();await rpc.disconnect();}};
}
// Ethers rejects wait() for a mined revert. Expose the real receipt to the saga.
export function normalizeTx(tx){return {hash:tx.hash,wait:async()=>{try{return await tx.wait();}catch(e){if(e.receipt)return e.receipt;throw e;}}};}
