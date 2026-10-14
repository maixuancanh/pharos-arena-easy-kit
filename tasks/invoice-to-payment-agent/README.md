# Invoice-to-Payment Agent

Reads structured JSON and line-oriented text invoices, then validates and prepares the matching payment.

```powershell
node scripts/remaining-payments.mjs invoice configs/remaining/payments/demo.json configs/remaining/payments/invoice.json evidence/remaining/payments/invoice-json-live.json
node scripts/remaining-payments.mjs invoice configs/remaining/payments/demo.json configs/remaining/payments/invoice.txt evidence/remaining/payments/invoice-text-live.json
```

| Requirement | Implementation and evidence |
|---|---|
| 01 At least two invoice formats | JSON and `Field: value` text samples in `configs/remaining/payments/`; both extract payee, amount, token/currency, reference. |
| 02 Flag mismatches/missing fields | Reject duplicate fields, unknown totals, conflicting payee/recipient or token/currency, missing reference, malformed address/amount; return follow-up. |
| 03 Summary and unsigned payment with reference | Both live outputs preserve `reference`, encode it in unsigned calldata and print the summary before transaction output. |
| 04 Demo invoices | `invoice-json-live.json`, `invoice-text-live.json`, corresponding raw MCP logs and checked-in sample inputs. |

The invoice reference is included in the unsigned envelope and in trailing ABI-encoded calldata after the standard ERC20 transfer arguments. The full call is simulated before preparation; a token that rejects appended data cannot produce an unsigned payment. No memo has been broadcast. PDF/OCR and exchange-rate conversion are unsupported. Amounts must be exact decimal strings, not JSON floating-point numbers.

Run from the repository root after `npm ci` (Node 22 or later). Public reads use only the official Chain MCP through `src/mcp.mjs`. The reference sender is a public funded EOA; we do not claim ownership or possess its keys. No production command signs or broadcasts. Live evidence is read-only Pharos chain 1672; actual successful/reverted receipts are from a separate ephemeral local EVM chain 31337.

Validation: `node --test tests/remaining-payments.test.mjs` (15 passing behavioural tests). Evidence: `evidence/remaining/payments/tests.txt`. Local receipt demo: `node scripts/remaining-payments-local-demo.mjs evidence/remaining/payments/fresh-local-demo.json` (choose a fresh output path). On Node 24, Ganache warns about unavailable native uWS and successfully uses its JS fallback.

Update after independent review: decoded duplicate JSON keys are rejected even with whitespace or Unicode escapes. Both invoice formats were re-run through live Pharos MCP after adding their reference to calldata. Token contracts that reject trailing memo data fail preflight; native-coin invoice memos are currently unsupported.
