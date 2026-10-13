import {connect,CHAIN_MCP} from '../src/mcp.mjs';
const c=await connect(CHAIN_MCP,'evidence/ten/probe-mcp.jsonl');try{for(const [name,args] of [['get_balance',{address:'0x200a5eb1477503cfc6e64fd8116c1bb967ba22c1'}],['get_gas_price',{}],['get_transaction_count',{address:'0x200a5eb1477503cfc6e64fd8116c1bb967ba22c1'}]])console.log(name,await c.call(name,args));}finally{await c.close();}
