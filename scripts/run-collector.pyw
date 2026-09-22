"""Run the PC collector without allocating a console, including at process startup."""
import os
from pathlib import Path
import subprocess
import sys


def main():
    runner = Path(__file__).resolve().with_name('poll-hosted.ps1')
    powershell = Path(os.environ['WINDIR']) / 'System32/WindowsPowerShell/v1.0/powershell.exe'
    config = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(os.environ['LOCALAPPDATA']) / 'ResetMonitor/config.json'
    try:
        result = subprocess.run(
            [str(powershell), '-NoProfile', '-NonInteractive', '-WindowStyle', 'Hidden',
             '-ExecutionPolicy', 'Bypass', '-File', str(runner), '-ConfigPath', str(config)],
            stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
            creationflags=subprocess.CREATE_NO_WINDOW, timeout=150,
        )
        return result.returncode
    except (OSError, subprocess.TimeoutExpired):
        # The old receipt goes stale, and Task Scheduler records a failed run.
        return 1


if __name__ == '__main__':
    sys.exit(main())
