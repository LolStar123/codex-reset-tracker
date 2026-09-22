param([string]$ConfigPath = "$env:LOCALAPPDATA\ResetMonitor\config.json")
$ErrorActionPreference = 'Stop'
$config = Get-Content -LiteralPath $ConfigPath -Raw | ConvertFrom-Json
$receipt = @{ attemptedAt = [DateTime]::UtcNow.ToString('o'); success = $false }
try {
    $secret = Get-Content -LiteralPath $config.secretPath -Raw | ConvertTo-SecureString
    $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secret)
    try {
        $token = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
        $result = Invoke-RestMethod -Uri ($config.url.TrimEnd('/') + '/api/monitor') -Headers @{ 'OAI-Sites-Authorization' = "Bearer $token" } -TimeoutSec 120
    } finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
        $token = $null
    }
    if (!$result.checkedAt -or !$result.posts) { throw 'The monitor returned an invalid snapshot.' }
    $receipt.checkedAt = $result.checkedAt
    $receipt.postCount = $result.posts.Count
    $receipt.collectionError = $result.error
    $receipt.success = !$result.error
} catch {
    # Avoid storing request headers or detailed transport errors.
    $receipt.error = 'The hosted collection check failed.'
} finally {
    $receipt.finishedAt = [DateTime]::UtcNow.ToString('o')
    $receipt | ConvertTo-Json | Set-Content -LiteralPath $config.receiptPath -Encoding UTF8
}
if (!$receipt.success) { exit 1 }
