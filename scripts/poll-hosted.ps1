param(
    [string]$ConfigPath = "$env:LOCALAPPDATA\ResetMonitor\config.json",
    [string]$LogDirectory = (Join-Path $PSScriptRoot '..\output\collector')
)
$ErrorActionPreference = 'Stop'
$mutex = New-Object System.Threading.Mutex($false, 'Local\ResetMonitorCollection')
$locked = $false
try {
    try { $locked = $mutex.WaitOne(0) } catch [System.Threading.AbandonedMutexException] { $locked = $true }
    if (!$locked) { exit 0 }
    $receiptPath = Join-Path (Split-Path -Parent $ConfigPath) 'last-check.json'
    $receipt = [ordered]@{ attemptedAt = [DateTime]::UtcNow.ToString('o'); success = $false; status = 'failed'; lastSuccessfulCheckAt = $null; consecutiveFailures = 0 }
    $stage = 'configuration'
    try {
        $config = Get-Content -LiteralPath $ConfigPath -Raw | ConvertFrom-Json
        if ($config.receiptPath) { $receiptPath = $config.receiptPath }
        if (Test-Path -LiteralPath $receiptPath) {
            try {
                $previous = Get-Content -LiteralPath $receiptPath -Raw | ConvertFrom-Json
                $receipt.lastSuccessfulCheckAt = $previous.lastSuccessfulCheckAt
                if (!$receipt.lastSuccessfulCheckAt -and $previous.success) { $receipt.lastSuccessfulCheckAt = $previous.checkedAt }
                $receipt.consecutiveFailures = [int]$previous.consecutiveFailures
            } catch { # A damaged old receipt must not stop a new collection.
            }
        }
        $url = [Uri]($config.url.TrimEnd('/') + '/api/collect')
        if ($url.Scheme -ne 'https' -or $url.UserInfo -or $url.Query -or $url.Fragment) { throw 'Invalid hosted endpoint' }
        $stage = 'credential'
        $secret = (Get-Content -LiteralPath $config.secretPath -Raw).Trim() | ConvertTo-SecureString
        $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secret)
        try {
            $token = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
            $stage = 'request'
            $result = Invoke-RestMethod -Method Post -Uri $url -Headers @{
                'OAI-Sites-Authorization' = "Bearer $token"
                'Accept' = 'application/json'
            } -MaximumRedirection 0 -TimeoutSec 120
        } finally {
            [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
            $token = $null
        }
        $stage = 'response'
        if (!$result.checkedAt -or $null -eq $result.postCount -or $result.status -notin @('ok','partial','failed')) { throw 'Invalid health response' }
        $checked = [DateTimeOffset]::Parse($result.checkedAt).ToUniversalTime()
        $age = ([DateTimeOffset]::UtcNow - $checked).TotalSeconds
        if ($age -gt 600 -or $age -lt -60) { throw 'Stale source check' }
        $receipt.checkedAt = $result.checkedAt
        $receipt.latestPostAt = $result.latestPostAt
        $receipt.postCount = [int]$result.postCount
        $receipt.resetCount = [int]$result.resetCount
        $receipt.status = $result.status
        $receipt.success = $result.status -eq 'ok'
        if ($receipt.success) {
            $receipt.lastSuccessfulCheckAt = $result.checkedAt
            $receipt.consecutiveFailures = 0
        } else {
            $receipt.error = if ($result.status -eq 'partial') { 'Source check incomplete; history or reply catch-up needs attention.' } else { 'Source collection failed.' }
        }
    } catch {
        # Store a diagnosis, never exception text that might include a credential.
        $httpStatus = $null
        if ($_.Exception.Response) { $httpStatus = [int]$_.Exception.Response.StatusCode }
        $receipt.failureStage = $stage
        if ($httpStatus) { $receipt.httpStatus = $httpStatus }
        $receipt.error = switch ($stage) {
            'configuration' { 'Cannot read a valid monitor configuration.' }
            'credential' { 'Cannot decrypt the site credential for this Windows user.' }
            'response' { 'The site returned invalid or stale collection health.' }
            default {
                if ($httpStatus -in @(401,403)) { 'Site access denied; renew the stored credential.' }
                elseif ($httpStatus -eq 503) { 'The hosted collector reports a failed source check; it will retry.' }
                else { 'Cannot reach the hosted collector; check connectivity and site availability.' }
            }
        }
    } finally {
        if (!$receipt.success) { $receipt.consecutiveFailures++ }
        $receipt.finishedAt = [DateTime]::UtcNow.ToString('o')
        New-Item -ItemType Directory -Path (Split-Path -Parent $receiptPath) -Force | Out-Null
        $temporaryReceipt = "$receiptPath.$PID.tmp"
        $receipt | ConvertTo-Json | Set-Content -LiteralPath $temporaryReceipt -Encoding UTF8
        Move-Item -LiteralPath $temporaryReceipt -Destination $receiptPath -Force
        New-Item -ItemType Directory -Path $LogDirectory -Force | Out-Null
        $logRoot = (Resolve-Path -LiteralPath $LogDirectory).Path
        $logPath = Join-Path $logRoot ('collection-' + [DateTime]::UtcNow.ToString('yyyy-MM-dd') + '.jsonl')
        $receipt | ConvertTo-Json -Compress | Add-Content -LiteralPath $logPath -Encoding UTF8
        # Only this logger's dated files are eligible for non-recursive retention cleanup.
        Get-ChildItem -LiteralPath $logRoot -File | Where-Object {
            $_.Name -match '^collection-\d{4}-\d{2}-\d{2}\.jsonl$' -and $_.LastWriteTimeUtc -lt [DateTime]::UtcNow.AddDays(-30)
        } | ForEach-Object { Remove-Item -LiteralPath $_.FullName }
    }
    if (!$receipt.success) { exit 1 }
} finally {
    if ($locked) { $mutex.ReleaseMutex() }
    $mutex.Dispose()
}
