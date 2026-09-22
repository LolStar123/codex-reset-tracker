# Public launch: PC-driven Reset Monitor

Checked 22 September 2026. The current site is hosted and owner-private. No domain has been purchased and public access has not been enabled.

## Name shortlist

My pick is **TiboWatch**. It fits posts, replies, hints and delays, while leaving the small header free to say “codex reset tracker”.

| Domain | Registry check | Fit |
| --- | --- | --- |
| tibowatch.com | No registry record | Short, recognisable, covers more than announcements |
| resetplease.com | No registry record | Playful; less obvious that it follows Codex |
| codexrefill.com | No registry record | Clear Codex connection; “refill” is less exact than “reset” |
| tibotracker.com | No registry record | Clear, though less distinctive |
| tiboresets.com | No registry record | Closest to the requested name, but easily confused with the existing singular site |
| tibotimer.com | No registry record | Short; sounds more like a countdown than a feed |
| bankedreset.com | No registry record | Memorable, but narrower than the site's purpose |
| resettrickle.com | No registry record | Describes the small updates; less immediately clear |
| codexresetwatch.com | No registry record | Explicit but long |

The .com registry returned no record for these names at 12:21 UTC. This is a shortlist, not a purchase guarantee or a price quote. A registrar must confirm availability and the first-year and renewal prices at checkout. The reproducible query is `https://rdap.verisign.com/com/v1/domain/DOMAIN` using the .com service listed in [IANA's RDAP bootstrap](https://data.iana.org/rdap/dns.json). The full receipt is in `output/domain-research.json`.

Registered names: tiboreset.com, codexreset.com, codexresets.com, gptreset.com, gptresets.com, resettracker.com, resetwatch.com, gotreset.com, resetwhen.com, whenreset.com, tokenrefill.com, resetpulse.com, resetping.com and resetlog.com.

[tiboreset.com](https://tiboreset.com/) is already an active tracker for the same topic. I would choose a distinct name rather than the plural spelling.

## What needs doing

1. Choose and register the domain. [Cloudflare Registrar](https://www.cloudflare.com/domains/) is one option; it displays registration and renewal prices and charges without a registrar markup. Check the actual quote before paying. Domain registration is separate from hosting.
2. Connect it to the existing Sites project. The current connector supports custom domains, so a hosting migration is not required. Adding the chosen hostname returns the exact DNS and ownership-validation records. Use the returned A records for an apex name or CNAME for a subdomain, plus all validation records. Wait for domain status and HTTPS to become active. Do not guess DNS targets or point the domain at the Git repository.
3. Before public access, give the collection endpoint its own server-side secret and require that secret for POST requests. Store the PC copy under Windows DPAPI. Make the public page and monitor API read stored data without starting collection. Current collection authentication relies on the whole site being private; simply opening public access would remove that boundary.
4. Enable public read access, then verify the custom hostname in a signed-out browser. Verify that anonymous users can read the feed, cannot invoke collection, and can see newly collected data after refresh. Check both mobile and desktop. Set the chosen name in the title, description, social preview and canonical URL.
5. Keep the PC's existing one-minute scheduled task. Update its endpoint and credential only if the protected collector address changes. Run one real collection, verify the shared database changed or the successful-check timestamp advanced, and verify that a second browser sees the same result. Test the failure state too.

These are remaining launch steps, not actions already performed. Public access and domain ownership are the unresolved decisions.

## How it operates

`PC scheduled task → protected hosted collector → public Tibo timeline + replies → classification → shared database → visitors' browsers`

The PC sends the trigger; the hosted collector fetches and stores the posts. It does not open X on your screen. Every visitor reads the same stored feed. Open pages currently refresh every 30 seconds. Successful source checks are attempted about once a minute, so this is polling, not an instant Twitter webhook. Provider caching and outages can add delay.

The website remains hosted when your PC is off. Unattended PC-driven checks require your PC to be awake, online and signed into your Windows account. The current private site's page requests can also trigger a check; the public launch design above intentionally makes collection the PC task's job. Once that change is made, visitors see stored data while the PC is unavailable. Collection resumes at login or the next available run and catches up within the source's retained history.

This has no access to OpenAI's internal reset-propagation logs. “Confirmed” means a public source explicitly reports delivery, not proof that every account received it. The feed uses rules, so ambiguous wording, missing/deleted replies and provider gaps remain possible. The archive does not pretend otherwise.

Use [MAINTENANCE.md](MAINTENANCE.md) for task status, failures, credential renewal and local logs. The runner stays windowless. There is no need to expose your PC to the internet or move to a cloud scheduler for this plan.

## Copy check

Claims above are tied to the current code, Sites capability response, registry receipt or linked vendor page. No domain price, full-history coverage or instant-delivery guarantee is invented. Rejected wording: “seamless launch”, “fully autonomous forever”, “every tweet guaranteed”.
