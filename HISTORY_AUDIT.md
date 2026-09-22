# Reset history audit, 22 September 2026

The upstream reset list contained 53 records. It labelled all four entries below as regular resets. The import preserved those labels even when a source post described a banked grant. Corrections now apply to existing stored data and fresh installations, and cannot be undone by another history import.

All dates below use UTC, which can differ from the date shown by X in a local timezone.

| Source date | Correct treatment | Evidence |
| --- | --- | --- |
| 18 June | Full plus banked, confirmed | [Tibo's double-reset post](https://x.com/thsottiaux/status/2067399435009622521) |
| 29 June | Full plus banked, announced; no exact completion time claimed | [Tibo's investigation update](https://x.com/thsottiaux/status/2071740419030053227) |
| 12 July, 21:28 | Banked, confirmed; targeted at 500k users affected by a failed application window | [Tibo's grant explanation](https://x.com/thsottiaux/status/2076418567143408112) |
| 13 July | Banked, confirmed; global 7M-user milestone grant | [Tibo's milestone post](https://x.com/thsottiaux/status/2076735790567338203) |

Added the [12 June launch grant](https://x.com/OpenAI/status/2065225362544726371) from OpenAI and the separate [12 July 17:59 full-reset announcement](https://x.com/thsottiaux/status/2076365965915467978). The latter must not be confused with the later targeted banked grant that day. Both retain an announcement basis.

The [22 August banked delivery confirmation](https://x.com/thsottiaux/status/2090964822422949999) was missing from the retained feed. Its announcement and confirmation now link to one event on 22 August instead of counting twice. The classifier now recognises banked grants and “has landed” / “has been propagated” delivery wording.

The [28 June hard reset](https://x.com/thsottiaux/status/2071381664853319742) stays regular: previously stacked banked balances are not a new grant. A quoted request for a banked reset also cannot change an explicit regular-reset announcement into a banked one. These cases have regression tests.

## Archive boundaries

The public timeline was paged through 24 responses and ended at 10 August 13:01 UTC. It provided 448 own, non-reposted Tibo records. Missing reply parents were looked up before classification; three parent requests returned 404 and remain explicitly unavailable. Signed-in X search supplied targeted June and July post IDs, then public post lookups supplied full source text and UTC timestamps.

The retained archive contains 101 relevant source records. Reconciliation against the live snapshot expands the feed from 65 to 137 posts, adding 72. The calendar expands from 53 to 55 recorded events, with corrected types and the August delivery date. These are source records, not measurements of individual accounts.

Earlier reply history remains incomplete. Targeted June/July discoveries do not justify calling the entire interval covered. A successful live collection does not establish complete historical coverage. Raw research receipts are in the ignored `output/history-audit/` directory; the reviewed source archive and corrections are versioned under `data/`.

## Verification

Regression coverage checks targeted versus global grants, June combined resets, old balances, conditional/negative wording, quoted requests, announcement/delivery deduplication, replay into a populated database, and preservation of the actual collection timestamp. Collector tests cover replies, missing parents, pagination, source failures and delay replies changing the outlook.
