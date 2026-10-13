# Pharos USDC State Reader

[Arena task](https://pharos-agent-arena.vercel.app/tasks/read-contract-state) · Easy · 50 potential points

## Install and run

From the repository root, with Node.js 22+:

`npm ci`

`node cli.mjs read --output my-read.json --evidence my-read-mcp.jsonl`

Contract: **0xc879c018db60520f4355c26ed1a6d572cdac1815**, USDC from the [official Pacific token registry](https://docs.pharos.xyz/getting-started/token-registry). No wallet is needed.

## Actual sample output

Captured 2026-10-13T14:51:26.155Z; this is a snapshot, not a current balance claim.

```json
{
  "network": "Pharos Pacific Mainnet",
  "chainId": 1672,
  "contract": "0xc879c018db60520f4355c26ed1a6d572cdac1815",
  "block": 20147121,
  "blockTag": "0x1336bb1",
  "name": "USDC",
  "symbol": "USDC",
  "decimals": 6,
  "totalSupply": "17255330.463491",
  "totalSupplyRaw": "17255330463491",
  "explanation": "USDC (USDC) has a total supply of 17255330.463491 USDC at block 20147121.",
  "explorer": "https://pharosscan.xyz/address/0xc879c018db60520f4355c26ed1a6d572cdac1815",
  "capturedAt": "2026-10-13T14:51:26.155Z"
}
```

## Requirements

- Four values from one deployed contract via Chain MCP: name, symbol, decimals and totalSupply.
- Contract address and block are included. Every view call is pinned to block 20147121.
- Total supply is formatted with token decimals using exact integer arithmetic.
- This README provides the selected contract, installation, run command and sample output.

[Original MCP transcript](../../evidence/read-final-mcp.jsonl) · [JSON output](../../evidence/read-final-output.json) · [Implementation](../../src/read.mjs)

Status: implemented and run locally against mainnet. Reviewer approval is pending.
