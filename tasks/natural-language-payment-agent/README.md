# Natural-language Payment Agent

Turns a constrained natural-language transfer request into a reviewed unsigned transaction.

```powershell
node scripts/remaining-payments.mjs intent configs/remaining/payments/demo.json "send 0.000001 USDC to 0x200a5eb1477503cfc6e64fd8116c1bb967ba22c1" evidence/remaining/payments/intent-live.json
node scripts/remaining-payments.mjs intent configs/remaining/payments/demo.json "send some USDC to Bob" evidence/remaining/payments/ambiguity.json
```

| Requirement | Implementation and evidence |
|---|---|
| 01 Parse amount, token, recipient; follow up | `parseIntent` supports send/pay/transfer, optional please; malformed amounts, names, multiple recipients return a specific question. `ambiguity.json`. |
| 02 Validate request | Checksum/address and zero address checks, explicit token allowlist, chain identity, token bytecode, on-chain decimals, token/native balances, transfer simulation, gas estimate and 20% gas-limit buffer. `intent-live.json.mcp.jsonl`. |
| 03 Summary before unsigned transaction | CLI prints awaited summary callback before returning unsigned envelope. `intent-live.json` includes summary and transaction. |
| 04 Never signs or sends | Production CLI imports only read-only MCP adapter; emits unsigned envelope with chain, nonce, value, calldata and gas. |

Limits: no ENS resolution or broad LLM interpretation; unsupported phrasing asks for clarification. No currency conversion. Balance/nonce/gas are snapshots and need revalidation before wallet signing. ERC20 simulation supports standard bool-returning, non-fee transfers only; configured symbol is an allowlist label, not proof of issuer legitimacy.

Run from the repository root after `npm ci` (Node 22 or later). Public reads use only the official Chain MCP through `src/mcp.mjs`. The reference sender is a public funded EOA; we do not claim ownership or possess its keys. No production command signs or broadcasts. Live evidence is read-only Pharos chain 1672; actual successful/reverted receipts are from a separate ephemeral local EVM chain 31337.

Validation: `node --test tests/remaining-payments.test.mjs` (15 passing behavioural tests). Evidence: `evidence/remaining/payments/tests.txt`. Local receipt demo: `node scripts/remaining-payments-local-demo.mjs evidence/remaining/payments/fresh-local-demo.json` (choose a fresh output path). On Node 24, Ganache warns about unavailable native uWS and successfully uses its JS fallback.
