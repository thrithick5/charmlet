@echo off
setlocal
title Charmlet - Desktop Charm

echo ========================================================
echo   Charmlet - Personal Desktop Charm (Windows Edition)
echo ========================================================
echo.
echo Launching your desktop charm...
echo.

set "HTML_FILE=%~dp0web\charm.html"
if not exist "%HTML_FILE%" set "HTML_FILE=%~dp0charm.html"

:: 1. Try launching with Microsoft Edge in standalone app window
where msedge >nul 2>nul
if %ERRORLEVEL% equ 0 (
    start "" msedge --app="file:///%HTML_FILE%" --window-size=380,560 --window-position=960,0
    goto :done
)

:: 2. Try Google Chrome in standalone app window
where chrome >nul 2>nul
if %ERRORLEVEL% equ 0 (
    start "" chrome --app="file:///%HTML_FILE%" --window-size=380,560 --window-position=960,0
    goto :done
)

:: 3. Fallback: default web browser
start "" "%HTML_FILE%"

:done
echo Desktop charm launched! You can close this window.
