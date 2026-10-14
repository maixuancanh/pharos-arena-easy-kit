# Weekly Digest Agent

[Arena task](https://pharos-agent-arena.vercel.app/tasks/weekly-digest-agent) · Medium · Batch order 5/10

## Result

Current seven-day metrics are compared to the preceding seven days, with 3 distinct notable transactions. Two actual worker ticks were captured using an accelerated two-second interval. The production GitHub workflow runs Mondays at 00:00 UTC (07:00 Vietnam) and deploys the refreshed digest page.

## Install and run

From this repository root with Node.js 22+:

`npm ci`

```sh
node ten.mjs digest --wallet 0x200a5eb1477503cfc6e64fd8116c1bb967ba22c1 --period-days 7 --output my-digest.json --html my-digest.html --schedule
```

Change wallet, contract, dates or JSON thresholds to your own public-data inputs. Use your own output paths to preserve captured evidence. Sources: official Chain MCP and Developer Docs MCP where applicable; history/profile reports explicitly use PharosScan's public indexer. No signing or broadcasting is performed.

## Requirement mapping

- Weekly default interval: CLI 604800 seconds; GitHub schedule cron Monday 00:00 UTC.
- Comparisons with previous period: comparisons.current/previous/delta.
- Top three distinct transaction events: topEvents and ranking rule.
- Publication: digest-latest.html and .github/workflows/weekly-digest.yml Pages deployment.

## Captured evidence

- [digest output](../../evidence/ten/digest.json)

[Published latest digest](../../digest-latest.html) · [Actual schedule ticks](../../evidence/ten/digest.json.schedule.jsonl) · [Production workflow](../../.github/workflows/weekly-digest.yml)

The matching MCP/Docs/indexer transcripts and console captures are in [evidence/ten](../../evidence/ten). Test fixtures are separate from these live outputs. Earlier initial samples are retained but the named current outputs above are the verified versions.

## Limits

The accelerated demo verifies scheduling, not the passage of an actual week. Hosted starts may be delayed by GitHub. Indexer/page-cap limitations propagate into the digest. A local worker writes local HTML; the included hosted workflow supplies recurring public publication.

Submitted to Arena on 14 October 2026. Status verified: IN REVIEW; no points awarded at that check. See evidence/ten/submissions.json for the submission record.
