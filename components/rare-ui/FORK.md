# Rare UI local source fork
Upstream: https://github.com/swamimalode07/rare-ui
Commit: 539567414bac024260ed696c9647c737380514a7
License: MIT; original license retained alongside the component.

The full upstream repository is cloned under ../vendor/rare-ui. This application
vendors and actively imports its GitHub Activity component. Local changes add
reset labels, banked markers, disabled coverage dates, accessible button cells,
keyboard navigation, selected-date filtering and an optional hidden heading.
Month-label calculation, colour scale and animated tooltip positioning remain from
Rare UI. Initial cell animations are disabled to keep SSR hydration consistent
with reduced-motion preferences. No repository statistics are shown.
This is a local component fork; no GitHub-hosted account fork was created.

Second pass adds spring cell hover/press feedback and explicit keyboard tab stops
so reduced-motion hydration preserves the same accessible markup. Banked reset
cells receive an independent amber treatment in the application stylesheet.
