import test from 'node:test';
import assert from 'node:assert/strict';
import {runDefiLab} from '../src/remaining/defi-lab.mjs';
test('funded vault actions and lending risk changes are verified by actual local receipts',async()=>{
 const e=await runDefiLab();assert.equal(e.network.chainId,31337);
 assert.deepEqual(e.lending.observations.map(x=>x.alert.level),['healthy','warning','critical','healthy']);
 assert.ok(e.lending.observations.every(x=>x.source.block>0));
 assert.equal(e.aggregator.deposit.decision,'prepare');assert.equal(e.aggregator.deposit.venue,'Vault-B');
 assert.equal(e.aggregator.withdraw.decision,'prepare');assert.equal(e.aggregator.withdraw.venue,'Vault-A');
 assert.equal(e.aggregator.outage.decision,'prepare');assert.equal(e.aggregator.outage.venue,'Vault-A');
 assert.equal(e.aggregator.insufficientAllowance.decision,'blocked');
 assert.ok(e.aggregator.receipts.every(r=>r.status===1));
 assert.equal(e.aggregator.beforePreparationBlock,e.aggregator.afterPreparationBlock);
 assert.equal(e.aggregator.remainingSharesA,'90.0');assert.equal(e.aggregator.remainingSharesB,'125.0');
});
