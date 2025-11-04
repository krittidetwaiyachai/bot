@echo off
TITLE Topup Bot
cd /d "%~dp0"

:: ==========================================
::   Topup Bot Launcher
::   Author: KAIJIIEOW
::   Version: 1.0
:: ==========================================

type ".git\banner.txt"

echo.
echo.
echo              Author: KAIJIIEOW
echo              Project: Topup Bot
echo.
echo [System] Starting Bot...
timeout /t 1 >nul

echo [System] Deploying Slash Commands...
call node deploy-commands.js
if errorlevel 1 (
    echo Deploy command failed!
)

echo [System] Starting Main Bot Process (Press CTRL+C to stop)...
call node index.js
if errorlevel 1 (
    echo Bot crashed!
)

echo [System] Bot process stopped.
cmd /k
