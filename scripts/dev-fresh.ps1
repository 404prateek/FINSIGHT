# FinSight: Kill processes on 3000/3001, remove Next dev lock, then start dev server.
# Run: .\scripts\dev-fresh.ps1   OR   npm run dev:fresh

$ErrorActionPreference = "SilentlyContinue"

Write-Host "Stopping processes on port 3000 and 3001..." -ForegroundColor Yellow
$pids = @()
foreach ($port in @(3000, 3001)) {
    $line = netstat -ano | findstr "LISTENING" | findstr ":$port "
    if ($line) {
        $parts = $line.Trim() -split '\s+'
        $pid = $parts[-1]
        if ($pid -match '^\d+$') {
            $pids += $pid
        }
    }
}
$pids = $pids | Select-Object -Unique
foreach ($p in $pids) {
    try {
        Stop-Process -Id $p -Force
        Write-Host "  Killed PID $p" -ForegroundColor Green
    } catch {}
}

Start-Sleep -Seconds 2

$lockPath = Join-Path $PSScriptRoot "..\.next\dev\lock"
if (Test-Path $lockPath) {
    Remove-Item $lockPath -Force
    Write-Host "Removed .next/dev/lock" -ForegroundColor Green
}

Write-Host "Starting Next.js dev server..." -ForegroundColor Cyan
Set-Location (Join-Path $PSScriptRoot "..")
npm run dev
