# Reset verification

## What is running

The hosted collector reads public posts and replies plus historical reset records.
An explicit source statement of delivery can create a confirmed calendar event.
Hints and scheduled promises cannot. Full and banked clocks use separate source
timestamps; a combined confirmation advances both. These timestamps are not a
measurement of when a particular account received a reset.

The existing Windows task requests the hosted monitor every five minutes while
the user is logged in and the PC is awake. The server throttles source collection
to a minimum five-minute interval; active pages request updates every minute.
An open page updates its date every thirty seconds, including across year changes.
The calendar expands its available years automatically. Older years stay selectable.
Source failures preserve history and display delayed collection.

All authorized visitors read the same database and filtered feed. An open visitor
can trigger server-side collection even when the owner's PC is off; that PC is
only required for the existing unattended polling task. This is a private Site,
not an anonymously accessible public feed. No cloud cron is currently installed.
The interface's two elapsed clocks now tick every second independently of the
feed's one-minute polling and the collector's five-minute minimum interval.

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
