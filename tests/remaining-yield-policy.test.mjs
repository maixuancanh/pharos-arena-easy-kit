import test from 'node:test';import assert from 'node:assert/strict';
import {optimizeWithCostPolicy} from '../src/remaining/yield-policy.mjs';
const snapshot={chainId:1672,block:10,vaults:['a','b','c'].map((id,i)=>({id,status:'ok',asset:'USDC',apy:[.03,.15,.04][i]}))};
const policy={kind:'user-supplied-budget',asset:'USDC',gasBudget:5,fees:Object.fromEntries(['a','b','c'].map(id=>[id,{entryFee:.005,exitFee:.005,source:'configured cost ceiling, not protocol measurement'}]))};
const options={current:'a',principal:10000,days:90,minDays:30};
test('conditional yield recommendation states cost bounds and maximum affordable gas',()=>{const r=optimizeWithCostPolicy(snapshot,policy,options);assert.equal(r.decision,'recommend');assert.equal(r.conditional,true);assert.ok(r.breakEvenGasCost>policy.gasBudget);assert.equal(r.venue,'b');assert.ok(r.conditions.length>=3);});
test('unknown fees or gas never become unconditional recommendation',()=>{assert.equal(optimizeWithCostPolicy(snapshot,{...policy,gasBudget:null},options).decision,'unknown');assert.equal(optimizeWithCostPolicy(snapshot,{...policy,fees:{}},options).decision,'unknown');assert.equal(optimizeWithCostPolicy(snapshot,policy,{...options,days:7}).decision,'stay put');assert.equal(optimizeWithCostPolicy(snapshot,{...policy,gasBudget:10000},options).decision,'stay put');});
