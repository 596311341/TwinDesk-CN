@echo off
chcp 65001 >nul
setlocal
set "APP=C:\Program Files\TwinDesk\resources\app"
net session >nul 2>&1
if not "%errorlevel%"=="0" (
  powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
  exit /b
)
if not exist "%APP%\_zh_backup" (
  echo 没有找到备份目录：%APP%\_zh_backup
  pause
  exit /b 1
)
robocopy "%APP%\_zh_backup" "%APP%" *.html /S /NFL /NDL /NJH /NJS >nul
robocopy "%APP%\_zh_backup\windows" "%APP%\windows" ipc.js /NFL /NDL /NJH /NJS >nul
robocopy "%APP%\_zh_backup\shared" "%APP%\shared" traymenu.js /NFL /NDL /NJH /NJS >nul
if exist "%APP%\shared\i18n-zh.js" del /f /q "%APP%\shared\i18n-zh.js"
echo.
echo 已恢复英文界面，请重新打开 TwinDesk。
echo.
pause
