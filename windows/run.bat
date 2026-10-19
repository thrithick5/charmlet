@echo off
setlocal
title Charmlet - Desktop Charm

echo ========================================================
echo   Charmlet - Personal Desktop Charm (Windows Edition)
echo ========================================================
echo.
echo Launching your desktop charm overlay...
echo.

:: 1. Try launching the packaged native Windows desktop overlay
if exist "%~dp0dist\Charmlet-win32-x64\Charmlet.exe" (
    start "" "%~dp0dist\Charmlet-win32-x64\Charmlet.exe"
    goto :done
)

:: 2. Check if installed via Charmlet-Setup.exe
if exist "%LOCALAPPDATA%\Programs\Charmlet\Charmlet.exe" (
    start "" "%LOCALAPPDATA%\Programs\Charmlet\Charmlet.exe"
    goto :done
)

:: 3. Try running with local Electron in development mode
if exist "%~dp0main.js" (
    where npx >nul 2>nul
    if %ERRORLEVEL% equ 0 (
        cd /d "%~dp0"
        start "" npx electron .
        goto :done
    )
)

echo ERROR: Could not find Charmlet.exe. Please install via Charmlet-Setup.exe or extract Charmlet-Windows.zip.
pause

:done
