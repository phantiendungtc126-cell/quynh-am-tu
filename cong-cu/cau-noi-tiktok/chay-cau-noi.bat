@echo off
chcp 65001 >nul
title Cau noi TikTok - Cong Vien Cau Vong
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Chua co Node.js. Tai ban LTS o https://nodejs.org roi chay lai file nay.
  pause
  exit /b 1
)
if not exist node_modules (
  echo Dang cai thu vien lan dau...
  call npm install --no-audit --no-fund
)
echo.
set /p KENH=Nhap ten kenh TikTok dang live (khong can @), hoac go thu de chay thu:
if /i "%KENH%"=="thu" (
  node cau-noi.js --thu
) else (
  node cau-noi.js %KENH%
)
pause
