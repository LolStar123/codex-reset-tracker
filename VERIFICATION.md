# Verification

## Seconds, sound and Tibo artwork, 22 September 2026

- Full and banked clocks now tick once per second in an isolated component,
  without rebuilding the calendar every second. Seconds roll into minutes/days.
- Removed the personal name from the header. Added generated chibi fan art next
  to the key and in the empty feed, plus Tibo's profile photo by the feed heading.
- Replaced scaling press feedback with a keycap travelling into a fixed housing.
  Gesture-only low thock sound and a persistent mute control are implemented.
- Eleven focused browser checks passed: ticking seconds, removed name, loaded
  images, at least 14px press travel, one sound per press, muted keyboard presses,
  mute persistence, Space activation, 320px layout and reduced-motion hydration.
- All eighteen existing browser checks passed. No runtime/hydration errors.
- Fourteen classifier/clock tests passed, including standalone Codex allowance
  updates without falsely declaring a reset. TypeScript and ESLint passed.
- Shared collection remains server-side. No cloud schedule was registered;
  unattended checks still use the existing Windows task. Access remains private.

## Second design pass, 22 September 2026

- Replaced the monochrome layout with a personal Codex key, self-hosted display
  and mono fonts, cobalt full resets and amber banked resets.
- Twelve classification/clock tests passed, including independent reset clocks,
  combined resets and keyword-free banked confirmation replies.
- Eighteen existing browser checks passed with no runtime or hydration errors.
  Six additional checks passed for key hover, rapid presses, independent source
  links, 320px layout, reduced motion and automatic calendar rollover into 2027.
- Desktop dark and mobile dark/light screenshots were inspected. Fixed one-pixel
  mobile orbit overflow and reduced-motion button tab-index hydration differences.
- TypeScript, application ESLint and the production build passed.
- Account telemetry is researched but not enabled; see MONITORING.md.

## First publication

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

## Scribble, sound, feed and collection revision (22 September 2026)

- Eighteen existing rendered-page checks passed after replacing the feed layout.
- Seventeen focused checks passed for seconds clocks, loaded illustrations,
  at least 14px of key travel, one recorded downstroke and one quieter upstroke,
  muted keyboard input, mute persistence, replayed/removed splash, 320px layout,
  and a static reduced-motion burst. No hydration or runtime errors were observed.
- Four browser checks with an intercepted new source confirmation passed:
  automatic polling inserts the post, advances the full-reset clock, lights its
  calendar date, and renders one copy without a user click. This is simulated
  incoming data, not evidence of a new real-world reset.
- Three cloud-worker tests passed for private requests, health-only logging,
  rejected redirects/auth failures, stale source detection and missing secrets.
- TypeScript, application ESLint and the production build passed.
- Inspected desktop dark, mobile dark, and pressed-key burst screenshots.
  The new WebP retains alpha. Keyboard sound is now a 71.497ms recorded switch
  sample; automated checks verify playback, not a subjective listening test.
- The automatic-refresh test initially installed its fake clock after the page
  had registered real timers. Moving clock installation before navigation fixed
  the test; no application timer change was needed for that failure.
- Cloud activation is blocked by Workers HTTP 403 from the existing API token.
  Cloudflare sign-in is pending; the tested worker has not been deployed there.
  Existing PC polling remains until an independent cloud run is confirmed.

Writing audit: this technical record states measured checks and the remaining
activation dependency. Prose quotas would add irrelevant detail, so they are not
padded. Rejected phrases: seamless monitoring, powerful insights, next-gen feed.

Hosted follow-up: all seventeen focused checks passed on the published revision,
including recorded downstroke/upstroke playback and burst replay. A first hosted
check observed the burst too late after separate browser round trips; testing
travel and burst presence in the same observation removed that timing race.
The private collector returned status ok, 65 posts and 53 reset events, with
checkedAt 2026-09-22T09:52:48.361Z and no collection error. Cloud activation remains
pending authentication; this successful request was an explicit verification.

