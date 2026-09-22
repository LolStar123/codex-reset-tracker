param([string]$ConfigPath = "$env:LOCALAPPDATA\ResetMonitor\config.json")
$ErrorActionPreference = 'Stop'
$config = Get-Content -LiteralPath $ConfigPath -Raw | ConvertFrom-Json
if (!(Test-Path -LiteralPath $config.secretPath)) { throw 'The encrypted site credential is missing. Restore the configuration for this Windows user first.' }
$runner = Join-Path $PSScriptRoot 'run-collector.pyw'
$pythonw = (& python -c "import pathlib,sys; print(pathlib.Path(sys.executable).with_name('pythonw.exe'))").Trim()
if ($LASTEXITCODE -ne 0 -or !(Test-Path -LiteralPath $pythonw)) { throw 'A working Python installation with pythonw.exe is required for console-free startup.' }
$user = [Security.Principal.WindowsIdentity]::GetCurrent().Name
$action = New-ScheduledTaskAction -Execute $pythonw -Argument ('"{0}" "{1}"' -f $runner,$ConfigPath)
$interval = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes 1)
$login = New-ScheduledTaskTrigger -AtLogOn -User $user
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Minutes 3)
$principal = New-ScheduledTaskPrincipal -UserId $user -LogonType Interactive -RunLevel Limited
Register-ScheduledTask -TaskName 'Reset Monitor - collection' -Action $action -Trigger @($interval,$login) -Settings $settings -Principal $principal -Description 'Collect reset news every minute while this Windows user is logged in; keep local health logs.' -Force | Out-Null
Start-ScheduledTask -TaskName 'Reset Monitor - collection'
Write-Output 'Installed and started Reset Monitor - collection (every minute, plus login).'
