@echo off
chcp 65001 >nul
setlocal
set "APPDIR=%ProgramFiles%\TwinDesk\resources\app"
net session >nul 2>&1
if not "%errorlevel%"=="0" (
  powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
  exit /b
)
if not exist "%APPDIR%" (
  echo.
  echo 没有找到 TwinDesk 安装目录。
  echo 请先运行 TwinDesk-Setup-2.4.0-原版安装包.exe 完成安装，再运行本文件。
  echo.
  pause
  exit /b 1
)
robocopy "%~dp0app" "%APPDIR%" /E /NFL /NDL /NJH /NJS >nul
robocopy "%~dp0backup" "%APPDIR%\_zh_backup" /E /NFL /NDL /NJH /NJS >nul
powershell -NoProfile -Command "Copy-Item -LiteralPath '%~dp0还原英文界面.cmd' -Destination ([Environment]::GetFolderPath('Desktop')) -Force"
echo.
echo 汉化完成！请重新打开 TwinDesk。
echo 桌面上已放置 还原 TwinDesk 英文界面.cmd，需要时可以恢复英文。
echo.
pause