## Minimal reset panel revision (22 September 2026)

The latest-reset box is the primary content, following the visual hierarchy of
codex-resets.com. The separate hero title, taglines, status card and second reset
clock were removed. One clock chooses the newest confirmation of any reset type;
three source notes appear initially. The source-based typed outlook does not
invent a deadline from a weekday-only promise.

Validation:
- Nineteen classification/clock/outlook assertions passed; the five new outlook
  cases were rerun after final wording changed to no next reset announced.
- Eighteen existing browser checks passed for history, filters, context, source
  links, year navigation, theme persistence and responsive layout.
- Seventeen keyboard/seconds/splash checks passed after shrinking the key inside
  the reset panel. Sound remains the same recorded switch pair.
- Nine minimal-layout checks passed: typing, complete outlook, one clock, three
  notes, removed copy, codex-only header, 320px width, reduced motion and no
  hydration/runtime errors.
- Four simulated incoming-update checks passed for automatic insertion, the
  single clock's new source, calendar marking and deduplication.
- TypeScript and application/component ESLint passed. Production build passed.
- Inspected final desktop dark and 320px mobile light screenshots. Fixed inherited
  muted text color on days ago so it matches the number. Final measured desktop
  page height is 1277px at 1440px width; mobile has no horizontal overflow.

Asset provenance and full built-in generation prompt are in ASSETS.md. Cloud
scheduler activation is still pending the previously requested Cloudflare login;
this visual revision makes no new claim about always-on collection.

Writing audit: the short labels avoid promotional copy. Remaining uncertainty is
public-source completeness and cloud activation, not a fabricated countdown.
Rejected phrases: every reset, tuned in to, straight from his keyboard.


## Tracker header and panel refinement (22 September 2026)

Changed header to codex reset tracker. Moved the source-based outlook into a
crooked label within the main panel, shortened its wording and retained explicit
unknown/delayed/awaiting-confirmation states. Added a spring hover to the day
count and a thin warm CSS outline around the unchanged abstract Tibo artwork.

Nineteen classification/clock/outlook assertions, TypeScript and ESLint passed.
Nine minimal-layout, seven focused hero and seventeen existing key/clock browser
checks passed. Inspected dark desktop and 320px mobile screenshots; adjusted the
mobile label to clear the mechanical key. Reduced motion disables the hover lift.
The recorded switch sound is unchanged. No runtime or hydration errors occurred.

The existing shared polling/PC collector remains unchanged. Cloudflare is still
at sign-in; the prepared cloud scheduler has not been activated. Source reporting
still cannot prove that a reset reached every individual account.

## Mechanical key and automatic delay updates (22 September 2026)

Replaced rounded floating key styling with a sculpted cap, sloping sidewalls and
visible switch/socket. Kept recorded audio, pointer/keyboard operation and deep
press. Inspected dark desktop and 320px mobile renders.

Fixed the outlook discarding explicit dates in corrections. Incoming delay replies
now replace the old promised day using the correction's UTC timestamp and source.
Uncertain delays remain undetermined; cancellations and subsequent confirmations
supersede the old expectation. A delay never creates a calendar reset event.

Passed 21 classification/clock/outlook tests and four bundled collector tests,
including missing-parent lookup followed by delay classification and forecast.
Seventeen key/clock checks and seven hero checks passed. Six simulated live-update
checks verified automatic polling inserts the delay, changes the forecast source
and date without restarting the clock, then applies a later confirmation to the
clock and calendar. These injected browser fixtures are not proof of provider recall.
TypeScript and ESLint passed with no runtime or hydration errors in key checks.

Changed the existing Windows task repetition from five minutes to one minute.
Its latest pre-change scheduled run succeeded at 11:00 UTC with 65 posts and no
collection error. Always-on cloud scheduling still needs Workers authorization;
the prior Cloudflare sign-in tab has been closed. No credentials were broadened.
