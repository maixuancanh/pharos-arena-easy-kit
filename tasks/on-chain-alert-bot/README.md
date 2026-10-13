# Pharos USDC Alert Bot

[Arena task](https://pharos-agent-arena.vercel.app/tasks/on-chain-alert-bot) · Easy

Watches USDC Transfer events through Chain MCP and sends alerts to a real ntfy notification topic. ntfy supports web and mobile subscribers; it is the “or similar” delivery channel used here. Telegram and Discord were not used.

## Run

`npm ci`

`node more.mjs alert --topic YOUR_OWN_RANDOM_TOPIC --threshold 1000 --polls 3 --state .state/my-alert.json --output my-alert.json --evidence my-alert-mcp.jsonl`

Choose a random topic you control and subscribe at https://ntfy.sh/YOUR_OWN_RANDOM_TOPIC. The --threshold is expressed in human USDC units; integer conversion uses six decimals. --address selects another compatible token. --from chooses the first block for a new cursor. --interval configures polling; --polls bounds the run. Repeat the same command to resume. Three confirmations are used.

## Real run

Configured threshold: **1000 USDC**. The first run delivered **5** notifications and filtered **6** events below the threshold across three polls. The restart delivered **1** new notification(s) across two polls. Notification IDs and messages were read back from ntfy and matched to the publication receipts. The demo topic contains only public blockchain activity.

[Open the notification channel](https://ntfy.sh/pharos-arena-demo-8f273ac41013)

Each alert includes amount, sender, recipient, block and a PharosScan transaction link. An example from the restart:

```text
10000.0001 USDC transferred (threshold >= 1000.0 USDC).
From: 0x200a5eB1477503CfC6e64fd8116C1bb967ba22C1
To: 0xF3503DA2961fF5118ADaa2C4fF8D9A6FB28a411f
Block: 20154645
https://pharosscan.xyz/tx/0x691abf6daa5d23f5851f929dd090aa15114c2eed5af54622881706336986a0e6
```

## Avoiding repeat spam

The cursor, observed log identities and successful delivery IDs are persisted. A replay of an already delivered event was suppressed without making a network request. A lock prevents simultaneous writers to the same state file. Ordinary polls and restarts do not resend that event.

Crash boundary: ntfy acknowledgement and the local delivery checkpoint are not an atomic transaction. A crash between those steps may cause one duplicate on retry. There is no exactly-once delivery claim. Deep reorg recovery is not implemented. ntfy's hosted history expires; the readback is archived in this repository. The demo topic is public and should not be reused for private alerts.

Evidence: [first run](../../evidence/alert-live.json), [Chain MCP requests](../../evidence/alert-live-mcp.jsonl), [restart](../../evidence/alert-resume.json), [duplicate suppression](../../evidence/alert-dedup.json), [real channel readback](../../evidence/alert-channel-readback.jsonl). [ntfy publishing documentation](https://docs.ntfy.sh/publish/).
