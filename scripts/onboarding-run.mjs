import {connect,CHAIN_MCP} from '../src/mcp.mjs';
import {writeFileSync} from 'node:fs';
// The endpoint and no-auth configuration came from the fresh Docs MCP answers.
const c=await connect(CHAIN_MCP,'evidence/onboarding-run-mcp.jsonl');
try{const tools=await c.list();const info=await c.call('get_chain_info');writeFileSync('evidence/onboarding-run.json',JSON.stringify({endpoint:CHAIN_MCP,authentication:'none',tools:tools.tools.map(t=>({name:t.name,inputSchema:t.inputSchema})),info,capturedAt:new Date().toISOString()},null,2));console.log(info);}finally{await c.close();}
