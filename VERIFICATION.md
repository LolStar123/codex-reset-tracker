# Verification

Local verification, 22 September 2026:

- Nine classification tests passed: contextual replies, confirmation evidence,
  uncertain wording, cancellation, reset types, duplicate confirmations, author
  exclusions and expired promises.
- Three collector tests passed: replies included, parent lookup and cursor
  continuation, upstream failures, and unavailable parent context.
- TypeScript and application/component ESLint checks passed.
- Production Vite/Vinext build passed. The Sites build helper was attempted, but
  its npm shim fails on this Windows installation. Running the same package build
  through the installed npm entrypoint succeeds.
- Eighteen headless browser checks passed across desktop and 390px mobile:
  RareUI rendering, history, filters, context, source links, pagination, date
  selection, year navigation, keyboard movement, theme persistence, overflow and
  reduced-motion rendering. No runtime or hydration errors were observed.
- Rendered desktop dark, mobile dark/light and expanded context screenshots were
  inspected. Evidence is under ignored output/playwright/.

## Hosted verification

- Private publication succeeded at https://codex-reset-monitor.atulswaggalicious.chatgpt.site.
- The same eighteen browser checks passed against the hosted site, with no
  browser runtime or hydration errors.
- The production API returned 65 posts and 53 reset-history entries, with no
  collection error, at 08:24 UTC on 22 September 2026.
- The Windows task ran automatically at 08:25:36 UTC with exit code zero. Its
  five-minute trigger and next run were inspected. Credentials are encrypted
  with current-user Windows DPAPI outside the source repository.
- Three additional local browser checks passed: failed refresh preserves data,
  an empty feed remains usable, and successful refresh restores monitoring.
  The intentional HTTP 503 in this test produces an expected console message.

## Reproduction

Use the commands in README.md. Apply local migrations with:

After the first build, run each migration on a fresh local database:

`node node_modules/wrangler/bin/wrangler.js d1 execute DB --config dist/server/wrangler.json --local --file drizzle/0000_wonderful_toxin.sql`

`node node_modules/wrangler/bin/wrangler.js d1 execute DB --config dist/server/wrangler.json --local --file drizzle/0001_tiresome_mystique.sql`

Run browser checks against a running local development server:

`playwright-cli -s=reset-monitor open http://localhost:5173/`

`playwright-cli -s=reset-monitor run-code --filename=tests/browser-qa.js`

## Boundaries

The feed monitors public @thsottiaux posts and replies supplied by FxEmbed.
Public-provider completeness cannot be established from its response alone.
Historical confirmations come from codex-resets.com; source links and coverage
remain visible. Dates record source announcements or confirmations, not private
account telemetry. Same-day confirmations of matching reset types are grouped
for the calendar; this is not a measurement of separate account-level resets.

Recurring collection uses the included headless Windows polling script. Its
configuration and user-encrypted credential live outside this repository. It
requires this PC to be on. Opening the hosted site also checks for new data.
The app never promotes an elapsed promise into a confirmed reset.

RareUI is a local source fork with upstream license and revision recorded in
components/rare-ui/FORK.md. No GitHub-account fork was created.

Unresolved dependency: an independently hosted cron should replace the PC task
if unattended collection while this PC is off becomes necessary.

Writing audit: factual checks and limitations replace prose-style quotas in this
technical report. Rejected generic phrases: “seamless experience”, “powerful
insights”, “cutting-edge dashboard”.
