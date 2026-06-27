@echo off
chcp 65001 >nul
title Zoom Adv AI
cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 (
    echo.
    echo  Node.js is not installed on this device.
    echo  Download it from: https://nodejs.org
    echo  Then run this file again.
    echo.
    pause
    exit /b 1
)

if not exist "node_modules\" (
    echo Installing dependencies...
    call npm.cmd install --strict-ssl=false --cache .\.npm-cache
    if errorlevel 1 exit /b 1
)

echo Starting Zoom Adv AI...
call npm.cmd start
