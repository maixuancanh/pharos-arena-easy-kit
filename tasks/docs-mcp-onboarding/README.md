# Docs MCP onboarding: a fresh exercise

[Arena task](https://pharos-agent-arena.vercel.app/tasks/docs-mcp-onboarding) · Easy

## Scope and starting point

This is a new docs-only onboarding exercise conducted after building three earlier tasks. It is not a claim that I had never used Pharos. The existing Node.js MCP client and the Developer Docs MCP bootstrap URL were already available. During this exercise, all Pharos onboarding guidance came from Developer Docs MCP; no search engine, external documentation page or community answer was used to fill its gaps. The question that says “for the first time” is a new-user scenario, not a claim about the author's history. This constraint and prior knowledge are disclosed for the reviewer.

## What I tried

I asked how to connect the tools, what authentication was required, how to obtain tool schemas and choose the network, how to respect request limits, and how to start SkillEngine. Then I used the Chain MCP endpoint and no-auth setup returned in the answers to connect with the existing client. Runtime tools/list supplied the schemas the answers omitted.

### Step 1 — 2026-10-13T16:53:30.934Z

**Exact query:** I am onboarding to ai.pharos.xyz for the first time. Give exact steps to connect Developer Docs MCP and Chain MCP in a Node.js MCP SDK client and perform a read-only call. What are their exact endpoint URLs?

**Exact answer:**

The Pharos docs specify the **Chain MCP** endpoint, but not a **Developer Docs MCP** endpoint or a Node.js MCP SDK setup for connecting both. So I can’t give exact steps for the two-server client without guessing.

* **Chain MCP:** `https://mcp.pharos.xyz/mcp`
* **Transport:** Streamable HTTP
* **Authentication:** None

The documented generic MCP configuration is:

```json
{
  "mcpServers": {
    "pharos": {
      "type": "http",
      "url": "https://mcp.pharos.xyz/mcp"
    }
  }
}
```

For a read-only call, the Chain MCP exposes `get_block_number`, which reads `eth_blockNumber`. The docs do not provide the Node.js SDK code to invoke it. See [Pharos MCP](/tooling-and-infrastructure/mcp).

**Missing from the available docs:** the Developer Docs MCP endpoint, and exact Node.js MCP SDK connection and invocation steps.

# Sources

- [Pharos MCP](https://docs.pharos.xyz/tooling-and-infrastructure/mcp)
- [Cross Chain Infrastructure](https://docs.pharos.xyz/tooling-and-infrastructure/cross-chain)
- [Alchemy RPC](https://docs.pharos.xyz/tooling-and-infrastructure/rpc/alchemy)
- [Node Configuration](https://docs.pharos.xyz/node-and-validator-guide/validator-node-deployment/node-configuration)
- [Node Management](https://docs.pharos.xyz/node-and-validator-guide/node-management)
- [Pharos Testnet: Rebuild Node with Preserved Node Info](https://docs.pharos.xyz/pharos-testnet-rebuild-node-with-preserved-node-info)
- [Validator Node Deployment](https://docs.pharos.xyz/node-and-validator-guide/validator-node-deployment)
- [Chainlink CCIP](https://docs.pharos.xyz/tooling-and-infrastructure/cross-chain/chainlink-ccip)
- [Circle CCTP](https://docs.pharos.xyz/tooling-and-infrastructure/cross-chain/circle-cctp)
- [Call EVM From WASM](https://docs.pharos.xyz/developer-guide/interoperability/call-evm-from-wasm)
- [Pharos Skill Engine](https://docs.pharos.xyz/tooling-and-infrastructure/pharos-skill-engine-guide)
- [About Pharos](https://docs.pharos.xyz/introduction/readme)
- [x402](https://docs.pharos.xyz/developer-guide/x402)
- [Piggy Bank Tutorial](https://docs.pharos.xyz/tooling-and-infrastructure/pharos-skill-engine-guide/piggybank-skill-guide)
- [Anvita Flow](https://docs.pharos.xyz/tooling-and-infrastructure/overview)
- [Get PROS Gas](https://docs.pharos.xyz/getting-started/get-pros-gas)
- [Nirvana RPC](https://docs.pharos.xyz/tooling-and-infrastructure/rpc/nirvana)
- [Publish Service Agent](https://docs.pharos.xyz/tooling-and-infrastructure/overview/publish-skill-af)
- [Safe MultiSig](https://docs.pharos.xyz/tooling-and-infrastructure/wallets/safe)
- [Enable AutoPruning in Pharos Node](https://docs.pharos.xyz/enable-pruning-in-pharos-node)
- [Using Docker](https://docs.pharos.xyz/node-and-validator-guide/validator-node-deployment/using-docker-deployment)
- [Foundry](https://docs.pharos.xyz/developer-guide/foundry)

### Step 2 — 2026-10-13T16:53:53.891Z

**Exact query:** What authentication headers or API keys are required for https://mcp.pharos.xyz/mcp and https://docs.pharos.xyz/~gitbook/mcp? Show a minimal complete Node.js SDK example with transport and session termination.

**Exact answer:**

`https://mcp.pharos.xyz/mcp` is public: **no authentication header or API key is required**. It uses Streamable HTTP. The Pharos MCP documentation does not specify authentication for `https://docs.pharos.xyz/~gitbook/mcp`, so its header and API-key requirements are **not documented**. See [Pharos MCP](/tooling-and-infrastructure/mcp).

The docs provide a client configuration for the Pharos endpoint:

```json
{
  "mcpServers": {
    "pharos": {
      "type": "http",
      "url": "https://mcp.pharos.xyz/mcp"
    }
  }
}
```

**A Node.js SDK example with transport setup and session termination is not included in the Pharos Developer Docs.** I can’t provide a source-grounded example or claim how the GitBook endpoint authenticates. The docs do note that self-hosted Pharos MCP servers can enable bearer-token auth with `MCP_AUTH_TOKEN`; that is separate from the public hosted endpoint.

# Sources

- [Pharos MCP](https://docs.pharos.xyz/tooling-and-infrastructure/mcp)
- [Node Configuration](https://docs.pharos.xyz/node-and-validator-guide/validator-node-deployment/node-configuration)
- [Node Management](https://docs.pharos.xyz/node-and-validator-guide/node-management)
- [ZAN RPC](https://docs.pharos.xyz/tooling-and-infrastructure/rpc/zan)
- [Alchemy RPC](https://docs.pharos.xyz/tooling-and-infrastructure/rpc/alchemy)
- [Circle CCTP](https://docs.pharos.xyz/tooling-and-infrastructure/cross-chain/circle-cctp)
- [Pharos Testnet: Rebuild Node with Preserved Node Info](https://docs.pharos.xyz/pharos-testnet-rebuild-node-with-preserved-node-info)
- [JSON-RPC API Methods](https://docs.pharos.xyz/api-and-sdk/json-rpc-methods)
- [LayerZero](https://docs.pharos.xyz/tooling-and-infrastructure/cross-chain/layerzero)
- [Validator Node Deployment](https://docs.pharos.xyz/node-and-validator-guide/validator-node-deployment)
- [x402](https://docs.pharos.xyz/developer-guide/x402)
- [Nirvana RPC](https://docs.pharos.xyz/tooling-and-infrastructure/rpc/nirvana)
- [Write Your First Token](https://docs.pharos.xyz/developer-guide/hardhat/write-your-first-token)
- [Node Debugging & Configuration](https://docs.pharos.xyz/node-and-validator-guide/node-debugging-and-configuration)
- [Safe MultiSig](https://docs.pharos.xyz/tooling-and-infrastructure/wallets/safe)
- [RPC Infrastructure](https://docs.pharos.xyz/tooling-and-infrastructure/rpc)
- [Atlantic Testnet](https://docs.pharos.xyz/getting-started/network/atlantic-testnet)
- [Gas Model](https://docs.pharos.xyz/getting-started/gas-model)
- [Enable AutoPruning in Pharos Node](https://docs.pharos.xyz/enable-pruning-in-pharos-node)

### Step 3 — 2026-10-13T16:54:19.451Z

**Exact query:** What are the exact Chain MCP tool names and argument schemas for get_chain_info, get_transaction and get_transaction_receipt? How do I select Pacific mainnet versus Atlantic testnet?

**Exact answer:**

The docs list the tool names and their underlying RPC inputs, but **do not publish the MCP tools’ exact JSON argument-property names or full input schemas**. I can confirm the RPC-level inputs below; the MCP field names are not documented.

| MCP tool                  | Underlying RPC method                                  | Documented RPC input                |
| ------------------------- | ------------------------------------------------------ | ----------------------------------- |
| `get_chain_info`          | `eth_chainId`, `eth_blockNumber`, `web3_clientVersion` | No parameters for these RPC methods |
| `get_transaction`         | `eth_getTransactionByHash`                             | One `String`: transaction hash      |
| `get_transaction_receipt` | `eth_getTransactionReceipt`                            | One `String`: transaction hash      |

The MCP tool names and mappings appear in [Pharos MCP](/tooling-and-infrastructure/mcp). The RPC input types are documented in [JSON-RPC API Methods](/api-and-sdk/json-rpc-methods). **The exact MCP argument key for either transaction-hash input is not specified.**

### Selecting a network

* **Pacific Mainnet:** RPC `https://rpc.pharos.xyz`, chain ID `1672`. The hosted MCP endpoint, `https://mcp.pharos.xyz/mcp`, reports chain ID `1672`, so it targets Pacific. See [Pacific Mainnet](/getting-started/network/pacific-mainnet) and [Pharos MCP](/tooling-and-infrastructure/mcp).
* **Atlantic Testnet:** RPC `https://atlantic.dplabs-internal.com`, chain ID `688689`. See [Atlantic Testnet](/getting-started/network/atlantic-testnet).

For Atlantic, the MCP guide documents self-hosting and configuring `PHAROS_RPC_URL` and `PHAROS_CHAIN_ID`. Set them to the Atlantic RPC URL and `688689`. The docs do not describe a hosted MCP endpoint for Atlantic.

# Sources

- [Pharos MCP](https://docs.pharos.xyz/tooling-and-infrastructure/mcp)
- [Cross Chain Infrastructure](https://docs.pharos.xyz/tooling-and-infrastructure/cross-chain)
- [JSON-RPC API Methods](https://docs.pharos.xyz/api-and-sdk/json-rpc-methods)
- [Alchemy RPC](https://docs.pharos.xyz/tooling-and-infrastructure/rpc/alchemy)
- [Hardhat](https://docs.pharos.xyz/developer-guide/hardhat)
- [Block Explorer](https://docs.pharos.xyz/tooling-and-infrastructure/block-explorer)
- [RPC Infrastructure](https://docs.pharos.xyz/tooling-and-infrastructure/rpc)
- [Get PROS Gas](https://docs.pharos.xyz/getting-started/get-pros-gas)
- [Goldsky](https://docs.pharos.xyz/tooling-and-infrastructure/indexing/goldsky)
- [Atlantic Testnet](https://docs.pharos.xyz/getting-started/network/atlantic-testnet)
- [Pacific Mainnet](https://docs.pharos.xyz/getting-started/network/pacific-mainnet)
- [LayerZero](https://docs.pharos.xyz/tooling-and-infrastructure/cross-chain/layerzero)
- [ZAN RPC](https://docs.pharos.xyz/tooling-and-infrastructure/rpc/zan)
- [Chainlink Data Feeds](https://docs.pharos.xyz/tooling-and-infrastructure/oracles/chainlink-ds)
- [Circle CCTP](https://docs.pharos.xyz/tooling-and-infrastructure/cross-chain/circle-cctp)
- [Node Management](https://docs.pharos.xyz/node-and-validator-guide/node-management)

### Step 4 — 2026-10-13T16:54:35.747Z

**Exact query:** For ai.pharos.xyz Chain MCP get_logs, what is the maximum inclusive block range, rate limit, and correct retry behavior after HTTP 429? Provide exact documented values, not generic advice.

**Exact answer:**

For the **Pharos MCP** endpoint documented at `https://mcp.pharos.xyz/mcp` — the docs do not identify `ai.pharos.xyz` as the endpoint:

* **Maximum range:** 1,000 blocks per `get_logs` call. For inclusive `fromBlock` and `toBlock`, keep `toBlock - fromBlock + 1 ≤ 1,000` — for example, blocks 100–1,099.
* **Rate limit:** 120 requests per minute per IP.
* **After HTTP 429:** Back off and retry after the interval specified in the response’s `Retry-After` header. The docs do not specify a fixed number of seconds; use the header value.

See [Pharos MCP](/tooling-and-infrastructure/mcp) for the range cap, rate limit, and 429 guidance.

# Sources

- [Pharos MCP](https://docs.pharos.xyz/tooling-and-infrastructure/mcp)
- [Node Debugging & Configuration](https://docs.pharos.xyz/node-and-validator-guide/node-debugging-and-configuration)
- [Cross Chain Infrastructure](https://docs.pharos.xyz/tooling-and-infrastructure/cross-chain)
- [Alchemy RPC](https://docs.pharos.xyz/tooling-and-infrastructure/rpc/alchemy)
- [Using Docker](https://docs.pharos.xyz/node-and-validator-guide/validator-node-deployment/using-docker-deployment)
- [Pacific Mainnet](https://docs.pharos.xyz/getting-started/network/pacific-mainnet)
- [Get PROS Gas](https://docs.pharos.xyz/getting-started/get-pros-gas)
- [JSON-RPC API Methods](https://docs.pharos.xyz/api-and-sdk/json-rpc-methods)
- [Pharos Skill Engine](https://docs.pharos.xyz/tooling-and-infrastructure/pharos-skill-engine-guide)
- [Chainlink CCIP](https://docs.pharos.xyz/tooling-and-infrastructure/cross-chain/chainlink-ccip)

### Step 5 — 2026-10-13T16:55:01.032Z

**Exact query:** How do I create and run my first SkillEngine skill on ai.pharos.xyz? Give the exact skill file schema, execution endpoint, authentication and a complete read-only sample.

**Exact answer:**

The Pharos Developer Docs **do not document `ai.pharos.xyz` as a SkillEngine runtime**. They provide no SkillEngine HTTP execution endpoint, request format, or authentication scheme for that site, so I can’t give those details without guessing.

The documented [Pharos Skill Engine](/tooling-and-infrastructure/pharos-skill-engine-guide) is a local package, **not an API**. An agent reads `SKILL.md` and runs `cast` or `forge` commands. Its reference-file format includes an operation overview, command template, parameters, output parsing, error handling, and agent guidelines.

Here’s a read-only reference sample using the documented `cast call` pattern:

````markdown
# Wallet Query Instructions

## Read native PHRS balance

### Overview
Read an account's native balance. This query does not send a transaction.

### Command Template
```bash
cast balance <address> --rpc-url https://atlantic.dplabs-internal.com --ether
````

### Parameters

| Parameter   | Type    | Required | Description      |
| ----------- | ------- | -------- | ---------------- |
| `<address>` | address | Yes      | Account to query |

### Output Parsing

The command returns the balance in PHRS.

### Error Handling

Check the address and RPC URL if the query fails.

> **Agent Guidelines**:
>
> 1. Ask for the account address.
> 2. Run the read-only command.
> 3. Return the balance.

```

The docs separately describe [Pharos MCP](/spaces/NmFp0ycownpuaUNf2xeE/pages/390XouAbPVLF5MWI49pT "mention"), a hosted, public endpoint at `https://mcp.pharos.xyz/mcp` with no authentication. It supports read-only chain tools, but it is **not documented as a SkillEngine execution endpoint**.

For hosted Skill packages, [Publish Service Agent](/spaces/NmFp0ycownpuaUNf2xeE/pages/rZioDwR2w5hHhkTpu0L5 "mention") documents `SKILL.md` frontmatter fields `name` and `description`; it does not specify an `ai.pharos.xyz` execution API.
```

# Sources

- [Pharos Skill Engine](https://docs.pharos.xyz/tooling-and-infrastructure/pharos-skill-engine-guide)
- [Piggy Bank Tutorial](https://docs.pharos.xyz/tooling-and-infrastructure/pharos-skill-engine-guide/piggybank-skill-guide)
- [Publish Service Agent](https://docs.pharos.xyz/tooling-and-infrastructure/overview/publish-skill-af)
- [Anvita Flow](https://docs.pharos.xyz/tooling-and-infrastructure/overview)
- [Alchemy RPC](https://docs.pharos.xyz/tooling-and-infrastructure/rpc/alchemy)
- [Rust](https://docs.pharos.xyz/developer-guide/rust)
- [Write Your First Token](https://docs.pharos.xyz/developer-guide/foundry/write-your-first-token)
- [Write Your First Token](https://docs.pharos.xyz/developer-guide/hardhat/write-your-first-token)
- [RPC Infrastructure](https://docs.pharos.xyz/tooling-and-infrastructure/rpc)
- [x402](https://docs.pharos.xyz/developer-guide/x402)
- [Nirvana RPC](https://docs.pharos.xyz/tooling-and-infrastructure/rpc/nirvana)
- [Pharos MCP](https://docs.pharos.xyz/tooling-and-infrastructure/mcp)
- [About Pharos](https://docs.pharos.xyz/introduction/readme)
- [Goldsky](https://docs.pharos.xyz/tooling-and-infrastructure/indexing/goldsky)
- [Node Debugging & Configuration](https://docs.pharos.xyz/node-and-validator-guide/node-debugging-and-configuration)
- [Pharos Network Snapshots](https://docs.pharos.xyz/node-and-validator-guide/pharos-network-snapshots)
- [Vision & Mission](https://docs.pharos.xyz/introduction/vision-and-mission)
- [Encyclopedia](https://docs.pharos.xyz/introduction/encyclopedia)

## Concrete gaps and suggested fixes

### Gap 1: Developer Docs MCP discovery is missing from its own onboarding answer

**Exact query (step 1):** I am onboarding to ai.pharos.xyz for the first time. Give exact steps to connect Developer Docs MCP and Chain MCP in a Node.js MCP SDK client and perform a read-only call. What are their exact endpoint URLs?

The answer gave the Chain MCP URL, but explicitly could not supply the Developer Docs MCP endpoint. A new user cannot discover the second server from this answer alone.

**Suggested fix:** Add a Connect Developer Docs MCP section with https://docs.pharos.xyz/~gitbook/mcp, Streamable HTTP transport, supported tools and the current public authentication policy. State the bootstrap requirement: a client must already know this endpoint to ask the docs these questions.

### Gap 2: No complete Node.js connection and shutdown example

**Exact query (step 2):** What authentication headers or API keys are required for https://mcp.pharos.xyz/mcp and https://docs.pharos.xyz/~gitbook/mcp? Show a minimal complete Node.js SDK example with transport and session termination.

The answer offered a generic configuration, but explicitly said that an SDK example with transport setup and session termination was absent.

**Suggested fix:** Include a tested example importing Client and StreamableHTTPClientTransport from @modelcontextprotocol/sdk, connecting, listing tools, calling get_chain_info and closing the client in finally. State the tested Node and SDK versions.

### Gap 3: Exact transaction-hash input keys are not given

**Exact query (step 3):** What are the exact Chain MCP tool names and argument schemas for get_chain_info, get_transaction and get_transaction_receipt? How do I select Pacific mainnet versus Atlantic testnet?

The answer listed RPC methods but explicitly could not identify the MCP argument property name for get_transaction or get_transaction_receipt. RPC positional inputs do not tell a user which JSON object to send to MCP.

**Suggested fix:** Document the actual schemas: get_transaction({hash:"0x..."}) and get_transaction_receipt({hash:"0x..."}); show a full request and response. Explain that tools/list is the runtime source of truth for schemas.

### Gap 4: SkillEngine runtime expectations are not resolved

**Exact query (step 5):** How do I create and run my first SkillEngine skill on ai.pharos.xyz? Give the exact skill file schema, execution endpoint, authentication and a complete read-only sample.

The answer could not provide an ai.pharos.xyz execution endpoint or authentication. It explained the local SKILL.md/cast workflow, but the requested hosted-runtime onboarding remained unresolved.

**Suggested fix:** Add a short architecture guide separating ai.pharos.xyz discovery, hosted Chain MCP and locally executed SkillEngine packages. Link the supported installation and first-run path. If no hosted execution API exists, say that explicitly.

## What ran by the end

The read-only Chain MCP connection succeeded without authentication and returned chain ID **1672**, native symbol **PROS** and block **20154679**. I listed the live tools and their input schemas. I did not run a SkillEngine skill or send a transaction.

Run: `npm ci`, then `node scripts/onboarding-run.mjs`. The questions are reproducible with `node scripts/probe-more.mjs docs`; responses may change.

Evidence: [exact questions and answers](../../evidence/onboarding-questions.json), [Docs MCP transcript](../../evidence/docs-probe-mcp.jsonl), [working run](../../evidence/onboarding-run.json), [Chain MCP transcript](../../evidence/onboarding-run-mcp.jsonl).

These are observed gaps in the MCP answers, not a claim that every linked documentation page lacks the information.
