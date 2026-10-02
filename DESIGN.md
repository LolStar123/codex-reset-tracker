# Reset tracker design

## Job and hierarchy

An unofficial public-source monitor. The primary action retrieves the newest shared collection; the primary reading is the newest reset-related source update. Exact source time, event kind and collection freshness must be visible together. Delivery reports, plans, revisions and rollout announcements retain different labels. Account delivery is not verified here.

The layout is an instrument panel: compact terminal wordmark, elapsed-update panel and physical check key, collection receipt, UTC activity calendar, then an expandable source feed. Maximum width is 960px. Desktop uses 38px panel padding; phone uses 18px and a two-column clock/key arrangement with a full-width outlook below. Older calendar months scroll inside their frame, never the document.

## Visual direction

The inherited elapsed clock/calendar structure references codex-resets.com, inspected in an isolated browser during the original 22 September 2026 design pass. This redesign uses the project's own navy/cobalt vocabulary and existing physical key. The MIT Rare UI calendar is a code reference with local reset-specific semantics.

The signature is one blue mechanical key: angular sloping walls, concave top, exposed cream stem and dark socket. The rest of the interface stays flat and quiet. A two-pixel panel edge ties the key's blue to the latest-update instrument. Amber identifies banked records and incomplete/stale collection. The existing abstract Tibo sketch remains beside the key; it identifies the source author without becoming a hero illustration.

## Tokens

| Role | Dark | Light |
| --- | --- | --- |
| Page | `#141d29` | `#eef2f6` |
| Panel | `#1b2839` | `#ffffff` |
| Primary text | `#f0f3f7` | `#21334c` |
| Secondary text | `#adbbcf` | `#586c84` |
| Accent | `#abc7ff` | `#315fa6` |
| Warm state | `#f1bd85` | `#855124` |
| Borders | `#35465d` | `#ced9e6` |

Small text uses the secondary token rather than faint opacity. Primary and secondary text pairs clear WCAG AA's 4.5:1 threshold against their panel backgrounds. Focus rings use the accent and four-pixel offset. Status, event type and selection also have text, labels or marker shapes, so colour is not the only signal.

Space Grotesk Variable carries the wordmark, elapsed days, headings and source text. IBM Plex Mono carries time, provenance and control captions. Both are self-hosted Fontsource packages with OFL licences retained in the installed packages; no remote font provider is contacted. Display count is 80px maximum on desktop, 52px on phones; body records are 17px/1.6 and 16px/1.6 respectively. Utility type is 10-13px with readable line height. Controls use 36-44px targets except the calendar's inherently dense date grid, which also supports arrow-key navigation.

## Components and states

- **Clock:** ticks each second; label describes the latest relevant update. Exact source UTC time and reset kind remain visible. No decorative hover motion on the count.
- **Check:** disables overlapping requests; feedback states collection time or retryable refresh failure. Source time never substitutes for collection time. A missing collection time says unavailable.
- **Freshness:** muted source receipt when healthy; amber when older than 20 minutes, partial or failed. The separate 30-second refresh cadence describes the browser, not the upstream collector.
- **Calendar:** solid blue full records, amber banked records with a centre cutout, dashed low-fill cells when the day includes an announcement, subdued cells outside coverage and an outlined selected day. Tooltips name source dates and announcement/report basis. The legend says no record.
- **Feed:** three records initially; older updates reveal six more. Resets includes delivery, planned resets and timing revisions; Notes includes hints and clarifications. Expand shows original reply context and UTC time. Date and category filters combine and clear independently.
- **Failure/empty:** retained records remain through a failed request. A filtered empty day explains how to clear it. Missing parent context is labelled. Source details remain available in the footer.
- **Theme:** dark by default. Explicit light/dark preference and sound preference persist locally. The optional light palette retains identical hierarchy.

## Assets and motion

Keep the existing transparent ink sketch and profile image. Credits, generation provenance and audio licence remain in ASSETS.md. The terminal/favicon and short key burst are code-native SVG. The README preview is an actual rendered recorded-source view, with no invented live status.

Only the cap travels 17px on a press. The recorded press/release pair requires a gesture; mute persists. The 520ms SVG burst, short source-outlook typing and spring control feedback are bounded. Reduced motion suppresses travel, blinking, transitions and cell scaling, reveals the whole outlook, and retains a static press burst. Native Enter/Space activation works.

## Acceptance and review

Frozen checklist: desktop 1280px; mobile 390px and 320px; optional light theme; exact time provenance; seconds tick; calendar/year/date filtering; feed/category/context/source links; refresh and background polling; failed refresh retains data and recovers; older data cannot replace newer data; reduced motion and keyboard focus; local image/font loading; no runtime errors or document overflow. Production build, typecheck and deterministic collector regressions are required.

Review uses three sequential solo passes: functional coverage, token/system consistency, visual craft. At most three render rounds; evidence and review notes stay in ignored `output/redesign-qa/`. Browser checks use controlled snapshot responses, and do not claim a new upstream collection was made.
