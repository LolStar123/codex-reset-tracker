param([ValidateSet('ok','stale','partial','network')][string]$Mode, [string]$TestDirectory)
$ErrorActionPreference='Stop'
New-Item -ItemType Directory -Path $TestDirectory -Force | Out-Null
$secretPath=Join-Path $TestDirectory 'test.dpapi'
ConvertTo-SecureString 'TEST-ONLY-NOT-A-CREDENTIAL' -AsPlainText -Force | ConvertFrom-SecureString | Set-Content -LiteralPath $secretPath
$configPath=Join-Path $TestDirectory 'config.json'
@{url='https://example.invalid';secretPath=$secretPath;receiptPath=(Join-Path $TestDirectory 'last-check.json')} | ConvertTo-Json | Set-Content -LiteralPath $configPath
function Invoke-RestMethod {
    param($Method,$Uri,$Headers,$MaximumRedirection,$TimeoutSec)
    if($Method -ne 'Post' -or $Uri.AbsolutePath -ne '/api/collect' -or $MaximumRedirection -ne 0){throw 'Unexpected collection request'}
    if($Mode -eq 'network'){throw 'TEST-ONLY-NOT-A-CREDENTIAL must never enter the log'}
    $checked=[DateTime]::UtcNow
    if($Mode -eq 'stale'){$checked=$checked.AddHours(-1)}
    return @{checkedAt=$checked.ToString('o');latestPostAt=$null;postCount=0;resetCount=0;status=$(if($Mode -eq 'partial'){'partial'}else{'ok'})}
}
& (Join-Path $PSScriptRoot '..\scripts\poll-hosted.ps1') -ConfigPath $configPath -LogDirectory (Join-Path $TestDirectory 'logs')
exit $LASTEXITCODE
