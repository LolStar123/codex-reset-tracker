$ErrorActionPreference = 'Stop'
$configPath = "$env:LOCALAPPDATA\ResetMonitor\config.json"
$config = Get-Content -LiteralPath $configPath -Raw | ConvertFrom-Json
$receipt = Get-Content -LiteralPath $config.receiptPath -Raw | ConvertFrom-Json
$task = Get-ScheduledTask -TaskName 'Reset Monitor - collection'
$info = Get-ScheduledTaskInfo -TaskName $task.TaskName
$age = ([DateTimeOffset]::UtcNow - [DateTimeOffset]::Parse($receipt.finishedAt)).TotalMinutes
$health = if ($task.State -eq 'Disabled') { 'PAUSED' } elseif ($age -gt 10) { 'STALE - no recent PC check' } elseif ($receipt.success) { 'OK' } else { 'NEEDS ATTENTION' }
[pscustomobject]@{
    Health = $health
    Task = [string]$task.State
    LastPCCheck = ([DateTimeOffset]::Parse($receipt.finishedAt)).ToLocalTime().ToString('dd MMM yyyy HH:mm:ss zzz')
    LastSuccessfulSourceCheck = $receipt.lastSuccessfulCheckAt
    RetainedPosts = $receipt.postCount
    ConsecutiveFailures = $receipt.consecutiveFailures
    NextRun = $info.NextRunTime
    Error = $receipt.error
    Logs = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\output\collector'))
} | Format-List
