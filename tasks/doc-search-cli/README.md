# Pharos Docs Answer CLI

[Arena task](https://pharos-agent-arena.vercel.app/tasks/doc-search-cli) · Easy · 50 potential points

## Install and run

Node.js 22+, from repository root:

```sh
npm ci
node cli.mjs docs "What is the Pharos Pacific mainnet chain ID and RPC URL?"
```

Add --output my-answer.json and --evidence my-docs-mcp.jsonl to save the answer and original MCP result. No model API key is needed. This wraps askQuestion on **https://docs.pharos.xyz/~gitbook/mcp**, the Developer Docs MCP endpoint advertised by the official documentation site.

## Three actual example queries and outputs

### 1. What is the Pharos Pacific mainnet chain ID and RPC URL?

Command:

`node cli.mjs docs "What is the Pharos Pacific mainnet chain ID and RPC URL?"`

Captured: 2026-10-13T14:48:14.661Z. Status: **answered**.

Pharos Pacific Mainnet uses **chain ID `1672`** and RPC URL [`https://rpc.pharos.xyz`](https://rpc.pharos.xyz).

Source: [Pacific Mainnet](https://docs.pharos.xyz/getting-started/network/pacific-mainnet).

# Sources

- [Pacific Mainnet](https://docs.pharos.xyz/getting-started/network/pacific-mainnet)
- [ZAN RPC](https://docs.pharos.xyz/tooling-and-infrastructure/rpc/zan)
- [Atlantic Testnet](https://docs.pharos.xyz/getting-started/network/atlantic-testnet)
- [Node Management](https://docs.pharos.xyz/node-and-validator-guide/node-management)
- [Node Debugging & Configuration](https://docs.pharos.xyz/node-and-validator-guide/node-debugging-and-configuration)
- [RPC Infrastructure](https://docs.pharos.xyz/tooling-and-infrastructure/rpc)
- [Pharos MCP](https://docs.pharos.xyz/tooling-and-infrastructure/mcp)
- [Alchemy RPC](https://docs.pharos.xyz/tooling-and-infrastructure/rpc/alchemy)
- [Cross Chain Infrastructure](https://docs.pharos.xyz/tooling-and-infrastructure/cross-chain)
- [Pharos Skill Engine](https://docs.pharos.xyz/tooling-and-infrastructure/pharos-skill-engine-guide)

[Full JSON](../../evidence/docs-network.json) · [MCP transcript](../../evidence/docs-network-mcp.jsonl)

### 2. How do I deploy a Solidity contract on Pharos with Foundry?

Command:

`node cli.mjs docs "How do I deploy a Solidity contract on Pharos with Foundry?"`

Captured: 2026-10-13T14:48:49.197Z. Status: **answered**.

Deploy from a Foundry project using a Pharos RPC endpoint and a funded testnet wallet:

1. Install Foundry, then set up your contract and deployment script. The [Write Your First Token](https://docs.pharos.xyz/developer-guide/foundry/write-your-first-token) includes an example project and a script that reads `PRIVATE_KEY` and broadcasts deployment.
2. Compile and test:

   ```sh
   forge build
   forge test
   ```
3. Export the deployer key, then run the script:

   ```sh
   export PRIVATE_KEY=<your private key>
   forge script script/DeployToken.s.sol --rpc-url <PHAROS_RPC_URL> --broadcast
   ```

   Replace the example contract and constructor arguments with yours. Keep the private key out of source control.
4. Ensure the wallet has enough testnet tokens to cover deployment costs.

For a deployment flow that passes the key explicitly to Foundry, see [Pharos Skill Engine](https://docs.pharos.xyz/tooling-and-infrastructure/pharos-skill-engine-guide) in the Pharos Skill Engine guide.

# Sources

- [Write Your First NFT](https://docs.pharos.xyz/developer-guide/foundry/write-your-first-nft)
- [Write Your First Token](https://docs.pharos.xyz/developer-guide/foundry/write-your-first-token)
- [Solidity](https://docs.pharos.xyz/resources/solidity)
- [Canonical Contracts](https://docs.pharos.xyz/getting-started/canonical-contracts)
- [Write Your First Uniswap Contract](https://docs.pharos.xyz/developer-guide/foundry/write-your-first-uniswap-contract)
- [Validator Node Deployment](https://docs.pharos.xyz/node-and-validator-guide/validator-node-deployment)
- [Foundry](https://docs.pharos.xyz/developer-guide/foundry)
- [Write Your First Uniswap Contract](https://docs.pharos.xyz/developer-guide/hardhat/write-your-first-uniswap-contract)
- [Piggy Bank Tutorial](https://docs.pharos.xyz/tooling-and-infrastructure/pharos-skill-engine-guide/piggybank-skill-guide)
- [Pharos Skill Engine](https://docs.pharos.xyz/tooling-and-infrastructure/pharos-skill-engine-guide)

[Full JSON](../../evidence/docs-deploy.json) · [MCP transcript](../../evidence/docs-deploy-mcp.jsonl)

### 3. How can I query ERC-20 Transfer event logs using Pharos Chain MCP, and what is the maximum block range?

Command:

`node cli.mjs docs "How can I query ERC-20 Transfer event logs using Pharos Chain MCP, and what is the maximum block range?"`

Captured: 2026-10-13T14:48:50.359Z. Status: **answered**.

Call MCP’s `get_logs` tool (the `eth_getLogs` method) with a block range and filters. Set `address` to the ERC-20 contract and `topics[0]` to the `Transfer` event signature topic:

```json
{
  "fromBlock": "0x1000",
  "toBlock": "0x13e7",
  "address": "0xYourTokenContract",
  "topics": ["0xTransferEventSignatureTopic"]
}
```

The maximum range is **1,000 blocks per call**. Split wider ranges into 1,000-block windows. Filtering by contract address and event topic narrows results.

See [Pharos MCP](https://docs.pharos.xyz/tooling-and-infrastructure/mcp) and [JSON-RPC API Methods](https://docs.pharos.xyz/api-and-sdk/json-rpc-methods).

# Sources

- [Pharos MCP](https://docs.pharos.xyz/tooling-and-infrastructure/mcp)
- [Cross Chain Infrastructure](https://docs.pharos.xyz/tooling-and-infrastructure/cross-chain)
- [Node Debugging & Configuration](https://docs.pharos.xyz/node-and-validator-guide/node-debugging-and-configuration)
- [JSON-RPC API Methods](https://docs.pharos.xyz/api-and-sdk/json-rpc-methods)
- [Why Pharos](https://docs.pharos.xyz/introduction/why-pharos)
- [Circle CCTP](https://docs.pharos.xyz/tooling-and-infrastructure/cross-chain/circle-cctp)
- [Gas Model](https://docs.pharos.xyz/getting-started/gas-model)
- [Rollback Blocks](https://docs.pharos.xyz/node-and-validator-guide/rollback-blocks)
- [Foundry](https://docs.pharos.xyz/developer-guide/foundry)
- [Block Explorer](https://docs.pharos.xyz/tooling-and-infrastructure/block-explorer)

[Full JSON](../../evidence/docs-logs.json) · [MCP transcript](../../evidence/docs-logs-mcp.jsonl)

## No-answer behavior

Query: What is the officially documented Pharos banana-powered quantum teleportation API endpoint and its activation spell?

```json
{
  "key": "no-answer",
  "question": "What is the officially documented Pharos banana-powered quantum teleportation API endpoint and its activation spell?",
  "status": "no-answer",
  "answer": "No good answer found in Pharos Developer Docs. Try a more specific Pharos question.",
  "sources": [],
  "provider": "Pharos Developer Docs MCP",
  "capturedAt": "2026-10-13T14:48:48.609Z"
}
```

Empty or unsourced answers and explicit no-result responses become no-answer. Transport/server failures are reported as errors (exit 1), not disguised as successful searches. Upstream answers are cited but not independently fact-checked; the wrapper never executes returned shell instructions.

## Requirements

- Natural-language input from the terminal.
- Concise synthesized answer plus documentation references.
- Clear no-answer behavior, with an actual unsupported-query test.
- Installation, usage and three complete example outputs in this README.

[Implementation](../../src/docs.mjs) · [No-answer MCP transcript](../../evidence/docs-no-answer-mcp.jsonl)

Status: implemented and live-tested. Reviewer approval is pending.
