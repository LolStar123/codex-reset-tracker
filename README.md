# Reset Monitor

A small Codex reset monitor with Rare UI's GitHub Activity component, a chronological
feed of posts and replies, parent context, full/banked reset history, and light/dark themes.
One clock tracks the latest source confirmation. The mechanical check key keeps its
recorded switch sound, deep travel and ink splash.

## Live site

https://LolStar123.github.io/codex-reset-tracker/

The site and collector run on GitHub. Your computer does not need to stay on.
GitHub checks public posts and replies every five minutes; open pages fetch the
shared result every 30 seconds. The feed, outlook and calendar follow collected
source updates. GitHub scheduling and the public source can introduce delays.

See [GITHUB.md](GITHUB.md) for setup, logs, manual checks, repairs and limitations.
The public repository uses free GitHub Pages and standard GitHub Actions runners.

## Run

Node 24+. `npm ci`, `npm run test:github`, then `npm run build:pages`.
The static build is emitted to `dist-pages/`. The original server build remains
available through `npm run dev` and `npm run build` for Sites/D1 deployments.

## Collection

FxEmbed timeline requests include `with_replies=true`. Missing parent posts are
looked up before classification. Source IDs deduplicate the records. Historical
reset data is attributed to https://codex-resets.com/api/v1/resets.

The `monitor-data` branch preserves the shared snapshot, raw source records and
collection receipts. Failures preserve history and the last successful timestamp.
Confirmed means a source reports delivery, not that an individual account was
checked. Promises never become reset events merely because their date passes.

`node scripts/correct.mjs POST_ID CATEGORY REASON` records a reviewed override.
Test and push it; the next collector applies it to the shared snapshot.

## Rare UI fork

`components/rare-ui/github-activity.tsx` is an actively used MIT source fork.
See its `FORK.md` and `LICENSE` for the exact upstream commit and local adaptations.
The full upstream clone is kept at ../vendor/rare-ui. No remote GitHub fork was created.

## Verification

`node --experimental-strip-types --test tests/classification.test.mjs`
`node node_modules/esbuild/bin/esbuild tests/collector.test.mjs --bundle --platform=node --format=cjs --outfile=output/tests/collector.cjs`
`node --test output/tests/collector.cjs`
`node node_modules/typescript/bin/tsc --noEmit`
`node node_modules/eslint/bin/eslint.js app lib components/rare-ui --quiet`

Browser interactions are exercised by `tests/browser-qa.js` using playwright-cli.
See VERIFICATION.md for measured checks and explicit limitations.
