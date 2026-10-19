# install.ps1 — 1-Click Zero-Friction Installer for Charmlet (Windows 10 & 11)
# Bypasses Windows SmartScreen "Run anyway" warning by stripping Mark-of-the-Web via Unblock-File.
#
# Usage (run in PowerShell):
#   irm https://raw.githubusercontent.com/thrithick5/charmlet/main/scripts/install.ps1 | iex

$ErrorActionPreference = 'Stop'
Write-Host "🍀 Installing Charmlet for Windows..." -ForegroundColor Green

$repo = "thrithick5/charmlet"
$url = "https://raw.githubusercontent.com/$repo/main/web/downloads/Charmlet-Setup.exe"
$tmpDir = Join-Path $env:TEMP "charmlet-install"
if (-not (Test-Path $tmpDir)) { New-Item -ItemType Directory -Path $tmpDir | Out-Null }
$installerPath = Join-Path $tmpDir "Charmlet-Setup.exe"

Write-Host "==> Downloading latest Charmlet installer..." -ForegroundColor Cyan
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Invoke-WebRequest -Uri $url -OutFile $installerPath -UseBasicParsing

Write-Host "==> Unblocking file to bypass SmartScreen 'Run Anyway' prompt..." -ForegroundColor Cyan
# Unblock-File strips Zone.Identifier (Mark of the Web) so Defender SmartScreen doesn't block it
Unblock-File -Path $installerPath

Write-Host "==> Launching Charmlet Installer..." -ForegroundColor Cyan
Start-Process -FilePath $installerPath -ArgumentList "/S" -Wait

Write-Host "`n✨ Charmlet successfully installed!" -ForegroundColor Green
Write-Host "   Look for the four-leaf clover charm icon in your taskbar system tray (near the clock)."

# Launch Charmlet immediately
$appPath = Join-Path $env:LOCALAPPDATA "Programs\Charmlet\Charmlet.exe"
if (Test-Path $appPath) {
    Start-Process -FilePath $appPath
}
