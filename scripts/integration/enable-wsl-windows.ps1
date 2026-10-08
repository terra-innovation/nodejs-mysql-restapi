# Ejecutar como administrador. No reinicia el equipo ni modifica bases de datos.
$ErrorActionPreference = 'Stop'
$taskRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$taskReportFolder = Join-Path $taskRoot 'coverage\mariadb'
New-Item -ItemType Directory -Path $taskReportFolder -Force | Out-Null
$taskReportPath = Join-Path $taskReportFolder 'windows-wsl-setup.json'
$taskLogPath = Join-Path $taskReportFolder 'windows-wsl-setup.log'
$taskResult = [ordered]@{ startedAt = [DateTime]::UtcNow.ToString('o'); status = 'starting'; restartNeeded = $false }
try {
    $taskIdentity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $taskPrincipal = New-Object Security.Principal.WindowsPrincipal($taskIdentity)
    if (-not $taskPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
        throw 'Se requieren permisos de administrador de Windows.'
    }
    foreach ($taskFeature in @('VirtualMachinePlatform', 'Microsoft-Windows-Subsystem-Linux')) {
        $taskChange = Enable-WindowsOptionalFeature -Online -FeatureName $taskFeature -All -NoRestart
        $taskResult.restartNeeded = $taskResult.restartNeeded -or [bool]$taskChange.RestartNeeded
    }
    & wsl.exe --install --no-distribution --web-download 2>&1 | Out-File -LiteralPath $taskLogPath -Encoding utf8
    $taskResult.wslExitCode = $LASTEXITCODE
    if ($LASTEXITCODE -notin @(0, 3010)) { throw 'WSL no terminó de instalarse. Revisar windows-wsl-setup.log y el estado después de reiniciar.' }
    if ($LASTEXITCODE -eq 3010) { $taskResult.restartNeeded = $true }
    $taskResult.status = 'prepared'
} catch {
    $taskResult.status = 'failed'
    $taskResult.error = $_.Exception.Message
} finally {
    $taskResult.finishedAt = [DateTime]::UtcNow.ToString('o')
    $taskResult | ConvertTo-Json | Set-Content -LiteralPath $taskReportPath -Encoding UTF8
}
if ($taskResult.status -eq 'failed') { exit 1 }
