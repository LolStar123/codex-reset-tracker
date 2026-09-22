# Reset Monitor: second design pass

The first layout was rejected as bland. This version treats the monitor as a
personal Codex desk toy: a tactile refresh key is the signature, while the real
status, separate reset clocks, activity and source feed remain the working surface.

Palette: ink #11151f, silver #edf1fa, cobalt #92b1ff, raised slate #1a202d,
banked amber #ffbd86. A cool light theme retains the same visual identity.
Self-hosted Space Grotesk Variable supplies headings and body; IBM Plex Mono
supplies dates and clocks. Both packages retain their upstream font licenses.

A floating key checks the real feed. Spring hover/press feedback applies to main
buttons and calendar cells. Expandable context opens with a short height/opacity
transition. Keyboard controls remain native; reduced motion stops floating,
bouncing and travel. The homepage enters in one short stagger.

Full-reset and banked-reset clocks use independently selected source confirmations.
A combined reset updates both; a promise updates neither. The calendar uses blue
for full resets and amber with an inset marker for banked resets. It remains the
adapted RareUI component and keeps its original attribution.

1000px maximum width; the mobile calendar scrolls within its own card. The reset
key shrinks on mobile. The source feed, filters and coverage disclosures remain.

Source confirmation is distinct from personal account verification. No account
telemetry is uploaded or connected in this release.

## Feed and key revision

The feed is now a narrow UTC date rail with threaded source quotations. Actual
post text replaces summary headings. Replies name the parent author, with the
parent text one click away. Confirmations have a cobalt edge; incoming resets use
amber metadata. Tabs have an uneven ink underline instead of pill containers.
The rail condenses to 38px on mobile, preserving readable source text.

The mascot is a flat pencil-and-ink chibi. A bounded burst of uneven rays, stars
and squiggles appears for 520ms on a press and replays on another press. Reduced
motion shows a static burst. Native pointer and keyboard input use the same
recorded downstroke/upstroke pair, with a softer release and persistent mute.

Acceptance checklist: readable source excerpts, linked parent context, working
filters/calendar, no overflow at 320px, audible sample playback on gesture only,
replayed/cleaned-up burst, reduced motion, independent seconds clocks, and no
hydration errors. Solo rendered review passed the first visual round.
