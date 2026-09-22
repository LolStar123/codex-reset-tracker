param([string]$ConfigPath = "$env:LOCALAPPDATA\ResetMonitor\config.json")
$ErrorActionPreference = 'Stop'
$config = Get-Content -LiteralPath $ConfigPath -Raw | ConvertFrom-Json
if (!(Test-Path -LiteralPath $config.secretPath)) { throw 'The encrypted site credential is missing. Restore the configuration for this Windows user first.' }
$runner = Join-Path $PSScriptRoot 'poll-hosted.ps1'
$user = [Security.Principal.WindowsIdentity]::GetCurrent().Name
$action = New-ScheduledTaskAction -Execute (Join-Path $env:WINDIR 'System32\WindowsPowerShell\v1.0\powershell.exe') -Argument ('-NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File "{0}" -ConfigPath "{1}"' -f $runner,$ConfigPath)
$interval = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes 1)
$login = New-ScheduledTaskTrigger -AtLogOn -User $user
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Minutes 3)
$principal = New-ScheduledTaskPrincipal -UserId $user -LogonType Interactive -RunLevel Limited
Register-ScheduledTask -TaskName 'Reset Monitor - collection' -Action $action -Trigger @($interval,$login) -Settings $settings -Principal $principal -Description 'Collect reset news every minute while this Windows user is logged in; keep local health logs.' -Force | Out-Null
Start-ScheduledTask -TaskName 'Reset Monitor - collection'
Write-Output 'Installed and started Reset Monitor - collection (every minute, plus login).'
