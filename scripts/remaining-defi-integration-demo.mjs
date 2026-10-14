import {writeFileSync} from 'node:fs';
import {runDefiLab} from '../src/remaining/defi-lab.mjs';
const output=await runDefiLab({onAlert:alert=>console.log(`[${alert.timestamp}] ${alert.level.toUpperCase()}: ${alert.message}`)});
writeFileSync('evidence/remaining/defi/integration-evm.json',JSON.stringify(output,null,2)+'\n');
console.log('Two funded local vaults: unsigned deposit/withdraw preflight, receipt-verified execution by lab harness, outage and allowance rejection. Lending: healthy -> warning -> critical -> repaid -> healthy. Chain 31337 only.');
