# launch-emulator.ps1
# Always kills port 8085 and starts a fresh Expo dev server on that port.
# exp:// address: exp://127.0.0.1:8085
# From mobile/ directory:
# npm run emulator
# or directly:
# powershell -ExecutionPolicy Bypass -File ./launch-emulator.ps

param(
    [string]$Device = "emulator-5554"
)

$PORT = 8085

Write-Host "==> Killing any process on port $PORT..." -ForegroundColor Cyan
$conn = netstat -ano | Select-String ":$PORT\s.*LISTENING"
if ($conn) {
    $procId = ($conn.ToString().Trim() -split '\s+')[-1]
    Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
    Write-Host "    Killed PID $procId" -ForegroundColor Yellow
} else {
    Write-Host "    Port $PORT is free" -ForegroundColor Green
}

Write-Host "==> Force-stopping app on $Device..." -ForegroundColor Cyan
adb -s $Device shell am force-stop com.koobstel.app 2>&1 | Out-Null

Write-Host "==> Clearing app data on $Device..." -ForegroundColor Cyan
adb -s $Device shell pm clear com.koobstel.app 2>&1 | Out-Null
Write-Host "    App data cleared" -ForegroundColor Green

Write-Host "==> Starting Expo dev server on port $PORT (exp://127.0.0.1:$PORT)..." -ForegroundColor Cyan
Write-Host "    The app will open automatically on $Device" -ForegroundColor White
Write-Host ""

# REACT_NATIVE_PACKAGER_HOSTNAME ensures the emulator always connects to 127.0.0.1
$env:REACT_NATIVE_PACKAGER_HOSTNAME = "127.0.0.1"

npx expo start --port $PORT --android
