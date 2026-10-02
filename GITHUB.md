# GitHub hosting and automatic updates

Website: https://LolStar123.github.io/codex-reset-tracker/

Repository: https://github.com/LolStar123/codex-reset-tracker

## What runs where

- GitHub Pages serves the existing interactive website, pictures and keyboard audio.
- GitHub Actions requests **Collect reset updates** every five minutes and runs
  it when collector code changes. It fetches Tibo's public posts **and replies**, retrieves parent
  context, filters relevant updates and derives the feed, outlook and reset calendar.
- The `monitor-data` branch holds the shared `snapshot.json`, retained public
  `raw-posts.json`, and the last 2,016 collection receipts in `runs.json`.
- The **check key refreshes the shared snapshot** immediately and displays the
  collection timestamp or a failure. Browsers do not query the upstream X mirror
  because it rejects browser-origin timeline requests.
- Pages read the shared GitHub snapshot every 30 seconds while visible. An older
  cached result cannot overwrite newer browser data. The clock ticks each second.
- The GitHub collector performs reply-inclusive source collection and persists
  shared history. No repository credential is shipped to visitors.
- Pushing changes to `main` tests and publishes the website automatically. Data
  checks do not rebuild the site, and failed source checks keep the last good data.

Nothing here uses a self-hosted runner, a local scheduled task or a PC access token.
No paid API, X login, Cloudflare account or custom domain is required. The standard
GitHub-hosted runners and Pages are free for this public repository. Keep the repo
public and retain `ubuntu-latest`; do not opt into paid larger runners.

## Check it is working

Open **Actions > Collect reset updates**. Open a run and its collection step for
the timestamp, source status and counts. You can also open `monitor-data/runs.json`.
`checkedAt` is the last successful timeline check, even when no new post was found.
`lastAttemptAt` includes failed checks. A failure never advances `checkedAt`.
`historyError` reports a failure of the supplementary historical archive separately;
it does not suppress fresh Tibo updates or make live timeline collection appear stale.
At launch, that archive returned HTTP 403 to GitHub's runner. The imported 55-event
history remains intact; new updates are collected directly from Tibo's timeline.

The ordinary check key can be tested without signing in to GitHub: press it and
look for `Collected <date> HH:MM:SS UTC`. Browser network tools should show a request
to `monitor-data/snapshot.json`. A failed refresh leaves the last good
clock/feed/calendar intact and offers another press.

Active banked grants such as "we are loading a banked reset" automatically become
recorded announcements. The clock says **Reset announced**, and the source remains
linked. Future promises remain planned; hypothetical statements and denials do not create delivery records.
Delivery is still unconfirmed until source wording actually confirms it.
The main clock measures elapsed time since the latest relevant source update, including
a planned reset or timing revision. Its visible label and UTC source time identify that basis.

For an immediate server check: **Actions > Collect reset updates > Run workflow**.
Refreshing the site afterward picks up the published result. A red run needs a look;
normal GitHub workflow notification settings control failure emails.

## Maintenance

- Source outage: inspect the failed run. The next scheduled run retries. Retained
  history remains visible, and the page marks stale or failed collection.
- Changed source API: fix `lib/collector.ts`, run `npm run test:github`, then push.
- Misclassified wording: add a reviewed entry using `scripts/correct.mjs`, test,
  and push. The next collector applies the override to the shared snapshot.
- Incorrect classification rules: edit `lib/classify.ts` and add a regression case.
- Disable collection: Actions > Collect reset updates > Disable workflow.
- Restore collection: enable the workflow and run it manually once.
- New computer: clone the repository, install Node 24+, and run `npm ci`.
  No migration of Windows tasks or local credentials is needed.
- Custom domain later: add it in **Settings > Pages**, update DNS as GitHub directs,
  set `PAGES_BASE=/` for the build in `pages.yml`, and redeploy.

GitHub schedules are best effort, not an exact five-minute SLA. Jobs can be delayed
or dropped during heavy load. Public schedules can be disabled after 60 days with
no repository activity; regular data commits provide activity while collection is
running, but check Actions if the feed becomes stale. Do not assume a green Pages
deployment proves collection is healthy: they are separate workflows.

The free public source can omit or delay posts and can change its API. This is
automatic monitoring of reported resets, not access to OpenAI's account reset logs.
It cannot verify whether a reset reached an individual account. June/July coverage
includes researched additions; earlier replies remain incomplete. Unknown wording
may need a classification correction. It is not a promise to catch every tweet.

## Local verification

```sh
npm ci
npm run test:github
npx tsc --noEmit
npm run build:pages
npm run build:collector
```

To run collection locally for debugging, check out `monitor-data` into the ignored
`state/` directory and run `node dist-collector/collect.mjs state`. It makes one
check and exits. Nothing schedules itself locally.

The original Sites/D1 server and Windows helper files remain in the repository as
an alternative deployment. They are not used by GitHub Pages or GitHub collection.

References: [GitHub Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions),
[scheduled workflow limitations](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule),
[GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).
