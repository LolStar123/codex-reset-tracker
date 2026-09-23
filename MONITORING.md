> Historical Sites/PC deployment notes. The current GitHub setup is documented in [GITHUB.md](GITHUB.md).

# Reset verification

## What is running

The hosted collector reads public posts and replies plus historical reset records.
An explicit source statement of delivery can create a confirmed calendar event.
Hints and scheduled promises cannot. The single last-reset clock uses the newest confirmed source timestamp, whether
full, banked or both. These timestamps are not a
measurement of when a particular account received a reset.

The existing Windows task requests the hosted monitor every five minutes while
the user is logged in and the PC is awake. The server throttles source collection
to roughly one check per minute; failed source calls back off for five minutes.
Active pages request shared updates every thirty seconds and when made visible.
An open page updates its date every thirty seconds, including across year changes.
The calendar expands its available years automatically. Older years stay selectable.
Source failures preserve history and display delayed collection.

All authorized visitors read the same database and filtered feed. An open visitor
can trigger server-side collection even when the owner's PC is off; that PC is
only required for the existing unattended polling task. This is a private Site,
not an anonymously accessible public feed. No cloud cron is currently installed.
The interface's single elapsed clock ticks every second. Active pages poll the
shared feed every thirty seconds; healthy source collection is throttled to
roughly once a minute, with a five-minute backoff after a failed source check.

## Account observations: researched, not connected

On 22 September 2026, a read-only inspection of two recent local Codex session
logs found 98 token-count records with rate-limit snapshots. The records include
used_percent, window_minutes and resets_at. Only limit metadata was inspected;
conversation content was not used or uploaded. Session logs are event-driven, so
they are not a continuously fresh source while Codex is idle.

The official app-server interface documents account/rateLimits/read and
account/rateLimits/updated. Its response can include per-bucket usage, reset
timestamps and rateLimitResetCredits. When provided, grant details include opaque
IDs, grantedAt and expiresAt. Details can be null or capped; availableCount is the
authoritative current count. Ordinary monetary credits are a different field.

Reference: https://learn.chatgpt.com/docs/app-server#6-rate-limits-chatgpt

For a future private account observer:

1. Read authenticated account limit snapshots locally. Keep authentication and
   complete session logs on the PC. Upload only deliberately selected observations.
2. Compare snapshots within the same account, bucket and window. A drop before
   the previous reset boundary is a candidate refill, not proof of a global reset.
3. Separate scheduled window rollover, bank redemption and allowance changes.
   Repeated samples and the source announcement provide stronger evidence.
4. Detect newly seen banked grant IDs and retain their grant timestamps. Count
   changes alone can be misleading because grants can expire or be redeemed.
5. Display account observations separately from global announcements. No call to
   account/rateLimitResetCredit/consume is needed to observe resets.

No private-account observer, telemetry upload, reset redemption or new account
authentication was enabled in this release.

## Cloud scheduler prepared, activation pending

`scheduler/worker.mjs` calls the private `/api/collect` endpoint every minute via
Cloudflare Cron Triggers. The endpoint returns health metadata only. The same
D1 lease prevents overlapping source collection from cloud calls and visitors.
Successful runs preserve the last checked timestamp; failures keep the previous
feed. The worker refuses redirects so its secret never follows another origin.
Its credential belongs in a Cloudflare secret binding, never source control.

The worker and cron configuration are implemented and tested, but are not yet
installed: the existing Cloudflare API token has domain access but Workers calls
return HTTP 403. Cloudflare browser sign-in was requested. The PC task remains
active until a successful cloud run has been verified. No always-on claim is made
before that verification.

Polling is not a Twitter webhook. Public-source availability and provider cache
can delay or omit tweets/replies. A source confirmation advances the calendar and
clocks; a tweet promising a reset does not prove it has propagated to an account.

Cloudflare scheduling reference:
https://developers.cloudflare.com/workers/configuration/cron-triggers/
