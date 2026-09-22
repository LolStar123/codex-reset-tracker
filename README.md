# Reset Monitor

A small Codex reset monitor with Rare UI's GitHub Activity component, a chronological
feed of posts and replies, parent context, full/banked reset history, and light/dark themes. The refresh key and controls use spring motion; full and
banked reset clocks track separate source confirmations.

## Run

Node 24+. `npm run dev` starts the site on localhost:5173. `npm run build` emits a
Cloudflare Worker. `npm start` serves the production build locally.
D1 bindings live in `.openai/hosting.json`. Apply the two checked-in Drizzle migrations
for a fresh local database; see the commands in `VERIFICATION.md`.

## Collection

Server-side FxEmbed timeline requests include `with_replies=true`. Parent rows are
retained and missing parents are fetched before classification. Only @thsottiaux's
statements enter the feed. Context-only jokes stay hints. Source IDs deduplicate posts.
History comes from https://codex-resets.com/api/v1/resets with linked attribution.

D1 stores raw posts, classified posts, reset events, collection runs and a cached
snapshot. A database lease prevents parallel ingestion; unfinished catch-up cursors
survive restarts. Source failures preserve previously collected records and show delay.
The public feed automatically requests fresh data while open. The recurring hosted
check is installed separately in Windows Task Scheduler because the Sites publishing
connector does not expose a cloud cron registration operation. The scheduler depends
on this PC remaining on; the hosted website itself does not.

Classification is deterministic and conservative, not an unverified paid model call.
It records source text instead of generating unsupported facts. Public-provider recall
is not guaranteed; source coverage and missing context are disclosed in the interface.
Expired promises remain awaiting confirmation and never become automatic reset events.

`node scripts/correct.mjs POST_ID CATEGORY REASON` records a reviewed classification
change (or `hidden`) in `data/overrides.json`. Validate and redeploy to publish it.

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
