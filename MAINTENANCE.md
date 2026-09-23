> Historical Sites/PC deployment notes. The current GitHub setup is documented in [GITHUB.md](GITHUB.md).

# PC collector: maintenance

The task is installed as **Reset Monitor - collection**. It runs every minute and
when you log in, without leaving a console window open. No browser, editor or Codex
session needs to stay open. Your PC must be awake, online and logged into your
normal Windows account. Locking Windows is fine; signing out stops this task.

The PC script calls the site's authenticated collection endpoint. The hosted
scraper fetches Tibo's posts/replies, filters them and writes the shared database.
Open pages receive those updates through their existing 30-second polling.
No manual tweet editing or site redeployment is needed.

## Normal upkeep

- Check the latest receipt occasionally, and after a long outage. There is no
  configured email or push alert; failures are currently recorded in files.
- Keep this project folder at its current location. The scheduled task references
  the script inside it. If you move it, run the installer from the new location.
- Leave the site available and the encrypted credential in place. Avoid copying
  the credential into messages, screenshots or a source repository.
- No npm install, local development server or manual script start is required for
  ordinary scheduled collection. Keep the installed Python available: pythonw
  launches built-in Windows PowerShell with CREATE_NO_WINDOW, preventing a console
  from appearing even briefly. If Python moves or is replaced, rerun the installer.

Latest receipt:
`C:\Users\AtulS\AppData\Local\ResetMonitor\last-check.json`

Daily logs:
`C:\Users\AtulS\Documents\Python Scripts\reset-monitor\output\collector\`

Logs use UTC timestamps, contain health metadata rather than credentials or tweet
bodies, and retain 30 days. `success: true`, `status: ok` and a recent `checkedAt`
mean a healthy source check. An unchanged post count just means nothing new was
retained. `latestPostAt` can legitimately be old when Tibo has not posted news.

## Readable status

Open PowerShell and run this one-off command:

```powershell
& 'C:\Users\AtulS\Documents\Python Scripts\reset-monitor\scripts\monitor-status.ps1'
```

It reports OK, PAUSED, STALE or NEEDS ATTENTION, plus the latest source check and
failure count. STALE means no PC receipt in over ten minutes. The status script
does not start a background process.

## Run now, pause or resume

Open **Task Scheduler > Task Scheduler Library**, select **Reset Monitor - collection**,
then use **Run**, **Disable** or **Enable**. After enabling, use Run for an immediate
check. The next normal run is scheduled every minute.

Equivalent one-off PowerShell commands:

```powershell
Start-ScheduledTask -TaskName 'Reset Monitor - collection'
Disable-ScheduledTask -TaskName 'Reset Monitor - collection'
Enable-ScheduledTask -TaskName 'Reset Monitor - collection'
```

Choose the command for the action you want; do not run all three in sequence.
Disabling prevents future PC runs, but does not stop a run already in progress.
Visitors can still trigger collection through the existing hosted app.

Task Scheduler's last result `0x0` means the runner succeeded. `0x1` means it
recorded an unsuccessful check; read the receipt for the diagnosis. A currently
running task has not produced its final exit code yet.

## What to do when it fails

| Receipt/status | Action |
| --- | --- |
| PAUSED | Enable the task, then Run. |
| STALE | Check that you are logged in, the PC is awake, and the task is enabled. |
| Cannot reach the hosted collector | Check internet and whether the site opens. It will retry automatically. |
| Source collection failed / HTTP 503 | The site could not finish a source check. It backs off and retries; investigate if it persists. |
| Source check incomplete | History retrieval or reply catch-up is incomplete. Read subsequent logs; persistent errors need investigation. |
| Site access denied / HTTP 401 or 403 | Renew the Sites collector credential for the existing site and encrypt it under this Windows account. Signing into the website in Chrome alone does not renew the task credential. |
| Cannot decrypt the site credential | Use the original Windows account. A new machine/account needs fresh credential provisioning. |
| Invalid or stale collection health | The endpoint is not reporting a recent successful check. The runner deliberately treats this as a failure. |

The credential is protected with Windows DPAPI at
`%LOCALAPPDATA%\ResetMonitor\sites-access.dpapi`. Configuration lives alongside it
in `config.json`. Credential rotation requires the site's management access;
there is no unauthenticated self-renewal script. Ask Codex to renew the PC
collector credential if that specific failure occurs, without pasting the old
credential. Domain/hosting migrations also require checking the endpoint and its
authentication, rather than blindly changing the URL.

## Repair or reinstall the scheduled task

With the existing config/credential still present, run:

```powershell
& 'C:\Users\AtulS\Documents\Python Scripts\reset-monitor\scripts\install-pc-collector.ps1'
```

This recreates the named task with the current script path, one-minute and login
triggers, battery operation, missed-run handling and no overlapping instances.
It starts a check immediately. It does not change your power settings, wake the
PC, restart it or require a stored Windows password.

## Sleep, downtime and accuracy

While the PC sleeps or is off, the website remains online with stored data. The
task is configured to catch up missed starts when available and also runs at
login. It resumes source collection from saved state, subject to the provider's
available history. Long outages can leave gaps; deleted or unavailable posts
cannot be guaranteed recoverable.

The current source is a third-party public API, and relevance/timing extraction
uses rules. Successful checks prove the request worked, not that every possible
tweet was captured or interpreted correctly. Confirmed resets mean a source
reported delivery, not direct measurement of every user's account balance.

No new scheduler, paid API or domain is required for this PC-driven setup. The
independent cloud scheduler remains unused.
