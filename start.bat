@echo off
chcp 65001 >nul
title AgentScope
cd /d "%~dp0"
echo Launching AgentScope...
echo.
echo If a webview window doesnt appear, open http://localhost:3333 in your browser.
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0launcher.ps1"
pause
