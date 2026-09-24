# Codex Reset Tracker

A small website that collects Codex reset announcements and replies from @thsottiaux, with a live check button and a reset calendar.

[Live demo](https://lolstar123.github.io/codex-reset-tracker/) ? [Collection logs](https://github.com/LolStar123/codex-reset-tracker/actions/workflows/collect.yml) ? [Maintenance](GITHUB.md)

The site puts the latest recorded reset above a GitHub-style activity calendar and a short source feed. The check button fetches current posts and replies directly, with a moving mechanical key, recorded switch audio and an ink splash when pressed.

## What it does

- Collects public posts and replies from **@thsottiaux**, including parent context, and filters them for reset information.
- Separates confirmed delivery, active rollout announcements, future promises, delays and hints. Announcements are labelled; a promised date passing never creates a completed reset.
- Updates the clock, calendar and outlook from collected source data. Every feed entry links back to its source.
- Keeps the last good data through source failures and prevents an older cached snapshot from overwriting a newer live check.

The interface has light and dark themes, an abstract Tibo illustration and a clock that ticks in seconds. Sound is optional.

## How it works

**TypeScript ? React ? Vite ? GitHub Actions ? GitHub Pages**

GitHub Actions schedules background collection every five minutes and saves the shared snapshot, public source records and health receipts on the `monitor-data` branch. GitHub Pages serves the frontend.

An open page reads the shared snapshot every 30 seconds and checks the public source directly on arrival and every five minutes while visible. Pressing **check** starts another direct source request. Browser checks are kept locally; the GitHub collector independently maintains the shared history.

The source request includes replies. Missing parent posts are retrieved before classification, source IDs deduplicate records, and the same classification rules run in the browser and the background collector. The collector uses deterministic text rules.

## Run locally

Requires Node.js 24+.

```sh
npm ci
npm run test:github
npm run build:pages
npx vite preview --config vite.pages.config.ts
```

Open the local preview URL printed by Vite. The Pages build is in `dist-pages/`.

The original Sites/D1 server remains available through `npm run dev` and `npm run build`; the public GitHub deployment uses the Pages build.

## Verification

```sh
npm run test:github
npx tsc --noEmit
```

Regression checks cover reply context, changed reset dates, banked grants, announcement versus delivery, duplicate events, stale snapshots and failed source requests. Browser checks also exercised repeated live key presses, failure recovery and background polling after a fresh check.

See [GITHUB.md](GITHUB.md) for collection receipts, operational limits and repairs.

## Sources and limits

Public posts are retrieved through [FxEmbed](https://docs.fxembed.com/api/introduction/). Imported reset history is attributed to [Codex Resets](https://codex-resets.com/). Public-source coverage remains incomplete, and GitHub scheduling and upstream caching can delay background updates. The supplementary history endpoint has also returned HTTP 403 to the collector.

This tracks reported resets. It cannot inspect an individual's OpenAI account balance or verify delivery to that account. The interface labels active rollout announcements separately from completed delivery.

The calendar adapts Rare UI's GitHub Activity component under its MIT licence; see the [fork notes](components/rare-ui/FORK.md) and [licence](components/rare-ui/LICENSE). Artwork and keyboard audio credits are in [ASSETS.md](ASSETS.md). This project is not affiliated with OpenAI.
