import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { appendFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

export const CHAIN_MCP = 'https://mcp.pharos.xyz/mcp';
export const DOCS_MCP = 'https://docs.pharos.xyz/~gitbook/mcp';
const allowed = new Set(['get_chain_info','get_block','get_code','eth_call','get_logs','get_transaction','get_balance','estimate_gas','get_transaction_receipt','searchDocumentation','getPage','askQuestion']);

export function unwrapTool(result) {
  const text = (result.content ?? []).filter(c=>c.type==='text').map(c=>c.text).join('\n');
  if (result.isError) throw new Error(`MCP tool failed: ${text}`);
  let value = result.structuredContent;
  if (value === undefined) {
    try { value = JSON.parse(text); } catch { return text; }
  }
  return value && Object.hasOwn(value,'result') ? value.result : value;
}

export async function connect(endpoint, evidence) {
  const client = new Client({name:'pharos-arena-easy-kit',version:'1.0.0'},{capabilities:{}});
  const transport = new StreamableHTTPClientTransport(new URL(endpoint));
  await client.connect(transport,{timeout:30000});
  if (evidence) mkdirSync(dirname(evidence),{recursive:true});
  const record = data => {
    if (evidence) appendFileSync(evidence,JSON.stringify({capturedAt:new Date().toISOString(),endpoint,...data})+'\n');
  };
  return {
    async list() { const result=await client.listTools(); record({method:'tools/list',result}); return result; },
    async raw(name,args={}) {
      if (!allowed.has(name)) throw new Error(`Tool not in read-only allowlist: ${name}`);
      try {
        let result;
        for(let attempt=0;attempt<4;attempt++) {
          try { result=await client.callTool({name,arguments:args},undefined,{timeout:120000});break; }
          catch(error) { if(error.code!==429||attempt===3)throw error; record({name,arguments:args,retry:attempt+1,error:error.message});await sleep(10000*(attempt+1)); }
        }
        record({method:'tools/call',name,arguments:args,result});
        if(result.isError) unwrapTool(result);
        return result;
      } catch(error) { record({name,arguments:args,error:error.message}); throw error; }
    },
    async call(name,args={}) { return unwrapTool(await this.raw(name,args)); },
    async close() { try { await transport.terminateSession(); } catch {} await client.close(); }
  };
}
